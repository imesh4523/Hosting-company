const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('./frontend/public/index.html', 'utf8');
const $ = cheerio.load(html);

console.log("Nav links:");
$('.navbar-nav.mx-auto > li > span, .navbar-nav.mx-auto > li > a').each((i, el) => {
    console.log(i + ': ' + $(el).text().trim());
});

console.log("\nThird nav item sub-links:");
$('.navbar-nav.mx-auto > li').eq(2).find('a').each((i, el) => {
    console.log($(el).text().trim() + ' -> ' + $(el).attr('href'));
});
