#!/bin/bash

set -e

IMAGE_NAME="dddorok-admin-backend:1.0.0"
TAR_FILE="/data/docker/dddorok-admin/deploy/dddorok-admin-backend.tar"
CONTAINER_NAME="dddorok-admin-server"
ENV_FILE="/data/docker/dddorok-admin/.env.dev"
NETWORK_NAME="backend"
BACKUP_DIR="/data/docker/dddorok-admin/backup"
BACKUP_TAG="rollback-$(date +%Y%m%d%H%M%S)"

mkdir -p "$BACKUP_DIR"

echo "📦 기존 이미지와 환경 파일 백업"
# 백업: env + 이미지 (태그명 백업용으로 리태그)
if docker inspect $CONTAINER_NAME >/dev/null 2>&1; then
  docker commit $CONTAINER_NAME "$BACKUP_TAG" || true
fi

cp "$ENV_FILE" "$BACKUP_DIR/.env.dev.$BACKUP_TAG" || true

echo "📂 .env.dev 파일 이동"
mv /data/docker/dddorok-admin/deploy/.env.dev "$ENV_FILE"

echo "🔁 기존 컨테이너 중지 및 삭제: $CONTAINER_NAME"
docker rm -f $CONTAINER_NAME || true

echo "📦 Docker 이미지 로드: $TAR_FILE"
docker load -i $TAR_FILE

echo "🧹 사용되지 않는 dangling 이미지(태그 없는 이미지) 정리"
docker image prune -f

echo "🚀 새 컨테이너 실행 중..."
set +e
docker run -d --restart unless-stopped \
  --name $CONTAINER_NAME \
  -p 3001:3001 \
  -e NODE_ENV=dev \
  -v "$ENV_FILE":/app/.env.dev \
  --network $NETWORK_NAME \
  $IMAGE_NAME
STATUS=$?
set -e

echo "사용한 이미지 삭제"
rm -f $TAR_FILE

if [ $STATUS -ne 0 ]; then
  echo "❌ 새 컨테이너 실행 실패. 롤백 시작..."

  echo "🧹 실패한 컨테이너 정리"
  docker rm -f $CONTAINER_NAME || true

  if docker image inspect "$BACKUP_TAG" >/dev/null 2>&1; then
    echo "🔄 롤백용 이미지 실행 중..."
    docker run -d --restart unless-stopped \
      --name $CONTAINER_NAME \
      -p 3001:3001 \
      -e NODE_ENV=dev \
      -v "$BACKUP_DIR/.env.dev.$BACKUP_TAG":/app/.env.dev \
      --network $NETWORK_NAME \
      "$BACKUP_TAG"
    echo "✅ 롤백 완료"
  else
    echo "⚠️ 롤백 이미지가 존재하지 않음. 수동 조치 필요"
  fi
else
  echo "✅ 배포 완료: $CONTAINER_NAME (image: $IMAGE_NAME) 실행 중"
fi