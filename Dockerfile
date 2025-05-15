# 1단계: 빌드용
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

# npm 캐시를 컨테이너 내부에서 mount해서 재사용 가능하게 만듦
RUN --mount=type=cache,target=/root/.npm \
    npm install --legacy-peer-deps

COPY . .
RUN npm run build

# 2단계: 실행용 (경량화된 이미지)
FROM node:20-alpine

WORKDIR /app

# dist와 실행에 필요한 최소한의 파일만 복사
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

RUN npm install --omit=dev --legacy-peer-deps

EXPOSE 3001

CMD ["node", "dist/main.js"]