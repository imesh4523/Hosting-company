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
            if (p.url().includes('bill.ultahost.com')) {
                targetPage = p;
                break;
            }
        }
        
        if (!targetPage) {
            console.log('Could not find Ultahost page. Please make sure it is open in Chrome.');
            await browser.disconnect();
            return;
        }

        const securityPages = [
            { name: 'ssl-certificates', url: 'https://bill.ultahost.com/index.php?rp=/store/ssl-certificates' },
            { name: 'website-backup', url: 'https://bill.ultahost.com/index.php?rp=/store/codeguard' },
            { name: 'seo-tools', url: 'https://bill.ultahost.com/index.php?rp=/store/marketgoo' },
            { name: 'website-security', url: 'https://bill.ultahost.com/index.php?rp=/store/sitelock' },
            { name: 'manage-ssl', url: 'https://bill.ultahost.com/index.php?rp=/clientarea/ssl-certificates/manage' }
        ];

        const outputDir = 'C:\\Users\\azureuser\\Desktop\\Hosting site\\backend\\fragments';
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        for (const sp of securityPages) {
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
                console.error(`Failed to scrape ${sp.url}: ${e.message}`);
            }
        }

        await browser.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
})();
