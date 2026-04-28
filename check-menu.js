const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('frontend/public/hostingcompany-vs-godaddy.html', 'utf8');
const $ = cheerio.load(html);

const menuHtml = $('.dropdown-menu:contains("GENERAL")').html();
console.log(menuHtml ? menuHtml.substring(0, 800) : "Menu not found");
