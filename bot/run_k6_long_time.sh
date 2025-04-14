#!/bin/bash

BASE_URL="https://sh1bet.live"
VUS=300
DURATION="4h"

# Chạy tiến trình k6 song song tương ứng với mỗi proxy
while read -r proxy; do
  HTTP_PROXY="$proxy" nohup k6 run test.js \
    -e BASE_URL=$BASE_URL \
    -e VUS=$VUS \
    -e DURATION=$DURATION \
    > /dev/null 2>&1 &
done < proxies_k6.txt

echo "🚀 Đã khởi động tất cả tiến trình k6 với proxy!"
