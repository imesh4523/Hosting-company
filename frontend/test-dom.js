const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('token', 'fake-token');
  });

  await page.goto('http://localhost:3000/dashboard/services', { waitUntil: 'networkidle0' });
  
  await page.screenshot({ path: 'services-screenshot.png' });
  
  const html = await page.evaluate(() => document.body.innerHTML);
  fs.writeFileSync('services-dom.html', html);
  
  console.log('My Dashboard text count:', (html.match(/My Dashboard/g) || []).length);
  console.log('Products text count:', (html.match(/My Products/g) || []).length);
  
  await browser.close();
})();
