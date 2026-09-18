param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string]$FileToSign
)

$certificateThumbprint = $env:EIDOLON_SIGN_CERT_THUMBPRINT
$certificateFile = $env:EIDOLON_SIGN_CERT_FILE
$certificatePassword = $env:EIDOLON_SIGN_CERT_PASSWORD
$timestampUrl = if ([string]::IsNullOrWhiteSpace($env:EIDOLON_SIGN_TIMESTAMP_URL)) {
  'http://timestamp.digicert.com'
} else {
  $env:EIDOLON_SIGN_TIMESTAMP_URL
}
$digestAlgorithm = if ([string]::IsNullOrWhiteSpace($env:EIDOLON_SIGN_DIGEST_ALGORITHM)) {
  'SHA256'
} else {
  $env:EIDOLON_SIGN_DIGEST_ALGORITHM
}

function Find-SignTool {
  $command = Get-Command signtool.exe -ErrorAction SilentlyContinue
  if ($command) {
    return $command.Source
  }

  $windowsKitsRoot = Join-Path ${env:ProgramFiles(x86)} 'Windows Kits\10\bin'
  if (-not (Test-Path $windowsKitsRoot)) {
    return $null
  }

  $candidate = Get-ChildItem $windowsKitsRoot -Filter signtool.exe -Recurse -ErrorAction SilentlyContinue |
    Sort-Object FullName -Descending |
    Select-Object -First 1

  return $candidate.FullName
}

if ([string]::IsNullOrWhiteSpace($certificateThumbprint) -and [string]::IsNullOrWhiteSpace($certificateFile)) {
  Write-Host "No Windows signing certificate configured. Skipping signing for $FileToSign."
  exit 0
}

$signTool = Find-SignTool
if ([string]::IsNullOrWhiteSpace($signTool)) {
  Write-Error 'signtool.exe was not found. Install the Windows SDK signing tools or add signtool.exe to PATH.'
  exit 1
}

$arguments = @('sign', '/fd', $digestAlgorithm, '/td', $digestAlgorithm, '/tr', $timestampUrl)

if (-not [string]::IsNullOrWhiteSpace($certificateThumbprint)) {
  $arguments += @('/sha1', $certificateThumbprint)
} else {
  if (-not (Test-Path $certificateFile)) {
    Write-Error "Configured certificate file was not found: $certificateFile"
    exit 1
  }

  $arguments += @('/f', $certificateFile)

  if (-not [string]::IsNullOrEmpty($certificatePassword)) {
    $arguments += @('/p', $certificatePassword)
  }
}

$arguments += $FileToSign

Write-Host "Signing $FileToSign"
& $signTool @arguments

if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}