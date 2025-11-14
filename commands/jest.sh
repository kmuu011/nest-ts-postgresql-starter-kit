#!/bin/bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# 서버 디렉터리로 이동
cd "$PROJECT_ROOT/server"

# 테스트용 DB를 최신 스키마로 초기화
npx dotenv -e .env -e .env.jest -- npx prisma migrate reset --force --skip-seed
npx dotenv -e .env -e .env.jest -- npx prisma generate

# Jest 실행
echo ""
echo "테스트 실행 중..."
npm run jest:run