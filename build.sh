#!/bin/bash
set -e

IMAGE_NAME="dddorok-admin-backend:1.0.0"
TAR_FILE="dddorok-admin-backend.tar"
CACHE_DIR="/tmp/.buildx-cache"

# buildx 빌더 생성 (이미 존재 시 오류 무시)
docker buildx create --name dddorok-builder --use || docker buildx use dddorok-builder

# buildx 빌드 후 결과를 로컬 Docker 데몬에 로드 (--load 사용, 없으면 에러)
docker buildx build \
  --platform linux/amd64 \
  --cache-from=type=local,src=$CACHE_DIR \
  --cache-to=type=local,dest=$CACHE_DIR \
  --load \
  -t $IMAGE_NAME \
  .

# 로컬에 로드된 이미지를 .tar로 저장
docker save -o $TAR_FILE $IMAGE_NAME