@echo off
@REM ----------------------------------------------------------------------------
@REM Maven Wrapper Script for Windows (with Unicode-safe Spring Boot runner)
@REM ----------------------------------------------------------------------------
setlocal

if "%JAVA_HOME%"=="" (
    for %%i in (java.exe) do set "JAVA_EXE=%%~$PATH:i"
) else (
    set "JAVA_EXE=%JAVA_HOME%\bin\java.exe"
)

if not exist "%JAVA_EXE%" (
    echo Error: JAVA_HOME is not set and no 'java' command could be found in your PATH.
    exit /b 1
)

set "ARGS=%*"
if "%ARGS%"=="spring-boot:run" goto RUN_SPRING_BOOT
if "%1"=="spring-boot:run" goto RUN_SPRING_BOOT

:RUN_MAVEN
"%JAVA_EXE%" "-Dmaven.multiModuleProjectDirectory=." -classpath ".mvn\wrapper\maven-wrapper.jar" org.apache.maven.wrapper.MavenWrapperMain %*
exit /b %ERRORLEVEL%

:RUN_SPRING_BOOT
echo [INFO] Compiling and packaging Order Service...
"%JAVA_EXE%" "-Dmaven.multiModuleProjectDirectory=." -classpath ".mvn\wrapper\maven-wrapper.jar" org.apache.maven.wrapper.MavenWrapperMain package -DskipTests
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Build failed.
    exit /b %ERRORLEVEL%
)
echo.
echo [INFO] ========================================================================
echo [INFO]  Khoi dong Order Service tren cong 8084...
echo [INFO] ========================================================================
echo.
"%JAVA_EXE%" -jar target\order-service-1.0.0-SNAPSHOT.jar
exit /b %ERRORLEVEL%
