use if_addrs::{get_if_addrs, IfAddr};
use rand::{distributions::Alphanumeric, Rng};
use serde::Serialize;
use serde_json::Value;
use std::{
  io::{Read, Write},
  net::{IpAddr, SocketAddr, TcpListener, TcpStream, UdpSocket},
  sync::{Arc, Mutex},
  thread,
  time::Duration,
};

const COMPANION_BIND_HOST: &str = "0.0.0.0";
const HEADER_END: &[u8] = b"\r\n\r\n";
const MAX_HEADER_BYTES: usize = 32 * 1024;
const MAX_BODY_BYTES: usize = 12 * 1024 * 1024;

#[derive(Clone)]
pub struct DesktopCompanion {
  shared: Arc<Mutex<CompanionState>>,
}

#[derive(Debug, Clone)]
struct CompanionState {
  running: bool,
  bind_host: String,
  port: u16,
  pair_code: String,
  local_ip: Option<String>,
  outgoing_bundle_json: Option<String>,
  outgoing_bundle_published_at_ms: Option<u64>,
  incoming_bundle_json: Option<String>,
  incoming_bundle_received_at_ms: Option<u64>,
  last_error: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DesktopCompanionStatus {
  running: bool,
  bind_host: String,
  port: u16,
  pair_code: String,
  local_ip: Option<String>,
  local_url: Option<String>,
  outgoing_bundle_available: bool,
  outgoing_bundle_bytes: usize,
  outgoing_bundle_published_at_ms: Option<u64>,
  incoming_bundle_available: bool,
  incoming_bundle_bytes: usize,
  incoming_bundle_received_at_ms: Option<u64>,
  last_error: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct JsonStatus<'a> {
  status: &'a str,
  app: &'a str,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct JsonMessage<'a> {
  status: &'a str,
  message: &'a str,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct JsonPayload<'a> {
  status: &'a str,
  payload: &'a Value,
}

impl DesktopCompanion {
  pub fn start() -> Self {
    let bind_host = COMPANION_BIND_HOST.to_string();
    let listener = TcpListener::bind((COMPANION_BIND_HOST, 0));
    let shared = Arc::new(Mutex::new(CompanionState {
      running: false,
      bind_host,
      port: 0,
      pair_code: generate_pair_code(),
      local_ip: discover_local_ip(),
      outgoing_bundle_json: None,
      outgoing_bundle_published_at_ms: None,
      incoming_bundle_json: None,
      incoming_bundle_received_at_ms: None,
      last_error: None,
    }));

    match listener {
      Ok(listener) => {
        let port = listener.local_addr().map(|address| address.port()).unwrap_or(0);
        if let Ok(mut state) = shared.lock() {
          state.running = true;
          state.port = port;
        }

        let thread_shared = Arc::clone(&shared);
        thread::spawn(move || {
          let _ = listener.set_nonblocking(false);
          for incoming in listener.incoming() {
            match incoming {
              Ok(stream) => {
                let request_shared = Arc::clone(&thread_shared);
                thread::spawn(move || {
                  handle_stream(stream, request_shared);
                });
              }
              Err(error) => {
                if let Ok(mut state) = thread_shared.lock() {
                  state.last_error = Some(error.to_string());
                }
                break;
              }
            }
          }

          if let Ok(mut state) = thread_shared.lock() {
            state.running = false;
          }
        });
      }
      Err(error) => {
        if let Ok(mut state) = shared.lock() {
          state.last_error = Some(error.to_string());
        }
      }
    }

    Self { shared }
  }

  fn status_from_state(state: &CompanionState) -> DesktopCompanionStatus {
    let local_url = if state.running && state.port > 0 {
      state.local_ip.as_ref().map(|ip| format_local_url(ip, state.port))
    } else {
      None
    };

    DesktopCompanionStatus {
      running: state.running,
      bind_host: state.bind_host.clone(),
      port: state.port,
      pair_code: state.pair_code.clone(),
      local_ip: state.local_ip.clone(),
      local_url,
      outgoing_bundle_available: state.outgoing_bundle_json.is_some(),
      outgoing_bundle_bytes: state.outgoing_bundle_json.as_ref().map(|value| value.len()).unwrap_or(0),
      outgoing_bundle_published_at_ms: state.outgoing_bundle_published_at_ms,
      incoming_bundle_available: state.incoming_bundle_json.is_some(),
      incoming_bundle_bytes: state.incoming_bundle_json.as_ref().map(|value| value.len()).unwrap_or(0),
      incoming_bundle_received_at_ms: state.incoming_bundle_received_at_ms,
      last_error: state.last_error.clone(),
    }
  }

  pub fn status(&self) -> DesktopCompanionStatus {
    let discovered_local_ip = discover_local_ip();

    match self.shared.lock() {
      Ok(mut state) => {
        if state.local_ip != discovered_local_ip {
          state.local_ip = discovered_local_ip;
        }

        Self::status_from_state(&state)
      }
      Err(_) => DesktopCompanionStatus {
        running: false,
        bind_host: COMPANION_BIND_HOST.to_string(),
        port: 0,
        pair_code: String::new(),
        local_ip: None,
        local_url: None,
        outgoing_bundle_available: false,
        outgoing_bundle_bytes: 0,
        outgoing_bundle_published_at_ms: None,
        incoming_bundle_available: false,
        incoming_bundle_bytes: 0,
        incoming_bundle_received_at_ms: None,
        last_error: Some("Companion state lock poisoned".to_string()),
      },
    }
  }

  pub fn rotate_pair_code(&self) -> DesktopCompanionStatus {
    let mut state = self.shared.lock().expect("desktop companion state lock poisoned");
    state.pair_code = generate_pair_code();
    state.last_error = None;
    Self::status_from_state(&state)
  }

  pub fn publish_workspace_bundle(&self, bundle_json: String) -> Result<DesktopCompanionStatus, String> {
    serde_json::from_str::<serde_json::Value>(&bundle_json)
      .map_err(|error| format!("Invalid workspace bundle JSON: {error}"))?;

    let mut state = self.shared.lock().map_err(|_| "Desktop companion state lock poisoned".to_string())?;
    state.outgoing_bundle_json = Some(bundle_json);
    state.outgoing_bundle_published_at_ms = Some(now_ms());
    state.last_error = None;
    Ok(Self::status_from_state(&state))
  }

  pub fn take_incoming_workspace_bundle(&self) -> Result<Option<String>, String> {
    let mut state = self.shared.lock().map_err(|_| "Desktop companion state lock poisoned".to_string())?;
    let bundle = state.incoming_bundle_json.take();
    if bundle.is_some() {
      state.last_error = None;
    }
    Ok(bundle)
  }

  pub fn peek_incoming_workspace_bundle(&self) -> Result<Option<String>, String> {
    let state = self.shared.lock().map_err(|_| "Desktop companion state lock poisoned".to_string())?;
    Ok(state.incoming_bundle_json.clone())
  }
}

#[tauri::command]
pub fn desktop_companion_status(companion: tauri::State<'_, DesktopCompanion>) -> DesktopCompanionStatus {
  companion.status()
}

#[tauri::command]
pub fn desktop_companion_rotate_pair_code(companion: tauri::State<'_, DesktopCompanion>) -> DesktopCompanionStatus {
  companion.rotate_pair_code()
}

#[tauri::command]
pub fn desktop_companion_publish_workspace_bundle(
  companion: tauri::State<'_, DesktopCompanion>,
  bundle_json: String,
) -> Result<DesktopCompanionStatus, String> {
  companion.publish_workspace_bundle(bundle_json)
}

#[tauri::command]
pub fn desktop_companion_take_incoming_workspace_bundle(
  companion: tauri::State<'_, DesktopCompanion>,
) -> Result<Option<String>, String> {
  companion.take_incoming_workspace_bundle()
}

#[tauri::command]
pub fn desktop_companion_peek_incoming_workspace_bundle(
  companion: tauri::State<'_, DesktopCompanion>,
) -> Result<Option<String>, String> {
  companion.peek_incoming_workspace_bundle()
}

fn handle_stream(mut stream: TcpStream, shared: Arc<Mutex<CompanionState>>) {
  let _ = stream.set_read_timeout(Some(Duration::from_secs(5)));
  let _ = stream.set_write_timeout(Some(Duration::from_secs(5)));

  let request = match read_http_request(&mut stream) {
    Ok(request) => request,
    Err(error) => {
      write_json_response(&mut stream, 400, &JsonMessage {
        status: "error",
        message: &error,
      });
      return;
    }
  };

  match (request.method.as_str(), request.path.as_str()) {
    ("OPTIONS", _) => {
      write_empty_response(&mut stream, 204);
    }
    ("GET", "/health") => {
      write_json_response(&mut stream, 200, &JsonStatus {
        status: "ok",
        app: "eidolon-simulacra-desktop-companion",
      });
    }
    ("GET", "/workspace-bundle") => {
      let body = {
        let state = match shared.lock() {
          Ok(state) => state,
          Err(_) => {
            write_json_response(&mut stream, 500, &JsonMessage {
              status: "error",
              message: "Companion state lock poisoned",
            });
            return;
          }
        };

        if !matches_pair_code(&request, &state.pair_code) {
          write_json_response(&mut stream, 401, &JsonMessage {
            status: "error",
            message: "Invalid pair code",
          });
          return;
        }

        match state.outgoing_bundle_json.clone() {
          Some(bundle) => bundle,
          None => {
            write_json_response(&mut stream, 404, &JsonMessage {
              status: "error",
              message: "No published workspace bundle is available yet",
            });
            return;
          }
        }
      };

      write_text_response(&mut stream, 200, "application/json; charset=utf-8", body.as_bytes());
    }
    ("GET", "/sync-manifest") => {
      let manifest = {
        let state = match shared.lock() {
          Ok(state) => state,
          Err(_) => {
            write_json_response(&mut stream, 500, &JsonMessage {
              status: "error",
              message: "Companion state lock poisoned",
            });
            return;
          }
        };

        if !matches_pair_code(&request, &state.pair_code) {
          write_json_response(&mut stream, 401, &JsonMessage {
            status: "error",
            message: "Invalid pair code",
          });
          return;
        }

        let Some(sync_state_json) = state.outgoing_bundle_json.as_ref() else {
          write_json_response(&mut stream, 404, &JsonMessage {
            status: "error",
            message: "No published sync snapshot is available yet",
          });
          return;
        };

        match extract_sync_manifest(sync_state_json) {
          Ok(manifest) => manifest,
          Err(error) => {
            write_json_response(&mut stream, 500, &JsonMessage {
              status: "error",
              message: &error,
            });
            return;
          }
        }
      };

      write_json_response(&mut stream, 200, &JsonPayload {
        status: "ok",
        payload: &manifest,
      });
    }
    ("GET", path) if path.starts_with("/sync/") => {
      let domain = path.trim_start_matches("/sync/");
      let payload = {
        let state = match shared.lock() {
          Ok(state) => state,
          Err(_) => {
            write_json_response(&mut stream, 500, &JsonMessage {
              status: "error",
              message: "Companion state lock poisoned",
            });
            return;
          }
        };

        if !matches_pair_code(&request, &state.pair_code) {
          write_json_response(&mut stream, 401, &JsonMessage {
            status: "error",
            message: "Invalid pair code",
          });
          return;
        }

        let Some(sync_state_json) = state.outgoing_bundle_json.as_ref() else {
          write_json_response(&mut stream, 404, &JsonMessage {
            status: "error",
            message: "No published sync snapshot is available yet",
          });
          return;
        };

        match extract_sync_domain_payload(sync_state_json, domain) {
          Ok(Some(payload)) => payload,
          Ok(None) => {
            write_json_response(&mut stream, 404, &JsonMessage {
              status: "error",
              message: "Requested sync domain is not available in the published snapshot",
            });
            return;
          }
          Err(error) => {
            write_json_response(&mut stream, 500, &JsonMessage {
              status: "error",
              message: &error,
            });
            return;
          }
        }
      };

      write_json_response(&mut stream, 200, &JsonPayload {
        status: "ok",
        payload: &payload,
      });
    }
    ("POST", "/workspace-bundle") => {
      let mut state = match shared.lock() {
        Ok(state) => state,
        Err(_) => {
          write_json_response(&mut stream, 500, &JsonMessage {
            status: "error",
            message: "Companion state lock poisoned",
          });
          return;
        }
      };

      if !matches_pair_code(&request, &state.pair_code) {
        write_json_response(&mut stream, 401, &JsonMessage {
          status: "error",
          message: "Invalid pair code",
        });
        return;
      }

      let bundle_json = match String::from_utf8(request.body) {
        Ok(body) => body,
        Err(_) => {
          write_json_response(&mut stream, 400, &JsonMessage {
            status: "error",
            message: "Request body must be valid UTF-8 JSON",
          });
          return;
        }
      };

      if let Err(error) = serde_json::from_str::<serde_json::Value>(&bundle_json) {
        write_json_response(&mut stream, 400, &JsonMessage {
          status: "error",
          message: &format!("Invalid workspace bundle JSON: {error}"),
        });
        return;
      }

      state.incoming_bundle_json = Some(bundle_json);
      state.incoming_bundle_received_at_ms = Some(now_ms());
      state.last_error = None;
      drop(state);

      write_json_response(&mut stream, 202, &JsonMessage {
        status: "accepted",
        message: "Workspace bundle received",
      });
    }
    ("POST", "/sync-state") => {
      let mut state = match shared.lock() {
        Ok(state) => state,
        Err(_) => {
          write_json_response(&mut stream, 500, &JsonMessage {
            status: "error",
            message: "Companion state lock poisoned",
          });
          return;
        }
      };

      if !matches_pair_code(&request, &state.pair_code) {
        write_json_response(&mut stream, 401, &JsonMessage {
          status: "error",
          message: "Invalid pair code",
        });
        return;
      }

      let sync_state_json = match String::from_utf8(request.body) {
        Ok(body) => body,
        Err(_) => {
          write_json_response(&mut stream, 400, &JsonMessage {
            status: "error",
            message: "Request body must be valid UTF-8 JSON",
          });
          return;
        }
      };

      if let Err(error) = validate_sync_state_json(&sync_state_json) {
        write_json_response(&mut stream, 400, &JsonMessage {
          status: "error",
          message: &error,
        });
        return;
      }

      state.incoming_bundle_json = Some(sync_state_json);
      state.incoming_bundle_received_at_ms = Some(now_ms());
      state.last_error = None;
      drop(state);

      write_json_response(&mut stream, 202, &JsonMessage {
        status: "accepted",
        message: "Sync snapshot received",
      });
    }
    _ => {
      write_json_response(&mut stream, 404, &JsonMessage {
        status: "error",
        message: "Route not found",
      });
    }
  }
}

struct HttpRequest {
  method: String,
  path: String,
  headers: Vec<(String, String)>,
  body: Vec<u8>,
}

fn read_http_request(stream: &mut TcpStream) -> Result<HttpRequest, String> {
  let mut buffer = Vec::new();
  let mut temp = [0u8; 4096];
  let header_end = loop {
    let read = stream.read(&mut temp).map_err(|error| error.to_string())?;
    if read == 0 {
      return Err("Connection closed before request headers were received".to_string());
    }

    buffer.extend_from_slice(&temp[..read]);
    if buffer.len() > MAX_HEADER_BYTES {
      return Err("Request headers exceeded the supported size limit".to_string());
    }

    if let Some(position) = find_bytes(&buffer, HEADER_END) {
      break position;
    }
  };

  let header_bytes = &buffer[..header_end];
  let body_start = header_end + HEADER_END.len();
  let mut body = buffer[body_start..].to_vec();
  let header_text = String::from_utf8(header_bytes.to_vec()).map_err(|_| "Request headers must be valid UTF-8".to_string())?;
  let mut lines = header_text.split("\r\n");

  let request_line = lines.next().ok_or_else(|| "Missing request line".to_string())?;
  let mut request_parts = request_line.split_whitespace();
  let method = request_parts.next().ok_or_else(|| "Missing request method".to_string())?.to_string();
  let raw_path = request_parts.next().ok_or_else(|| "Missing request path".to_string())?.to_string();
  let path = raw_path.split('?').next().unwrap_or("").to_string();

  let mut headers = Vec::new();
  let mut content_length = 0usize;

  for line in lines {
    if line.trim().is_empty() {
      continue;
    }

    let Some((name, value)) = line.split_once(':') else {
      continue;
    };
    let header_name = name.trim().to_ascii_lowercase();
    let header_value = value.trim().to_string();

    if header_name == "content-length" {
      content_length = header_value.parse::<usize>().map_err(|_| "Invalid content-length header".to_string())?;
      if content_length > MAX_BODY_BYTES {
        return Err("Request body exceeded the supported size limit".to_string());
      }
    }

    headers.push((header_name, header_value));
  }

  while body.len() < content_length {
    let read = stream.read(&mut temp).map_err(|error| error.to_string())?;
    if read == 0 {
      break;
    }
    body.extend_from_slice(&temp[..read]);
    if body.len() > MAX_BODY_BYTES {
      return Err("Request body exceeded the supported size limit".to_string());
    }
  }

  if body.len() < content_length {
    return Err("Request body ended before the advertised content-length".to_string());
  }

  body.truncate(content_length);

  Ok(HttpRequest {
    method,
    path,
    headers,
    body,
  })
}

fn matches_pair_code(request: &HttpRequest, expected_pair_code: &str) -> bool {
  request
    .headers
    .iter()
    .find(|(name, _)| name == "x-eidolon-pair-code")
    .map(|(_, value)| value.trim() == expected_pair_code)
    .unwrap_or(false)
}

fn write_json_response<T: Serialize>(stream: &mut TcpStream, status_code: u16, body: &T) {
  match serde_json::to_vec(body) {
    Ok(bytes) => write_text_response(stream, status_code, "application/json; charset=utf-8", &bytes),
    Err(_) => write_text_response(stream, 500, "application/json; charset=utf-8", br#"{"status":"error","message":"Failed to serialize response"}"#),
  }
}

fn write_empty_response(stream: &mut TcpStream, status_code: u16) {
  let status_text = status_text(status_code);
  let response = format!(
    "HTTP/1.1 {} {}\r\nAccess-Control-Allow-Origin: *\r\nAccess-Control-Allow-Headers: Content-Type, X-Eidolon-Pair-Code\r\nAccess-Control-Allow-Methods: GET, POST, OPTIONS\r\nConnection: close\r\nContent-Length: 0\r\n\r\n",
    status_code,
    status_text,
  );
  let _ = stream.write_all(response.as_bytes());
  let _ = stream.flush();
}

fn write_text_response(stream: &mut TcpStream, status_code: u16, content_type: &str, body: &[u8]) {
  let status_text = status_text(status_code);
  let headers = format!(
    "HTTP/1.1 {} {}\r\nContent-Type: {}\r\nAccess-Control-Allow-Origin: *\r\nAccess-Control-Allow-Headers: Content-Type, X-Eidolon-Pair-Code\r\nAccess-Control-Allow-Methods: GET, POST, OPTIONS\r\nContent-Length: {}\r\nConnection: close\r\n\r\n",
    status_code,
    status_text,
    content_type,
    body.len(),
  );
  let _ = stream.write_all(headers.as_bytes());
  let _ = stream.write_all(body);
  let _ = stream.flush();
}

fn status_text(status_code: u16) -> &'static str {
  match status_code {
    200 => "OK",
    202 => "Accepted",
    204 => "No Content",
    400 => "Bad Request",
    401 => "Unauthorized",
    404 => "Not Found",
    500 => "Internal Server Error",
    _ => "OK",
  }
}

fn find_bytes(haystack: &[u8], needle: &[u8]) -> Option<usize> {
  haystack.windows(needle.len()).position(|window| window == needle)
}

fn parse_json_value(value: &str) -> Result<Value, String> {
  serde_json::from_str::<Value>(value).map_err(|error| format!("Invalid companion sync JSON: {error}"))
}

fn validate_sync_state_json(value: &str) -> Result<(), String> {
  let parsed = parse_json_value(value)?;
  if !parsed.is_object() {
    return Err("Companion sync payload must be a JSON object".to_string());
  }

  if parsed.get("manifest").is_none() || parsed.get("payload").is_none() {
    return Err("Companion sync payload must contain manifest and payload objects".to_string());
  }

  Ok(())
}

fn extract_sync_manifest(value: &str) -> Result<Value, String> {
  let parsed = parse_json_value(value)?;
  parsed
    .get("manifest")
    .cloned()
    .ok_or_else(|| "Published sync snapshot is missing a manifest".to_string())
}

fn extract_sync_domain_payload(value: &str, domain: &str) -> Result<Option<Value>, String> {
  let parsed = parse_json_value(value)?;
  let payload = parsed
    .get("payload")
    .and_then(|value| value.as_object())
    .ok_or_else(|| "Published sync snapshot is missing domain payloads".to_string())?;

  Ok(payload.get(domain).cloned())
}

fn now_ms() -> u64 {
  std::time::SystemTime::now()
    .duration_since(std::time::UNIX_EPOCH)
    .map(|duration| duration.as_millis() as u64)
    .unwrap_or(0)
}

fn generate_pair_code() -> String {
  rand::thread_rng()
    .sample_iter(&Alphanumeric)
    .map(char::from)
    .filter(|character| character.is_ascii_alphanumeric())
    .take(8)
    .collect::<String>()
    .to_uppercase()
}

fn discover_local_ip() -> Option<String> {
  discover_interface_local_ip().or_else(discover_routed_local_ip)
}

fn discover_interface_local_ip() -> Option<String> {
  let candidates = get_if_addrs().ok()?.into_iter().filter_map(|interface| {
    let address = match interface.addr {
      IfAddr::V4(address) => IpAddr::V4(address.ip),
      IfAddr::V6(address) => IpAddr::V6(address.ip),
    };

    Some(LocalIpCandidate {
      interface_name: interface.name,
      address,
    })
  });

  select_best_local_ip(candidates).map(|address| address.to_string())
}

fn discover_routed_local_ip() -> Option<String> {
  let socket = UdpSocket::bind("0.0.0.0:0").ok()?;
  socket.connect("8.8.8.8:80").ok()?;
  let local_address = socket.local_addr().ok()?;

  match local_address {
    SocketAddr::V4(address) => Some(address.ip().to_string()),
    SocketAddr::V6(address) => Some(address.ip().to_string()),
  }
}

fn format_local_url(ip: &str, port: u16) -> String {
  if ip.contains(':') {
    format!("http://[{ip}]:{port}")
  } else {
    format!("http://{ip}:{port}")
  }
}

#[derive(Debug, Clone)]
struct LocalIpCandidate {
  interface_name: String,
  address: IpAddr,
}

fn select_best_local_ip<I>(candidates: I) -> Option<IpAddr>
where
  I: IntoIterator<Item = LocalIpCandidate>,
{
  candidates
    .into_iter()
    .filter_map(|candidate| score_local_ip_candidate(&candidate).map(|score| (score, candidate.address)))
    .min_by(|(left_score, left_address), (right_score, right_address)| {
      left_score
        .cmp(right_score)
        .then_with(|| left_address.to_string().cmp(&right_address.to_string()))
    })
    .map(|(_, address)| address)
}

fn score_local_ip_candidate(candidate: &LocalIpCandidate) -> Option<(u8, u8)> {
  let virtual_penalty = u8::from(is_probably_virtual_interface_name(&candidate.interface_name));

  match candidate.address {
    IpAddr::V4(address) => {
      if address.is_loopback() || address.is_link_local() || address.is_unspecified() || address.is_broadcast() {
        return None;
      }

      let family_rank = if address.is_private() { 0 } else { 1 };
      Some((family_rank, virtual_penalty))
    }
    IpAddr::V6(address) => {
      if address.is_loopback() || address.is_unspecified() || address.is_unicast_link_local() {
        return None;
      }

      let family_rank = if address.is_unique_local() { 2 } else { 3 };
      Some((family_rank, virtual_penalty))
    }
  }
}

fn is_probably_virtual_interface_name(name: &str) -> bool {
  let lowered = name.to_ascii_lowercase();
  [
    "docker",
    "vethernet",
    "virtual",
    "vmware",
    "hyper-v",
    "wsl",
    "tailscale",
    "wireguard",
    "tun",
    "tap",
    "zerotier",
    "vpn",
  ]
  .iter()
  .any(|fragment| lowered.contains(fragment))
}

#[cfg(test)]
mod tests {
  use super::{format_local_url, select_best_local_ip, LocalIpCandidate};
  use std::net::{IpAddr, Ipv4Addr, Ipv6Addr};

  #[test]
  fn prefers_private_non_virtual_ipv4_addresses() {
    let selected = select_best_local_ip([
      LocalIpCandidate {
        interface_name: "Loopback Pseudo-Interface".to_string(),
        address: IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)),
      },
      LocalIpCandidate {
        interface_name: "vEthernet (WSL)".to_string(),
        address: IpAddr::V4(Ipv4Addr::new(172, 28, 48, 1)),
      },
      LocalIpCandidate {
        interface_name: "Wi-Fi".to_string(),
        address: IpAddr::V4(Ipv4Addr::new(192, 168, 1, 24)),
      },
      LocalIpCandidate {
        interface_name: "Tailscale".to_string(),
        address: IpAddr::V4(Ipv4Addr::new(100, 91, 20, 3)),
      },
    ]);

    assert_eq!(selected, Some(IpAddr::V4(Ipv4Addr::new(192, 168, 1, 24))));
  }

  #[test]
  fn falls_back_to_virtual_private_ipv4_when_needed() {
    let selected = select_best_local_ip([
      LocalIpCandidate {
        interface_name: "vEthernet (Default Switch)".to_string(),
        address: IpAddr::V4(Ipv4Addr::new(172, 24, 64, 1)),
      },
      LocalIpCandidate {
        interface_name: "Loopback".to_string(),
        address: IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)),
      },
    ]);

    assert_eq!(selected, Some(IpAddr::V4(Ipv4Addr::new(172, 24, 64, 1))));
  }

  #[test]
  fn formats_ipv6_urls_with_brackets() {
    let selected = select_best_local_ip([
      LocalIpCandidate {
        interface_name: "Ethernet".to_string(),
        address: IpAddr::V6(Ipv6Addr::new(0xfd12, 0x3456, 0x789a, 0, 0, 0, 0, 0x1234)),
      },
    ]);

    assert_eq!(selected, Some(IpAddr::V6(Ipv6Addr::new(0xfd12, 0x3456, 0x789a, 0, 0, 0, 0, 0x1234))));
    assert_eq!(format_local_url("fd12:3456:789a::1234", 48231), "http://[fd12:3456:789a::1234]:48231");
  }
}