@echo off
title Sports Booking Enterprise Backend (Spring Boot 3 + Camunda + MyBatis)
echo ===================================================================
echo   KHOI DONG ENTERPRISE BACKEND SERVICE (PORT 8088)
echo   Spring Boot 3 - Camunda BPMN 7 - MyBatis - JasperReports - JWT
echo ===================================================================
echo.

cd /d "%~dp0enterprise-backend"

set MVN_CMD=mvn
where mvn >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\Program Files\JetBrains\IntelliJ IDEA 2025.3.2\plugins\maven\lib\maven3\bin\mvn.cmd" (
        set "MVN_CMD=C:\Program Files\JetBrains\IntelliJ IDEA 2025.3.2\plugins\maven\lib\maven3\bin\mvn.cmd"
    ) else (
        echo [CANH BAO] Khong tim thay lenh 'mvn' trong PATH!
        echo Dang su dung Java de khoi chay truc tiep...
    )
)

echo Dang chay Enterprise Backend bang Maven...
call "%MVN_CMD%" spring-boot:run

pause
