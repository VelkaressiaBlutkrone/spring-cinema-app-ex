# ========================================
# Cinema App - Frontend (React + Vite) Dockerfile
# Node 20, React 19, TypeScript, Vite
# ========================================

# Stage 1: Build
# Build context: 프로젝트 루트 (infra/ 상위)
FROM node:20-alpine AS builder

WORKDIR /app

# 패키지 파일 복사 및 의존성 설치
COPY frontend/package*.json ./
RUN npm ci

# 소스 복사 및 빌드 (Docker: API는 /api 경로로 프록시)
COPY frontend .
ENV VITE_API_BASE_URL=/api
RUN npm run build

# Stage 2: Serve (nginx)
FROM nginx:alpine

# nginx 설정 복사 (context 기준 경로)
COPY infra/docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# 빌드 결과물 복사
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
