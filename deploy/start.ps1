$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
if (-not $env:DB_URL -or -not $env:DB_USERNAME -or -not $env:DB_PASSWORD -or -not $env:JWT_KEY) {
    throw '请先设置 DB_URL、DB_USERNAME、DB_PASSWORD、JWT_KEY。'
}
& java -jar application.jar --spring.config.additional-location=./application-release.yml
exit $LASTEXITCODE
