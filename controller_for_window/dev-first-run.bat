cd ..
cd docker-compose
cd dev

docker compose up postgresql -d

timeout /t 2 /nobreak >NUL

cd ..
cd ..
cd controller_for_window
call init.bat && ^
cd .. && ^
cd controller_for_window && ^
call dev-prisma-deploy.bat && ^
cd .. && ^
cd docker-compose && ^
cd dev && ^
docker compose up -d && pause
