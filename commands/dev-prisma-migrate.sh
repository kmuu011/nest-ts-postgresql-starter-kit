#!/bin/bash

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# 마이그레이션 이름 입력 받기
read -p "Enter migration name: " NAME

# 마이그레이션 이름이 비어있으면 에러
if [ -z "$NAME" ]; then
    echo "Migration name is required"
    exit 1
fi

# 서버 디렉토리로 이동
cd "$PROJECT_ROOT/server"

# Prisma 마이그레이션 생성
npx dotenv -e .env.dev -- npx prisma migrate dev --name "$NAME"

# Prisma 클라이언트 생성
npx dotenv -e .env -- npx prisma generate