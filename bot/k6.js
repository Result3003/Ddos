import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
  vus: __ENV.VUS ? parseInt(__ENV.VUS) : 100,
  duration: __ENV.DURATION || "30s",
};

const BASE_URL = __ENV.BASE_URL || "https://example.com";

// Tạo headers giả lập trình duyệt thật
const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
  "Accept-Encoding": "gzip, deflate, br",
  "Upgrade-Insecure-Requests": "1",
  Connection: "keep-alive",
};

export default function () {
  let res = http.get(BASE_URL, { headers });

  check(res, {
    "status là 200": (r) => r.status === 200,
    "thời gian phản hồi < 500ms": (r) => r.timings.duration < 500,
  });

  sleep(1 + Math.random() * 2); // delay ngẫu nhiên 1-3 giây để giống người thật
}
