@echo off
set "MAVEN_CMD=mvn"
where mvn >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\Program Files\JetBrains\IntelliJ IDEA 2025.3.2\plugins\maven\lib\maven3\bin\mvn.cmd" (
        set "MAVEN_CMD=C:\Program Files\JetBrains\IntelliJ IDEA 2025.3.2\plugins\maven\lib\maven3\bin\mvn.cmd"
    )
)
call "%MAVEN_CMD%" %*
