$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$mobileDir = Join-Path $repoRoot 'packages\mobile'
$androidDir = Join-Path $mobileDir 'android'

if (-not (Test-Path $androidDir)) {
  throw "Android project not found at $androidDir. Run Expo prebuild for Android first."
}

$javaHome = [Environment]::GetEnvironmentVariable('JAVA_HOME', 'User')
$androidSdkRoot = [Environment]::GetEnvironmentVariable('ANDROID_SDK_ROOT', 'User')

if (-not $javaHome -or -not (Test-Path $javaHome)) {
  throw 'JAVA_HOME is not configured to a valid JDK. Install a JDK 17 and set JAVA_HOME first.'
}

if (-not $androidSdkRoot -or -not (Test-Path $androidSdkRoot)) {
  throw 'ANDROID_SDK_ROOT is not configured to a valid Android SDK. Install the Android command-line tools and SDK packages first.'
}

$env:JAVA_HOME = $javaHome
$env:ANDROID_SDK_ROOT = $androidSdkRoot
$env:ANDROID_HOME = $androidSdkRoot
$env:NODE_ENV = 'production'
$env:EXPO_NO_METRO_WORKSPACE_ROOT = '1'
$env:Path = "$javaHome\bin;$androidSdkRoot\cmdline-tools\latest\bin;$androidSdkRoot\platform-tools;" + $env:Path

Push-Location $mobileDir
try {
  pnpm run prepare:android:release
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
} finally {
  Pop-Location
}

Push-Location $androidDir
try {
  & .\gradlew.bat assembleRelease
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
} finally {
  Pop-Location
}

$apkPath = Get-ChildItem -Path (Join-Path $androidDir 'app\build\outputs\apk\release') -Filter '*.apk' -File -ErrorAction SilentlyContinue | Select-Object -First 1
if ($apkPath) {
  Write-Output "APK=$($apkPath.FullName)"
}