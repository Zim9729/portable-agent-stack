$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
& node "$ScriptDir/bin/pas.mjs" init @args
exit $LASTEXITCODE
