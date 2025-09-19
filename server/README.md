# nest-ts-postgresql-starter-kit

## Prerequisites
- **Node.js v22** 이상
- **Docker Desktop** 설치

## Windows 환경에서 개발 서버 실행 방법
1. **컨트롤러 실행**  
   `controller_for_window/dev-first-run.bat` 파일을 실행합니다.

2. **서버 실행**  
   `dev-open-server.bat` 파일을 실행하면 서버가 시작됩니다.

## Windows 환경에서 Production 서버 배포 및 마이그레이션 방법

### 1. Prisma 마이그레이션 생성 (개발 환경)
- 새로운 마이그레이션을 생성하려면  
  `controller_for_window/prod-prisma-migrate.bat` 파일을 실행하고, 마이그레이션 이름을 입력하세요.

### 2. Prisma 마이그레이션 배포 (운영 환경)
- 운영 환경에 마이그레이션을 적용하려면  
  `controller_for_window/prod-prisma-deploy.bat` 파일을 실행하세요.

### 3. 서버 이미지 빌드
- 서버 이미지를 빌드하려면  
  `controller_for_window/build-server-image.bat` 파일을 실행하세요.

### 4. 무중단 서버 배포
- 무중단 배포를 하려면  
  `controller_for_window/prod-release-server.bat` 파일을 실행하세요.
