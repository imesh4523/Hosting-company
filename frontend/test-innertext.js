const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('token', 'fake-token');
  });

  await page.goto('http://localhost:3000/dashboard/services', { waitUntil: 'networkidle0' });
  
  const text = await page.evaluate(() => document.body.innerText);
  console.log('--- START INNER TEXT ---');
  console.log(text.substring(0, 1000)); // Print first 1000 characters
  console.log('--- END INNER TEXT ---');
  
  await browser.close();
})();
