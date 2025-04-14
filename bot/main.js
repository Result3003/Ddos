const { fork } = require("child_process");
const path = require("path");

const args = process.argv.slice(2);
const NUM_WORKERS = parseInt(args[0], 10);
const TARGET_URL = args[1] || "https://example.com";
const RUNTIME_SEC = parseInt(args[2] || "300", 10); // default 5 phút

if (isNaN(NUM_WORKERS)) {
  console.error(
    "❌ Cú pháp sai. Dùng: node main.js <num_workers> <url> <duration_in_sec>"
  );
  process.exit(1);
}

console.log(
  `🚀 Khởi chạy ${NUM_WORKERS} workers, mỗi worker chạy 10 Puppeteer cho ${RUNTIME_SEC}s`
);

for (let i = 0; i < NUM_WORKERS; i++) {
  const worker = fork(path.join(__dirname, "worker.js"));
  worker.send({ workerId: i + 1, url: TARGET_URL, duration: RUNTIME_SEC });
}
