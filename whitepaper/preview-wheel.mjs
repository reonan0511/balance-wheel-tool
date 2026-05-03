import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 920, height: 1300 } });
const page = await ctx.newPage();
await page.goto(`file://${resolve(__dirname, 'whitepaper.html')}`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
const sections = await page.locator('section.page, section.cover').all();
console.log(`Total sections: ${sections.length}`);
// Wheel = Appendix E ≈ 26 番目あたり
for (const idx of [26, 27, 28, 29]) {
  if (idx >= sections.length) continue;
  await sections[idx].scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  const box = await sections[idx].boundingBox();
  if (!box) continue;
  await page.screenshot({
    path: `screenshots/preview-page-${String(idx + 1).padStart(2, '0')}.png`,
    clip: { x: box.x, y: box.y, width: box.width, height: Math.min(box.height, 1500) },
  });
}
await browser.close();
