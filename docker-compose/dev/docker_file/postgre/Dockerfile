FROM postgres:16-bookworm

# 기본 유틸리티 설치
RUN apt-get update && \
    apt-get install -y -V ca-certificates lsb-release wget gnupg && \
    rm -rf /var/lib/apt/lists/*

# Groonga APT 저장소 추가
RUN wget https://packages.groonga.org/debian/groonga-apt-source-latest-bookworm.deb && \
    apt-get install -y -V ./groonga-apt-source-latest-bookworm.deb && \
    rm groonga-apt-source-latest-bookworm.deb

# PGroonga + Normalizer 설치
RUN apt-get update && \
    apt-get install -y -V postgresql-16-pgdg-pgroonga groonga-normalizer-mysql && \
    rm -rf /var/lib/apt/lists/*

COPY initdb/ /docker-entrypoint-initdb.d/