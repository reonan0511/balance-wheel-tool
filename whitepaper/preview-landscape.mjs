import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch();
// Landscape A4 in pixels @ 96dpi: 1123×794
const ctx = await browser.newContext({ viewport: { width: 1180, height: 850 } });
const page = await ctx.newPage();
await page.goto(`file://${resolve(__dirname, 'whitepaper.html')}`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
const sections = await page.locator('section.page, section.cover').all();
console.log(`Total sections: ${sections.length}`);
const targets = [0, 1, 2, 3, 4, 5];  // cover, about, tool intro, TOC, part1 divider, ch1
for (const idx of targets) {
  if (idx >= sections.length) continue;
  await sections[idx].scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  const box = await sections[idx].boundingBox();
  if (!box) continue;
  await page.screenshot({
    path: `screenshots/landscape-page-${String(idx + 1).padStart(2, '0')}.png`,
    clip: { x: box.x, y: box.y, width: box.width, height: Math.min(box.height, 900) },
  });
  console.log(`✓ landscape-page-${String(idx + 1).padStart(2, '0')}.png`);
}
await browser.close();
