cd ..
cd docker-compose
cd nest_ts_postgresql_starter_kit_prod

docker compose up postgresql -d

timeout /t 2 /nobreak >NUL

cd ..
cd ..
cd controller_for_window
call prod-prisma-deploy.bat && ^
cd .. && ^
cd controller_for_window && ^
call prod-build-server-image.bat && ^
cd docker-compose && ^
cd nest_ts_postgresql_starter_kit_prod && ^
docker compose up -d && pause