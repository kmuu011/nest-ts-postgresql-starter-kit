cd ..
cd docker-compose
cd nest_ts_postgresql_starter_kit_prod

docker compose stop node_0
docker compose rm -f node_0
docker compose up -d --no-deps node_0

docker compose stop node_1
docker compose rm -f node_1
docker compose up -d --no-deps node_1
