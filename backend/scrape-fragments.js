import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

// ── CONFIG ─────────────────────────────────────────────────────────────────
const EMAIL = 'Imeshcheak2@gmail.com';
const PASSWORD = 'Is4P4WvggnIX>Ktno(';
const BASE_URL = 'https://bill.youuhost.com';
const OUT_DIR = path.join('C:\\Users\\azureuser\\Desktop\\Hosting site\\backend\\fragments');

// Pages to scrape: { filename, path }
const PAGES_TO_SCRAPE = [
  { file: 'main.html', url: '/clientarea.php' },
  { file: 'invoices.html', url: '/clientarea.php?action=invoices' },
  { file: 'quotes.html', url: '/clientarea.php?action=quotes' },
  { file: 'addfunds.html', url: '/clientarea.php?action=addfunds' },
  { file: 'services.html', url: '/clientarea.php?action=services' },
  { file: 'domains.html', url: '/clientarea.php?action=domains' },
  { file: 'tickets.html', url: '/supporttickets.php' },
  { file: 'affiliates.html', url: '/affiliates.php' },
  { file: 'announcements.html', url: '/announcements.php' },
  { file: 'knowledgebase.html', url: '/knowledgebase.php' },
  { file: 'downloads.html', url: '/downloads.php' },
  { file: 'network-status.html', url: '/serverstatus.php' },
  { file: 'ssl-certificates.html', url: '/store/ultasecurity' },
  { file: 'website-backup.html', url: '/store/codeguard' },
  { file: 'website-security.html', url: '/store/sitelock' },
  { file: 'seo-tools.html', url: '/store/marketgoo' },
  { file: 'security.html', url: '/clientarea.php?action=security' },
  { file: 'dns-manager.html', url: '/index.php?m=DNSManager3' },
];

// ── HELPERS ────────────────────────────────────────────────────────────────
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function loginToyouuhost(page) {
  console.log('🔐 Going to login page...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));

  // Take screenshot to see the login page
  await page.screenshot({ path: 'pre-login.png' });

  console.log('   Filling email...');
  await page.focus('input[placeholder="Enter email"], input[type="email"]');
  await page.keyboard.type(EMAIL, { delay: 50 });

  console.log('   Filling password...');
  await page.focus('input[type="password"]');
  await page.keyboard.type(PASSWORD, { delay: 50 });

  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'filled-login.png' });

  console.log('   Clicking Login button...');
  // Use locator to find and click button by text (real user gesture)
  try {
    await page.locator('button').filter({ hasText: /^Login$/ }).click({ timeout: 5000 });
  } catch {
    // Fallback: find by position
    await page.evaluate(() => {
      const btns = [...document.querySelectorAll('button')];
      const loginBtn = btns.find(b => /login/i.test(b.textContent.trim()));
      if (loginBtn) loginBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });
  }

  // Screenshot right after click to see error messages
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: 'post-click.png' });

  // Poll for URL change instead of waitForNavigation (works with React SPA)
  console.log('   Waiting for login...');
  let loggedIn = false;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const url = page.url();
    console.log('   Current URL:', url);
    if (!url.includes('/login')) {
      loggedIn = true;
      break;
    }
  }

  if (!loggedIn) {
    await page.screenshot({ path: 'login-debug.png' });
    throw new Error('❌ Login failed after 40s. Screenshot: login-debug.png');
  }
  console.log('✅ Logged in!');
}

// ── MAIN ───────────────────────────────────────────────────────────────────
async function scrapeFragments() {
  ensureDir(OUT_DIR);

  const browser = await puppeteer.launch({
    headless: false,          // set to true to run in background
    defaultViewport: { width: 1280, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    await loginToyouuhost(page);

    for (const { file, url } of PAGES_TO_SCRAPE) {
      const fullUrl = `${BASE_URL}${url}`;
      console.log(`📄 Scraping: ${fullUrl}`);

      try {
        await page.goto(fullUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        await new Promise(r => setTimeout(r, 1500)); // wait for dynamic content

        const html = await page.content();
        const outPath = path.join(OUT_DIR, file);
        fs.writeFileSync(outPath, html, 'utf8');
        console.log(`   ✅ Saved → ${file} (${Math.round(html.length / 1024)}kb)`);
      } catch (err) {
        console.warn(`   ⚠️  Failed to scrape ${url}: ${err.message}`);
      }
    }

    console.log('\n🎉 All fragments scraped and saved!');
    console.log(`📁 Output: ${OUT_DIR}`);

  } finally {
    await browser.close();
  }
}

scrapeFragments().catch(console.error);
