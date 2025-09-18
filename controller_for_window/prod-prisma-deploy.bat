cd ..
cd server

npx dotenv -e .env.dev -- npx prisma migrate deploy && npx prisma generate