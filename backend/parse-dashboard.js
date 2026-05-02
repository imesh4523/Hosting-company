import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const html = fs.readFileSync('C:\\Users\\azureuser\\Desktop\\Hosting site\\frontend\\public\\clientarea-scraped.html', 'utf8');
const $ = cheerio.load(html);

// Helper to fix URLs in fragments
function fixUrls(html) {
    if (!html) return '';
    return html.replace(/https:\/\/bill\.ultahost\.com/g, '/ultahost-assets');
}

const nav = fixUrls($('.app-nav').parent().html() || $('.app-nav').html());
const main = fixUrls($('.app-main').html());

const outputDir = 'C:\\Users\\azureuser\\Desktop\\Hosting site\\backend\\fragments';
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

fs.writeFileSync(path.join(outputDir, 'nav.html'), nav);
fs.writeFileSync(path.join(outputDir, 'main.html'), main);

console.log('Fragments saved to backend/fragments/');
