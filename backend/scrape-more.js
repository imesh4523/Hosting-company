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
            console.log('Could not find Ultahost page.');
            await browser.disconnect();
            return;
        }

        const subpages = [
            { name: 'addfunds', url: 'https://bill.ultahost.com/clientarea.php?action=addfunds' },
            { name: 'masspay', url: 'https://bill.ultahost.com/clientarea.php?action=masspay' },
            { name: 'tickets', url: 'https://bill.ultahost.com/clientarea.php?action=tickets' }
        ];

        const outputDir = 'C:\\Users\\azureuser\\Desktop\\Hosting site\\backend\\fragments';

        for (const sp of subpages) {
            console.log(`Navigating to ${sp.url}...`);
            await targetPage.goto(sp.url, { waitUntil: 'networkidle2' });
            
            const html = await targetPage.evaluate(() => {
                const mainContent = document.querySelector('.app-main')?.innerHTML || document.body.innerHTML;
                return mainContent;
            });
            
            fs.writeFileSync(path.join(outputDir, `${sp.name}.html`), html);
            console.log(`Saved ${sp.name}.html`);
        }

        await browser.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
})();
