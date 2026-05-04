const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('token', 'fake');
  });

  await page.setRequestInterception(true);
  page.on('request', r => ['image', 'stylesheet', 'font'].includes(r.resourceType()) ? r.abort() : r.continue());

  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  
  const beforeHtml = await page.evaluate(() => document.body.innerHTML);
  console.log('Before click, contains Services:', beforeHtml.includes('My Products &amp; Services'));
  console.log('Before click, contains Dashboard:', beforeHtml.includes('Your Active Products/Services'));

  await page.evaluate(() => {
    const el = document.querySelector('a[href="/dashboard/services"]');
    if(el) el.click();
  });
  
  await new Promise(r => setTimeout(r, 3000));
  
  const afterHtml = await page.evaluate(() => document.body.innerHTML);
  console.log('After click URL:', page.url());
  console.log('After click, contains Services:', afterHtml.includes('My Products &amp; Services'));
  console.log('After click, contains Dashboard:', afterHtml.includes('Your Active Products/Services'));

  await browser.close();
})();
