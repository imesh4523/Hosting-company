const cheerio = require('cheerio');
const fs = require('fs');

const html = fs.readFileSync('original_payment_methods.html', 'utf8');
const $ = cheerio.load(html);

// Find the main container for the payment methods add form
const mainContent = $('.main-content').first();
if (mainContent.length > 0) {
    fs.writeFileSync('extracted_form.html', mainContent.html());
    console.log("Successfully extracted .main-content to extracted_form.html");
} else {
    // Try finding the form directly
    const form = $('form').filter((i, el) => $(el).text().includes('Credit - Debit Card') || $(el).text().includes('Card Number'));
    if (form.length > 0) {
        fs.writeFileSync('extracted_form.html', $.html(form));
        console.log("Successfully extracted form to extracted_form.html");
    } else {
        console.log("Could not find the form or .main-content");
    }
}
