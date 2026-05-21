param(
  [Parameter(Mandatory = $true)]
  [string]$PackageDir
)

$ErrorActionPreference = "Stop"

$resolvedPackageDir = (Resolve-Path $PackageDir).Path
Set-Location $resolvedPackageDir

$pkg = Get-Content -Path "package.json" -Raw | ConvertFrom-Json
$tarballName = "$($pkg.name)-$($pkg.version).tgz"

& pnpm pack
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

if (-not (Test-Path $tarballName)) {
  throw "Expected tarball not found: $tarballName"
}

& npm publish $tarballName --access public
exit $LASTEXITCODE
