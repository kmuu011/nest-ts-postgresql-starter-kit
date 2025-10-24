cd ..
cd docker-compose
cd prod

docker compose up postgresql -d

timeout /t 2 /nobreak >NUL

cd ..
cd ..
cd controller_for_window
call init.bat && ^
cd .. && ^
cd controller_for_window && ^
call prod-prisma-deploy.bat && ^
cd .. && ^
cd controller_for_window && ^
call prod-build-server-image.bat && ^
cd docker-compose && ^
cd prod && ^
docker compose up -d && pause