-- Jest 전용 데이터베이스 생성 (함수/트랜잭션 밖에서 실행되도록 \gexec 사용)
-- 첫 초기화 시점에만 실행되며, 이미 존재하면 아무 작업도 수행하지 않음.
SELECT 'CREATE DATABASE my_db_jest OWNER starter ENCODING ''UTF8'' LC_COLLATE ''en_US.UTF-8'' LC_CTYPE ''en_US.UTF-8'' TEMPLATE template0'
WHERE NOT EXISTS (
    SELECT FROM pg_database WHERE datname = 'my_db_jest'
)\gexec

GRANT ALL PRIVILEGES ON DATABASE my_db_jest TO starter;