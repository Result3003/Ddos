const fs = require("fs");
const puppeteer = require("puppeteer");

process.on("message", async ({ workerId, url, duration }) => {
  const proxies = fs
    .readFileSync("proxies.txt", "utf-8")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const endTime = Date.now() + duration * 1000;

  async function runPuppeteer(threadNo) {
    while (Date.now() < endTime) {
      const rawProxy = proxies[
        Math.floor(Math.random() * proxies.length)
      ].replace(/^http:\/\//, "");
      const [auth, hostPort] = rawProxy.split("@");
      const [username, password] = auth.split(":");

      let browser;
      try {
        browser = await puppeteer.launch({
          headless: true,
          args: [
            `--proxy-server=http://${hostPort}`,
            "--no-sandbox",
            "--disable-setuid-sandbox",
          ],
        });

        const page = await browser.newPage();
        await page.authenticate({ username, password });
        await page.setUserAgent(
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/123 Safari/537.36"
        );

        const res = await page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        });
        const status = res.status();
        if (status >= 200 && status < 400) {
          console.log(`✅ [W${workerId}|T${threadNo}]::${status}::${hostPort}`);
        } else {
          console.log(`❌ [W${workerId}|T${threadNo}]::${status}::${hostPort}`);
        }

        await new Promise((res) => setTimeout(res, 1000));
      } catch (err) {
        console.log(
          `⛔ [W${workerId}|T${threadNo}]::${
            err.message.split("\n")[0]
          }:: ${hostPort}`
        );
      } finally {
        if (browser) await browser.close();
      }
    }
    console.log(`⛔ [Worker ${workerId}|T${threadNo}] Done.`);
  }

  const tasks = [];
  for (let i = 0; i < 10; i++) {
    tasks.push(runPuppeteer(i + 1));
  }

  await Promise.all(tasks);
  console.log(`🎉 [Worker ${workerId}] Hoàn tất.`);
});
