import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath = `file://${resolve(__dirname, 'whitepaper.html')}`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 920, height: 1300 } });
const page = await ctx.newPage();

await page.goto(htmlPath, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);

// 各 section の boundingBox を取得して個別撮影
const sections = await page.locator('section.page, section.cover').all();
for (let i = 0; i < Math.min(sections.length, 8); i++) {
  await sections[i].scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  const box = await sections[i].boundingBox();
  if (!box) continue;
  await page.screenshot({
    path: `screenshots/preview-page-${String(i + 1).padStart(2, '0')}.png`,
    clip: { x: box.x, y: box.y, width: box.width, height: Math.min(box.height, 1300) },
  });
  console.log(`✓ page ${i + 1}: ${box.width}x${Math.min(box.height, 1300)}`);
}

await browser.close();
console.log('Pages rendered.');
