#!/bin/bash

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# 서버 디렉토리로 이동
cd "$PROJECT_ROOT/server"

npx dotenv -e .env.prod -- npx prisma migrate deploy
npx prisma generate