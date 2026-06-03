param(
  [ValidateSet("ZipOnly", "ClawHub", "GitHub", "Both")]
  [string]$Target = "ClawHub",

  [string]$SkillDir = "packages/skills",

  [string]$OutputDir = "dist/releases",

  [string]$GitHubTag = "",

  [string]$GitHubRepo = "",

  [switch]$DryRun,

  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$RemainingArgs
)

$ErrorActionPreference = "Stop"

if ($RemainingArgs -contains "-DryRun") {
  $DryRun = $true
}

function Resolve-RepoPath {
  param([string]$Path)

  if ([System.IO.Path]::IsPathRooted($Path)) {
    return [System.IO.Path]::GetFullPath($Path)
  }

  return [System.IO.Path]::GetFullPath((Join-Path $repoRoot $Path))
}

function Assert-UnderPath {
  param(
    [string]$Path,
    [string]$Parent
  )

  $resolvedPath = [System.IO.Path]::GetFullPath($Path)
  $resolvedParent = [System.IO.Path]::GetFullPath($Parent)
  if (-not $resolvedParent.EndsWith([System.IO.Path]::DirectorySeparatorChar)) {
    $resolvedParent += [System.IO.Path]::DirectorySeparatorChar
  }

  if (-not $resolvedPath.StartsWith($resolvedParent, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to operate outside expected directory. Path: $resolvedPath Parent: $resolvedParent"
  }
}

function Get-SkillFrontmatter {
  param([string]$SkillPath)

  $content = Get-Content -LiteralPath $SkillPath -Raw -Encoding UTF8
  $match = [regex]::Match($content, "(?s)^---\r?\n(.*?)\r?\n---")
  if (-not $match.Success) {
    throw "SKILL.md must start with YAML frontmatter."
  }

  $frontmatter = @{}
  foreach ($line in ($match.Groups[1].Value -split "\r?\n")) {
    if ($line -match '^\s*([A-Za-z0-9_-]+):\s*(.*?)\s*$') {
      $key = $matches[1]
      $value = $matches[2].Trim()
      if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
        $value = $value.Substring(1, $value.Length - 2)
      }
      $frontmatter[$key] = $value
    }
  }

  return @{
    Content = $content
    Data = $frontmatter
  }
}

function Test-FineBiSkill {
  param(
    [string]$PackageDir,
    [object]$PackageJson
  )

  $skillPath = Join-Path $PackageDir "SKILL.md"
  if (-not (Test-Path -LiteralPath $skillPath)) {
    throw "Missing SKILL.md at $skillPath"
  }

  $skill = Get-SkillFrontmatter -SkillPath $skillPath
  $frontmatter = $skill.Data

  foreach ($requiredKey in @("name", "description", "version")) {
    if (-not $frontmatter.ContainsKey($requiredKey) -or [string]::IsNullOrWhiteSpace($frontmatter[$requiredKey])) {
      throw "SKILL.md frontmatter is missing '$requiredKey'."
    }
  }

  if ($frontmatter["name"] -ne $PackageJson.name) {
    throw "SKILL.md name '$($frontmatter["name"])' does not match package.json name '$($PackageJson.name)'."
  }

  if ($frontmatter["version"] -ne $PackageJson.version) {
    throw "SKILL.md version '$($frontmatter["version"])' does not match package.json version '$($PackageJson.version)'."
  }

  if ($frontmatter["description"] -match "[<>]") {
    throw "SKILL.md description must not contain angle brackets."
  }

  foreach ($staleCommand in @("query-dataset", "set-dashboard-style")) {
    if ($skill.Content -match [regex]::Escape($staleCommand)) {
      throw "SKILL.md still references stale command '$staleCommand'."
    }
  }

  $markdownFiles = Get-ChildItem -LiteralPath $PackageDir -Recurse -File -Filter "*.md"
  foreach ($file in $markdownFiles) {
    $text = Get-Content -LiteralPath $file.FullName -Raw -Encoding UTF8
    $matches = [regex]::Matches($text, 'references/[A-Za-z0-9_./-]+\.md')
    foreach ($match in $matches) {
      $relativeRef = $match.Value.Replace("/", [System.IO.Path]::DirectorySeparatorChar)
      $refPath = Join-Path $PackageDir $relativeRef
      if (-not (Test-Path -LiteralPath $refPath)) {
        throw "Missing referenced file '$($match.Value)' in $($file.FullName)."
      }
    }
  }

  Write-Host "OK validate SKILL.md: $skillPath"
}

function Copy-PackageFiles {
  param(
    [string]$PackageDir,
    [object]$PackageJson,
    [string]$StagingDir
  )

  New-Item -ItemType Directory -Path $StagingDir -Force | Out-Null

  $files = @()
  if ($PackageJson.files) {
    $files += @($PackageJson.files)
  }
  $files += "package.json"
  $files = $files | Select-Object -Unique

  foreach ($entry in $files) {
    $source = Join-Path $PackageDir $entry
    if (-not (Test-Path -LiteralPath $source)) {
      throw "package.json files entry does not exist: $entry"
    }

    $destination = Join-Path $StagingDir $entry
    $destinationParent = Split-Path -Parent $destination
    if (-not (Test-Path -LiteralPath $destinationParent)) {
      New-Item -ItemType Directory -Path $destinationParent -Force | Out-Null
    }

    Copy-Item -LiteralPath $source -Destination $destination -Recurse -Force
  }
}

function New-SkillZip {
  param(
    [string]$PackageDir,
    [object]$PackageJson,
    [string]$OutputRoot
  )

  New-Item -ItemType Directory -Path $OutputRoot -Force | Out-Null
  $tempRoot = Join-Path $OutputRoot ".tmp-finebi-skills-$([guid]::NewGuid().ToString("N"))"
  Assert-UnderPath -Path $tempRoot -Parent $OutputRoot

  $stagingDir = Join-Path $tempRoot "$($PackageJson.name)-$($PackageJson.version)"
  $zipPath = Join-Path $OutputRoot "$($PackageJson.name)-$($PackageJson.version).zip"

  try {
    Copy-PackageFiles -PackageDir $PackageDir -PackageJson $PackageJson -StagingDir $stagingDir

    if (Test-Path -LiteralPath $zipPath) {
      Remove-Item -LiteralPath $zipPath -Force
    }

    Compress-Archive -Path (Join-Path $stagingDir "*") -DestinationPath $zipPath -CompressionLevel Optimal
    Write-Host "OK package ZIP: $zipPath"
    return $zipPath
  } finally {
    if (Test-Path -LiteralPath $tempRoot) {
      Assert-UnderPath -Path $tempRoot -Parent $OutputRoot
      Remove-Item -LiteralPath $tempRoot -Recurse -Force
    }
  }
}

function Publish-ClawHub {
  param([string]$PackageDir)

  $publishScript = Join-Path $PackageDir "scripts/clawhub-publish.ps1"
  if (-not (Test-Path -LiteralPath $publishScript)) {
    throw "Missing ClawHub publish script: $publishScript"
  }

  & powershell -NoProfile -ExecutionPolicy Bypass -File $publishScript
  if ($LASTEXITCODE -ne 0) {
    throw "ClawHub publish failed with exit code $LASTEXITCODE."
  }
}

function Publish-GitHubRelease {
  param(
    [string]$ZipPath,
    [object]$PackageJson,
    [string]$TagName,
    [string]$Repository
  )

  if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw "GitHub Release publish requires the GitHub CLI 'gh'."
  }

  $viewOut = [System.IO.Path]::GetTempFileName()
  $viewErr = [System.IO.Path]::GetTempFileName()
  try {
    $viewArgs = @("release", "view", $TagName)
    if (-not [string]::IsNullOrWhiteSpace($Repository)) {
      $viewArgs += @("--repo", $Repository)
    }
    $viewProcess = Start-Process -FilePath "gh" -ArgumentList $viewArgs -NoNewWindow -Wait -PassThru -RedirectStandardOutput $viewOut -RedirectStandardError $viewErr
    $releaseExists = ($viewProcess.ExitCode -eq 0)
  } finally {
    Remove-Item -LiteralPath $viewOut -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $viewErr -Force -ErrorAction SilentlyContinue
  }

  if ($releaseExists) {
    $uploadArgs = @("release", "upload", $TagName, $ZipPath, "--clobber")
    if (-not [string]::IsNullOrWhiteSpace($Repository)) {
      $uploadArgs += @("--repo", $Repository)
    }
    & gh @uploadArgs
  } else {
    $createArgs = @("release", "create", $TagName, $ZipPath, "--title", "$($PackageJson.name) $($PackageJson.version)", "--notes", "Release $($PackageJson.name) $($PackageJson.version).")
    if (-not [string]::IsNullOrWhiteSpace($Repository)) {
      $createArgs += @("--repo", $Repository)
    }
    & gh @createArgs
  }

  if ($LASTEXITCODE -ne 0) {
    throw "GitHub Release publish failed with exit code $LASTEXITCODE."
  }
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $scriptDir ".."))
$packageDir = Resolve-RepoPath -Path $SkillDir
$outputRoot = Resolve-RepoPath -Path $OutputDir

if (-not (Test-Path -LiteralPath $packageDir)) {
  throw "Skill package directory not found: $packageDir"
}

$packageJsonPath = Join-Path $packageDir "package.json"
if (-not (Test-Path -LiteralPath $packageJsonPath)) {
  throw "Missing package.json at $packageJsonPath"
}

$packageJson = Get-Content -LiteralPath $packageJsonPath -Raw -Encoding UTF8 | ConvertFrom-Json
if ([string]::IsNullOrWhiteSpace($GitHubTag)) {
  $GitHubTag = "$($packageJson.name)-v$($packageJson.version)"
}
if ([string]::IsNullOrWhiteSpace($GitHubRepo)) {
  $originUrl = git -C $repoRoot remote get-url origin 2>$null
  if ($originUrl -match '[:/]([^/:]+)/([^/]+?)(?:\.git)?$') {
    $GitHubRepo = "$($matches[1])/$($matches[2])"
  }
}

Write-Host "Release target: $Target"
Write-Host "Skill package: $packageDir"
Write-Host "Version: $($packageJson.version)"

Test-FineBiSkill -PackageDir $packageDir -PackageJson $packageJson
$zipPath = New-SkillZip -PackageDir $packageDir -PackageJson $packageJson -OutputRoot $outputRoot

if ($DryRun) {
  Write-Host "Dry run enabled; skipping publish step."
  exit 0
}

switch ($Target) {
  "ZipOnly" {
    Write-Host "ZipOnly target selected; skipping publish step."
  }
  "ClawHub" {
    Publish-ClawHub -PackageDir $packageDir
  }
  "GitHub" {
    Publish-GitHubRelease -ZipPath $zipPath -PackageJson $packageJson -TagName $GitHubTag -Repository $GitHubRepo
  }
  "Both" {
    Publish-ClawHub -PackageDir $packageDir
    Publish-GitHubRelease -ZipPath $zipPath -PackageJson $packageJson -TagName $GitHubTag -Repository $GitHubRepo
  }
}

Write-Host "OK release script completed."
