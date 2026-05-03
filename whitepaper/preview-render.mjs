import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath = `file://${resolve(__dirname, 'whitepaper.html')}`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 920, height: 1300 } });
const page = await ctx.newPage();

await page.goto(htmlPath, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000); // Google Fonts読み込み待ち

// 表紙だけ
await page.screenshot({ path: 'screenshots/whitepaper-cover.png', clip: { x: 0, y: 0, width: 920, height: 1200 } });

// 全ページの先頭部分（縦長）
await page.screenshot({ path: 'screenshots/whitepaper-allpages.png', fullPage: true });

await browser.close();
console.log('Preview rendered.');
