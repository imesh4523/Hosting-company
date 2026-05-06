const chrome = require('chrome-cookies-secure');
const puppeteer = require('puppeteer');
const fs = require('fs');

const url = 'https://bill.ultahost.com/';

console.log("Extracting cookies from Chrome...");

chrome.getCookies(url, 'puppeteer', async function(err, cookies) {
    if (err) {
        console.error('Error extracting cookies:', err);
        return;
    }

    console.log("Cookies extracted! Launching Puppeteer...");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Set user agent to avoid bot detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    await page.setCookie(...cookies);
    console.log("Navigating to authenticated page...");
    await page.goto('https://bill.ultahost.com/account/paymentmethods/add', { waitUntil: 'networkidle2' });
    
    console.log("Waiting for rendering...");
    await new Promise(r => setTimeout(r, 3000));

    const html = await page.evaluate(() => document.documentElement.outerHTML);
    fs.writeFileSync('ultahost_authenticated.html', html);
    console.log('Saved authenticated HTML to ultahost_authenticated.html');
    
    await browser.close();
}, 'Default'); // Try Default profile
