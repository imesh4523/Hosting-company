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
            console.log('Could not find youuhost page.');
            await browser.disconnect();
            return;
        }

        const subpages = [
            { name: 'affiliates', url: 'https://bill.youuhost.com/affiliates.php' },
            { name: 'knowledgebase', url: 'https://bill.youuhost.com/knowledgebase.php' },
            { name: 'announcements', url: 'https://bill.youuhost.com/announcements.php' },
            { name: 'network-status', url: 'https://bill.youuhost.com/serverstatus.php' },
            { name: 'downloads', url: 'https://bill.youuhost.com/downloads.php' },
            { name: 'security', url: 'https://bill.youuhost.com/clientarea.php?action=details' }
        ];

        const outputDir = 'C:\\Users\\azureuser\\Desktop\\Hosting site\\backend\\fragments';

        for (const sp of subpages) {
            console.log(`Navigating to ${sp.url}...`);
            try {
                await targetPage.goto(sp.url, { waitUntil: 'networkidle2', timeout: 30000 });
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
