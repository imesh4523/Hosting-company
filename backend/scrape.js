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
            { name: 'invoices', url: 'https://bill.ultahost.com/clientarea.php?action=invoices' },
            { name: 'quotes', url: 'https://bill.ultahost.com/clientarea.php?action=quotes' },
            { name: 'services', url: 'https://bill.ultahost.com/clientarea.php?action=services' },
            { name: 'domains', url: 'https://bill.ultahost.com/clientarea.php?action=domains' }
        ];

        const outputDir = 'C:\\Users\\azureuser\\Desktop\\Hosting site\\backend\\fragments';
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        for (const sp of subpages) {
            console.log(`Navigating to ${sp.url}...`);
            await targetPage.goto(sp.url, { waitUntil: 'networkidle2' });
            
            const html = await targetPage.evaluate(() => {
                const mainContent = document.querySelector('.app-main')?.innerHTML || document.body.innerHTML;
                return mainContent;
            });

            // Fix URLs
            const fixedHtml = html.replace(/https:\/\/bill\.ultahost\.com/g, '');
            
            fs.writeFileSync(path.join(outputDir, `${sp.name}.html`), fixedHtml);
            console.log(`Saved ${sp.name}.html`);
        }

        await browser.disconnect();
        console.log('Finished scraping subpages.');
    } catch (err) {
        console.error('Error:', err);
    }
})();
