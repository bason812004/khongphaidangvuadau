@echo off
title Sports Booking Enterprise Backend (Spring Boot 3 + Camunda + MyBatis)
echo ===================================================================
echo   KHOI DONG ENTERPRISE BACKEND SERVICE (PORT 8088)
echo   Spring Boot 3 - Camunda BPMN 7 - MyBatis - JasperReports - JWT
echo ===================================================================
echo.

cd /d "%~dp0enterprise-backend"

set "MVN_CMD=mvn.cmd"
where mvn.cmd >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\Program Files\JetBrains\IntelliJ IDEA 2025.3.2\plugins\maven\lib\maven3\bin\mvn.cmd" (
        set "MVN_CMD=C:\Program Files\JetBrains\IntelliJ IDEA 2025.3.2\plugins\maven\lib\maven3\bin\mvn.cmd"
    ) else (
        set "MVN_CMD=mvn"
    )
)

echo Dang chay Enterprise Backend bang Maven (%MVN_CMD%)...
call "%MVN_CMD%" spring-boot:run

if %errorlevel% neq 0 (
    echo.
    echo [LOI] Khong the khoi dong Backend. Vui long kiem tra lai moi truong Java / Maven.
)

pause
