const puppeteer = require('puppeteer');
(async () => {
  const b = await puppeteer.launch();
  const p = await b.newPage();
  await p.setRequestInterception(true);
  p.on('request', r => ['image', 'stylesheet', 'font'].includes(r.resourceType()) ? r.abort() : r.continue());
  await p.goto('http://localhost:3000/dashboard');
  await new Promise(r => setTimeout(r, 2000));
  try {
      await p.click('a[href="/dashboard/services"]');
      await new Promise(r => setTimeout(r, 2000));
      const html = await p.evaluate(() => document.body.innerHTML);
      console.log(html.substring(0, 1000));
  } catch(e) {
      console.log(e);
  }
  await b.close();
})();
