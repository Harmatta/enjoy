// Visual test script for enjoy - captures all time periods
// Run with: node tests/visual-test.js

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TIME_PERIODS = [
  { key: 'dawn', hour: 6, emoji: '🌅' },
  { key: 'morning', hour: 9, emoji: '☀️' },
  { key: 'noon', hour: 13, emoji: '🌞' },
  { key: 'afternoon', hour: 16, emoji: '🌤️' },
  { key: 'sunset', hour: 19, emoji: '🌆' },
  { key: 'night', hour: 23, emoji: '🌙' }
];

async function captureTimeScreenshots() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    timezoneId: 'Europe/Rome'
  });
  
  const page = await context.newPage();
  
  console.log('🎬 Starting visual test for enjoy...\n');
  
  for (const period of TIME_PERIODS) {
    // Override time for this period
    await context.addInitScript(`{
      const targetHour = ${period.hour};
      Date.prototype.getHours = function() { return targetHour; };
      Date.prototype.getMinutes = function() { return 30; };
    }`);
    
    await page.goto('https://fabriziosalmi.github.io/enjoy/', { 
      waitUntil: 'networkidle' 
    });
    
    // Wait for animations to settle
    await page.waitForTimeout(2000);
    
    const screenshotPath = join(__dirname, '..', 'screenshots', `time-${period.key}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    
    console.log(`${period.emoji} Captured: ${period.key} (${period.hour}:30 CET)`);
  }
  
  // Mobile screenshot
  await context.close();
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    timezoneId: 'Europe/Rome'
  });
  
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('https://fabriziosalmi.github.io/enjoy/', { 
    waitUntil: 'networkidle' 
  });
  await mobilePage.waitForTimeout(2000);
  
  const mobileScreenshot = join(__dirname, '..', 'screenshots', 'mobile.png');
  await mobilePage.screenshot({ path: mobileScreenshot });
  console.log(`📱 Captured: mobile view`);
  
  await browser.close();
  
  console.log('\n✅ Visual test complete! Screenshots saved to /screenshots/');
  console.log('\nGenerated files:');
  TIME_PERIODS.forEach(p => console.log(`  - time-${p.key}.png`));
  console.log('  - mobile.png');
}

captureTimeScreenshots().catch(console.error);
