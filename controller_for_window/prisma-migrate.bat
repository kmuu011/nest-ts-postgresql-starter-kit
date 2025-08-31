@echo off
set /p NAME=Enter migration name:

if "%NAME%"=="" (
    echo Migration name is required
    pause
    exit /b 1
)

cd ..
cd server

npx prisma migrate dev --name %NAME% & pause
npx prisma generate & pause