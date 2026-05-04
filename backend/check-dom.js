import puppeteer from 'puppeteer';

async function main() {
  console.log('🚀 Opening Chrome and navigating to store page...\n');

  const browser = await puppeteer.launch({
    headless: false,  // Show Chrome window
    defaultViewport: { width: 1400, height: 900 },
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();

  // Capture JS errors from the page
  const pageErrors = [];
  page.on('pageerror', err => pageErrors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') pageErrors.push(msg.text());
  });

  // ── Step 1: Load the store page ────────────────────────────────────────────
  await page.goto('http://localhost:3000/store/ultasecurity', {
    waitUntil: 'networkidle2', timeout: 30000
  });
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: 'dom-check-1-loaded.png' });
  console.log('📸 Screenshot 1: Page loaded');

  // ── Step 2: Extract ALL sidebar links from Chrome DOM ─────────────────────
  const sidebarLinks = await page.evaluate(() => {
    const sidebar = document.querySelector('.hdcProSide');
    if (!sidebar) return { error: 'No .hdcProSide element found!' };

    const links = [...sidebar.querySelectorAll('a')].map(a => ({
      text: a.innerText.trim(),
      href: a.getAttribute('href'),
      fullHref: a.href,
      hasDataToggle: a.hasAttribute('data-toggle'),
      isSubItem: !!a.closest('ul.collapse'),
      isVisible: a.offsetParent !== null,
      computedDisplay: getComputedStyle(a).display,
    }));
    return { count: links.length, links };
  });

  console.log('\n📋 CHROME DOM — ALL SIDEBAR LINKS:');
  console.log('═'.repeat(80));
  if (sidebarLinks.error) {
    console.log('❌', sidebarLinks.error);
  } else {
    console.log(`Total: ${sidebarLinks.count} links\n`);
    sidebarLinks.links.forEach((link, i) => {
      const type = link.hasDataToggle ? '⬇️  EXPAND' : link.isSubItem ? '   ↳ SUB ' : '📌 MAIN ';
      const vis  = link.isVisible ? '👁  ' : '🙈 ';
      console.log(`${i+1}. ${type} ${vis} href="${link.href}" | "${link.text}"`);
    });
  }

  // ── Step 3: Click "VPS Hosting" to expand ─────────────────────────────────
  console.log('\n🖱️  Clicking VPS Hosting...');
  const vpsToggle = await page.evaluateHandle(() => {
    const links = [...document.querySelectorAll('.hdcProSide [data-toggle="collapse"]')];
    return links.find(l => l.textContent.includes('VPS Hosting')) || null;
  });
  if (vpsToggle) {
    await vpsToggle.click();
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: 'dom-check-2-vps-expanded.png' });
    console.log('📸 Screenshot 2: VPS Hosting expanded');
  }

  // ── Step 4: Check sub-items visibility after expansion ────────────────────
  const subItemsVisible = await page.evaluate(() => {
    const collapseTwo = document.querySelector('#collapseTwo');
    if (!collapseTwo) return { error: '#collapseTwo not found' };
    return {
      hasShowClass: collapseTwo.classList.contains('show'),
      display: getComputedStyle(collapseTwo).display,
      height: getComputedStyle(collapseTwo).height,
      overflow: getComputedStyle(collapseTwo).overflow,
      subLinks: [...collapseTwo.querySelectorAll('a')].map(a => ({
        text: a.innerText.trim(),
        href: a.getAttribute('href'),
        visible: a.offsetParent !== null
      }))
    };
  });

  console.log('\n🔍 #collapseTwo (VPS sub-items) state:');
  console.log(JSON.stringify(subItemsVisible, null, 2));

  // ── Step 5: Click "macOS VPS Hosting" ─────────────────────────────────────
  console.log('\n🖱️  Clicking macOS VPS Hosting...');
  const startUrl = page.url();

  const macLink = await page.$('a[href="/store/macos-vps-hosting"]');
  if (macLink) {
    await macLink.click();
    await new Promise(r => setTimeout(r, 3000));
    const afterUrl = page.url();
    await page.screenshot({ path: 'dom-check-3-after-macos-click.png' });
    console.log(`📸 Screenshot 3: After clicking macOS VPS Hosting`);
    console.log(`   Before: ${startUrl}`);
    console.log(`   After:  ${afterUrl}`);
    console.log(`   Navigation: ${afterUrl !== startUrl ? '✅ NAVIGATED!' : '❌ STAYED SAME PAGE'}`);
  } else {
    console.log('❌ macOS VPS Hosting link not found in DOM!');
  }

  // ── Step 6: JS Errors ─────────────────────────────────────────────────────
  console.log('\n⚠️  JavaScript Errors:');
  if (pageErrors.length === 0) {
    console.log('   None ✅');
  } else {
    pageErrors.forEach(e => console.log('   ❌', e));
  }

  console.log('\n✅ DOM check complete. Screenshots saved to backend/');
  await browser.close();
}

main().catch(console.error);
