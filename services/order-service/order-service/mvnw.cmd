@REM ----------------------------------------------------------------------------
@REM Maven Wrapper Script for Windows
@REM ----------------------------------------------------------------------------
@echo off
setlocal
set MAVEN_CMD_LINE_ARGS=%*
if "%JAVA_HOME%"=="" (
    for %%i in (java.exe) do set JAVA_EXE=%%~$PATH:i
) else (
    set JAVA_EXE=%JAVA_HOME%\bin\java.exe
)
if not exist "%JAVA_EXE%" (
    echo Error: JAVA_HOME is not set and no 'java' command could be found in your PATH.
    exit /b 1
)

set WRAPPER_JAR=%~dp0.mvn\wrapper\maven-wrapper.jar
if exist "%WRAPPER_JAR%" (
    "%JAVA_EXE%" -jar "%WRAPPER_JAR%" %MAVEN_CMD_LINE_ARGS%
) else (
    echo [INFO] Downloading Apache Maven Wrapper jar...
    powershell -Command "(New-Object Net.WebClient).DownloadFile('https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar', '%WRAPPER_JAR%')"
    "%JAVA_EXE%" -jar "%WRAPPER_JAR%" %MAVEN_CMD_LINE_ARGS%
)
