cd ..
cd docker-compose
cd nest_ts_postgresql_starter_kit_dev

docker compose up postgresql -d

timeout /t 2 /nobreak >NUL

cd ..
cd ..
cd controller_for_window
call prisma-deploy.bat && ^
cd .. && ^
cd controller_for_window && ^
call build-server-image.bat && ^
cd docker-compose && ^
cd nest_ts_postgresql_starter_kit_dev && ^
docker compose up -d && pause
