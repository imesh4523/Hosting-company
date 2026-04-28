const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('./frontend/public/index.html', 'utf8');
const $ = cheerio.load(html);

$('style').each((i, el) => {
    const text = $(el).html();
    const match = text.match(/\.shared-ico\{.*?\}/);
    if (match) {
        console.log(`Found in style ${i}:`, match[0]);
    } else {
        // try looking for a looser match
        const looseMatch = text.match(/\.shared-ico[^}]+\}/);
        if (looseMatch) {
            console.log(`Found loose match in style ${i}:`, looseMatch[0]);
        }
    }
});
