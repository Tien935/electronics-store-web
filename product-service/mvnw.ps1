<#
.SYNOPSIS
    Maven Wrapper script for PowerShell
#>
[CmdletBinding()]
param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$MavenArgs
)

$ErrorActionPreference = 'Stop'
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

if ($env:JAVA_HOME) {
    $JavaExe = Join-Path $env:JAVA_HOME "bin\java.exe"
} else {
    $JavaCmd = Get-Command java.exe -ErrorAction SilentlyContinue
    if ($JavaCmd) {
        $JavaExe = $JavaCmd.Source
    }
}

if (-not $JavaExe -or -not (Test-Path $JavaExe)) {
    Write-Error "Error: JAVA_HOME is not set and java.exe was not found in your PATH."
    exit 1
}

$WrapperJar = Join-Path $ScriptDir ".mvn\wrapper\maven-wrapper.jar"
if (-not (Test-Path $WrapperJar)) {
    $WrapperJar = ".mvn\wrapper\maven-wrapper.jar"
}

$processArgs = @(
    "-Dmaven.multiModuleProjectDirectory=$ScriptDir",
    "-classpath",
    $WrapperJar,
    "org.apache.maven.wrapper.MavenWrapperMain"
) + $MavenArgs

& $JavaExe @processArgs
exit $LASTEXITCODE
