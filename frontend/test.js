const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Intercept requests to avoid hanging on external resources
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
      request.abort();
    } else {
      request.continue();
    }
  });

  try {
    await page.goto('http://localhost:3000/dashboard/services', { waitUntil: 'networkidle2', timeout: 10000 });
    // Wait for FragmentPage's fetch to finish
    await new Promise(r => setTimeout(r, 2000));
    const html = await page.evaluate(() => document.body.innerHTML);
    console.log("HTML_START");
    console.log(html.substring(0, 1500));
    console.log("HTML_END");
    
    // Check if it's the nextjs 404
    const is404 = await page.evaluate(() => document.title.includes('404'));
    console.log("IS_404:", is404);
  } catch (e) {
    console.error(e);
  } finally {
    await browser.close();
  }
})();
