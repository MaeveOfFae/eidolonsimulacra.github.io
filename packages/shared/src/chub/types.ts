/**
 * Chub.ai gateway types.
 *
 * Shapes come from the live OpenAPI spec at `https://gateway.chub.ai/openapi.json`
 * ("Chub API" v0.2.0, verified in-session): `POST /api/core/characters` (Create char),
 * `PUT /api/core/characters/{username}/{pathname}` (Update char), `GET /oauth/userinfo`,
 * `GET /api/self`, `POST /account/tokens/projects`. Field docs for the two character
 * payloads carry the spec's own descriptions, including its V2 naming quirk: the
 * `description` parameter is `creator_notes` in V2 card terms, and the `personality`
 * parameter is the V2 `description`.
 *
 * Error shapes captured live: `401 {"detail": "<message>"}` (missing/bad token) and
 * FastAPI validation `422 {"detail": [{type, loc, msg, input}], "body": "..."}`.
 */

/** fetch-like transport, mirroring `ComfyFetch` — injectable for tests and runtimes. */
export type ChubFetch = (url: string, init?: RequestInit) => Promise<Response>;

export interface ChubClientOptions {
  /** Gateway base URL; defaults to `https://gateway.chub.ai`. */
  baseUrl?: string;
  /** Session/API token sent as both `Authorization: Bearer` and `ch-api-key`. */
  token: string;
  fetchFn?: ChubFetch;
}

/** Identity from `GET /oauth/userinfo`, enriched with `GET /api/self` when authenticated. */
export interface ChubIdentity {
  /** The user's unique identifier (userinfo `identity`). */
  identity: string;
  username: string;
  scopes: string[];
  credits?: number;
  subscription?: string | null;
  /** Profile display name from `/api/self`, when it returned a real account. */
  displayName?: string;
  avatarUrl?: string;
  /** `/api/self` account id; negative values are the anonymous stub. */
  accountId?: number;
}

/** `APIResponse` — the create/update envelope (`message` is "usually just success"). */
export interface ChubApiResult {
  message?: string | null;
  success?: boolean | null;
  /** Undocumented extras are passed through (the live response may carry ids). */
  [key: string]: unknown;
}

/** `CharacterCreate` — body of `POST /api/core/characters`. Required fields marked. */
export interface ChubCharacterCreate {
  /** Base64 image string, or a URL to an image. */
  avatar?: string | null;
  /** The name of the character. (required) */
  name: string;
  tagline?: string | null;
  /** The description of the character. Is actually creator_notes within the V2 Spec. (required) */
  description: string;
  /** The personality of the character. Is actually description within the V2 Spec. (required) */
  personality: string;
  /** The scenario of the character. (required) */
  scenario: string;
  /** The example_dialogs of the character. (required) */
  example_dialogs: string;
  /** The first_message of the character. (required) */
  first_message: string;
  is_nsfw?: boolean;
  is_nsfl?: boolean;
  is_anonymous?: boolean;
  is_public?: boolean | null;
  is_unlisted?: boolean;
  /** Compatibility field; ignored by the gateway. */
  avatar_payload?: string | null;
  tags?: string[];
  in_chat_name?: string | null;
  system_prompt?: string | null;
  post_history_instructions?: string | null;
  alternate_greetings?: string[] | null;
  extensions?: Record<string, unknown> | null;
  version?: string | null;
  version_notes?: string | null;
  /** Deprecated Tavern-clone `personality` field. */
  tavern_personality?: string | null;
}

/** `CharacterUpdate` — body of `PUT /api/core/characters/{username}/{pathname}`. */
export interface ChubCharacterUpdate {
  /** Unique id for deduplication. */
  short_id?: string;
  source?: string | null;
  /** The id of the character. (required) */
  character_id: number;
  /** The name of the character. Ignored if not creation. */
  name?: string | null;
  in_chat_name?: string | null;
  personality?: string | null;
  scenario?: string | null;
  example_dialogs?: string | null;
  first_message?: string | null;
  system_prompt?: string | null;
  post_history_instructions?: string | null;
  /** Compatibility field; ignored by the gateway. */
  avatar_payload?: string | null;
  tags?: string[] | null;
  alternate_greetings?: string[] | null;
  extensions?: Record<string, unknown> | null;
  tavern_personality?: string | null;
  /** Pass true to remove the embedded lorebook. */
  remove_book?: boolean | null;
  voice_id?: string | null;
  /** The image as a base64 string. */
  avatar?: string | null;
  tagline?: string | null;
  /** Called description in Chub, but is creator's notes in most other parsers. */
  description?: string | null;
  is_nsfw?: boolean | null;
  is_public?: boolean | null;
  is_unlisted?: boolean | null;
  version_notes?: string | null;
  character_version?: string | null;
}

/** The subset of a search/detail node this app relies on. */
export interface ChubSearchNode {
  id?: number;
  name?: string;
  fullPath?: string;
  tagline?: string;
  creatorId?: number | null;
  createdAt?: string;
  avatar_url?: string;
  max_res_url?: string;
}

/** Resolved reference to a published character (used for the draft record + update path). */
export interface ChubPublishedRef {
  characterId?: number;
  /** `username/pathname` — the stable identifier for updates and links. */
  full_path: string;
  username: string;
  pathname: string;
  name: string;
}
