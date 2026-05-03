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

// 問いかけ集ページ (chapter 6) と ケーススタディページを撮影
const sections = await page.locator('section.page, section.cover').all();
const targetIndices = [13, 14, 15, 18, 19, 20, 22, 24]; // 問いかけ・ケース・付録D
for (const idx of targetIndices) {
  if (idx >= sections.length) continue;
  await sections[idx].scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  const box = await sections[idx].boundingBox();
  if (!box) continue;
  await page.screenshot({
    path: `screenshots/preview-page-${String(idx + 1).padStart(2, '0')}.png`,
    clip: { x: box.x, y: box.y, width: box.width, height: Math.min(box.height, 1500) },
  });
  console.log(`✓ page ${idx + 1}`);
}

await browser.close();
