-- Jest 전용 데이터베이스 생성
-- 컨테이너 최초 기동 시 한 번만 실행된다.
DO
$$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_database WHERE datname = 'my_db_jest'
    ) THEN
        EXECUTE 'CREATE DATABASE my_db_jest OWNER starter ENCODING ''UTF8'' LC_COLLATE=''en_US.UTF-8'' LC_CTYPE=''en_US.UTF-8'' TEMPLATE template0';
    END IF;
END
$$;

GRANT ALL PRIVILEGES ON DATABASE my_db_jest TO starter;

