import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

(async () => {
    try {
        const browserURL = 'http://127.0.0.1:9222';
        const browser = await puppeteer.connect({ browserURL });
        const pages = await browser.pages();

        let targetPage = null;
        for (const p of pages) {
            if (p.url().includes('bill.youuhost.com')) {
                targetPage = p;
                break;
            }
        }

        if (!targetPage) {
            console.log('youuhost page not found. Please open bill.youuhost.com in Chrome.');
            await browser.disconnect();
            return;
        }

        const cartPages = [
            { name: 'cart-configure', url: 'https://bill.youuhost.com/cart.php?a=confproduct&i=0' },
            { name: 'cart-checkout', url: 'https://bill.youuhost.com/cart.php?a=checkout' },
            { name: 'dns-manager', url: 'https://bill.youuhost.com/index.php?m=DNSManager3' },
            { name: 'resolution-center', url: 'https://bill.youuhost.com/index.php?rp=/announcements' } // Placeholder for Resolution Center
        ];

        const outputDir = 'C:\\Users\\azureuser\\Desktop\\Hosting site\\backend\\fragments';

        for (const sp of cartPages) {
            console.log(`Navigating to ${sp.url}...`);
            try {
                await targetPage.goto(sp.url, { waitUntil: 'networkidle2', timeout: 60000 });
                const html = await targetPage.evaluate(() => {
                    const mainContent = document.querySelector('.app-main')?.innerHTML || document.body.innerHTML;
                    return mainContent;
                });
                fs.writeFileSync(path.join(outputDir, `${sp.name}.html`), html);
                console.log(`Saved ${sp.name}.html`);
            } catch (e) {
                console.error(`Failed: ${sp.url} - ${e.message}`);
            }
        }

        await browser.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
})();
