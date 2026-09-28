@echo off
echo ===================================================================
echo   KHOI DONG MIDDLEWARE (PostgreSQL, Redis, Kafka, Keycloak)
echo ===================================================================
docker compose -f docker-compose.enterprise.yml up -d
echo.
echo Cua so Docker da khoi dong thanh cong cac container!
pause
