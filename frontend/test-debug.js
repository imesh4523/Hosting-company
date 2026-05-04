const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('token', 'fake-token');
  });

  page.on('request', r => console.log('REQ:', r.url()));
  page.on('response', r => console.log('RES:', r.url(), r.status()));

  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
  
  console.log("Going to click 'My Invoices'...");
  await page.evaluate(() => {
    document.querySelector('a[href="/dashboard/billing/invoices"]').click();
  });

  await new Promise(r => setTimeout(r, 4000));
  
  console.log('Final URL:', page.url());
  const html = await page.evaluate(() => document.body.innerHTML);
  console.log('HTML size:', html.length);
  const fs = require('fs');
  fs.writeFileSync('debug-ui.html', html);
  await browser.close();
})();
