const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('frontend/public/hostingcompany-vs-godaddy.html', 'utf8');
const $ = cheerio.load(html);

$('.dropdown-menu').each((i, el) => {
    if($(el).text().includes('GENERAL')) {
        console.log('Dropdown', i, 'has GENERAL');
        // print out its HTML
        console.log($(el).html().substring(0, 500));
    }
});
