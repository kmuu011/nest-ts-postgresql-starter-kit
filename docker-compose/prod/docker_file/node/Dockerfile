FROM node:22.14.0 AS builder

WORKDIR /server

COPY server/*.json ./
RUN npm ci

COPY server/prisma ./prisma
RUN npx prisma generate

COPY server/src ./src
COPY server/.env.prod ./.env.prod
COPY server/.env ./.env

RUN npm run prod:build

FROM node:22.14.0

WORKDIR /server

COPY --from=builder /server/dist ./dist
COPY --from=builder /server/.env.prod ./.env.prod
COPY --from=builder /server/.env ./.env
COPY --from=builder /server/package*.json ./

RUN npm ci --omit=dev
RUN npm i -g dotenv-cli

COPY server/prisma ./prisma
RUN npx prisma generate

CMD ["npm", "run", "prod:start"]