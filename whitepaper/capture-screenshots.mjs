import { chromium } from 'playwright';

const URL = 'https://balance-wheel-tool.vercel.app/';

(async () => {
  const browser = await chromium.launch();

  // ① デスクトップビュー（メイン入力画面）
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    // 適度にスクロール位置をリセット
    await page.evaluate(() => window.scrollTo(0, 0));

    // フルページスクショ
    await page.screenshot({
      path: 'screenshots/desktop-main-fullpage.png',
      fullPage: true,
    });

    // 画面内スクショ（ファーストビュー）
    await page.screenshot({
      path: 'screenshots/desktop-main-firstview.png',
    });

    // チャート部分のみズーム（チャートカード周辺）
    const chartCard = await page.locator('svg.balance-chart-svg').first();
    await chartCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const cardBox = await page.locator('div.bg-white').filter({ has: page.locator('svg.balance-chart-svg') }).first().boundingBox();
    if (cardBox) {
      await page.screenshot({
        path: 'screenshots/desktop-chart-only.png',
        clip: cardBox,
      });
    }

    await context.close();
  }

  // ② モバイルビュー（iPhone 13 サイズ）
  {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    // モバイル: ファーストビュー
    await page.screenshot({
      path: 'screenshots/mobile-firstview.png',
    });

    // モバイル: フルページ
    await page.screenshot({
      path: 'screenshots/mobile-fullpage.png',
      fullPage: true,
    });

    await context.close();
  }

  // ③ シェア表示モード（モバイルサイズで「シェア表示にする」をクリック）
  {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // テストデータを入力
    await page.evaluate(() => {
      const state = {
        name: '山田 太郎',
        date: '2026-05-03',
        categories: [
          { name: '健康', currentScore: 5, idealScore: 8 },
          { name: '仕事・キャリア', currentScore: 8, idealScore: 9 },
          { name: '家族', currentScore: 4, idealScore: 8 },
          { name: '人間関係', currentScore: 6, idealScore: 7 },
          { name: '趣味・余暇', currentScore: 3, idealScore: 7 },
          { name: '自己成長', currentScore: 7, idealScore: 9 },
          { name: 'お金', currentScore: 5, idealScore: 7 },
          { name: '心の充実', currentScore: 5, idealScore: 8 },
        ],
        memo: '仕事と心の充実のギャップが大きい。週末に意識的に休む時間を作りたい。家族との時間も足りていないことを改めて実感した。',
        showIdeal: true,
      };
      localStorage.setItem('metamentor-balance-wheel-v1', JSON.stringify(state));
    });

    // リロードして反映
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    // 「シェア表示にする」ボタンをクリック
    await page.getByRole('button', { name: /シェア表示にする/ }).click();
    await page.waitForTimeout(800);

    // シェア表示のフルページスクショ
    await page.screenshot({
      path: 'screenshots/mobile-share-mode-fullpage.png',
      fullPage: true,
    });

    // シェア表示のファーストビュー
    await page.screenshot({
      path: 'screenshots/mobile-share-mode-firstview.png',
    });

    await context.close();
  }

  // ④ デスクトップで入力済み + コーチ向けCTA セクションが見える状態
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // 既存のテストデータをセット
    await page.evaluate(() => {
      const state = {
        name: '山田 太郎',
        date: '2026-05-03',
        categories: [
          { name: '健康', currentScore: 5, idealScore: 8 },
          { name: '仕事・キャリア', currentScore: 8, idealScore: 9 },
          { name: '家族', currentScore: 4, idealScore: 8 },
          { name: '人間関係', currentScore: 6, idealScore: 7 },
          { name: '趣味・余暇', currentScore: 3, idealScore: 7 },
          { name: '自己成長', currentScore: 7, idealScore: 9 },
          { name: 'お金', currentScore: 5, idealScore: 7 },
          { name: '心の充実', currentScore: 5, idealScore: 8 },
        ],
        memo: '',
        showIdeal: true,
      };
      localStorage.setItem('metamentor-balance-wheel-v1', JSON.stringify(state));
    });

    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    // コーチCTA エリアまでスクロール
    await page.locator('text=コーチの方へ').first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({
      path: 'screenshots/desktop-coach-cta.png',
    });

    await context.close();
  }

  await browser.close();
  console.log('All screenshots captured to whitepaper/screenshots/');
})();
