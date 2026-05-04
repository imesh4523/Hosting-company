const puppeteer = require('puppeteer');

const linksToTest = [
  { name: 'Services', selector: 'a[href*="/dashboard/services"]' },
  { name: 'My Invoices', selector: 'a[href*="/dashboard/billing/invoices"]' },
  { name: 'My Quotes', selector: 'a[href*="/dashboard/billing/quotes"]' },
  { name: 'Mass Payment', selector: 'a[href*="/dashboard/billing/masspay"]' },
  { name: 'Manage Credit Card', selector: 'a[href*="/dashboard/account/paymentmethods"]' },
  { name: 'Add Funds', selector: 'a[href*="/dashboard/billing/addfunds"]' },
  { name: 'Website & Security', selector: 'a[href*="/dashboard/website-security"]' },
  { name: 'Support', selector: 'a[href*="/dashboard/support"]' },
  { name: 'Affiliates', selector: 'a[href*="/dashboard/affiliates"]' },
];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('token', 'fake-token-123');
  });

  const results = [];

  for (const link of linksToTest) {
    let finalUrl = '';
    let hasHash = false;
    let redirectsToOriginal = false;
    let pageContent = '';
    let errors = [];

    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
    
    page.removeAllListeners('console');
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    try {
      const href = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        return el ? el.getAttribute('href') : 'NOT FOUND';
      }, link.selector);

      if (href === 'NOT FOUND') {
        results.push({ ...link, href: 'Not Found in DOM', status: 'Failed', finalUrl: 'N/A', hasHash: false, redirectsToOriginal: false, errors: ['Link element not found'] });
        continue;
      }

      hasHash = href.includes('#');

      // Click the link via DOM
      await page.evaluate((sel) => {
        document.querySelector(sel).click();
      }, link.selector);
      
      await new Promise(r => setTimeout(r, 2000)); // Wait for Next.js navigation

      finalUrl = page.url();
      redirectsToOriginal = finalUrl.includes('ultahost.com');
      
      const title = await page.title();
      pageContent = title.includes('404') ? '404 Page Not Found' : 'Loaded successfully';

      results.push({
        name: link.name,
        hrefFound: href,
        finalUrl,
        hasHash,
        redirectsToOriginal,
        contentStatus: pageContent,
        errors: errors.length > 0 ? errors : ['None']
      });

    } catch (e) {
      results.push({
        name: link.name,
        hrefFound: 'Error',
        finalUrl: page.url(),
        hasHash: false,
        redirectsToOriginal: page.url().includes('ultahost.com'),
        contentStatus: 'Crashed/Timeout',
        errors: [e.message]
      });
    }
  }

  const fs = require('fs');
  fs.writeFileSync('test-results.json', JSON.stringify(results, null, 2));
  console.log("Done");
  await browser.close();
})();
