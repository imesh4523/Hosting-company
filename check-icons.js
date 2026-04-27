const fs = require('fs');
const html = fs.readFileSync('./frontend/public/dashboard-static.html', 'utf8');

const regex = /<li[^>]*>\s*<a[^>]*>\s*<i[^>]*><\/i>\s*Account Details\s*<\/a>\s*<\/li>/ig;
// The text is separated by whitespace. Let's find "Account Details" in the header.
const regex2 = /<i class="([^"]+)"[^>]*>\s*<\/i>\s*Account Details/i;
const match2 = html.match(regex2);
console.log(match2 ? match2[1] : 'No match2');

const regex3 = /<i class="([^"]+)"[^>]*>\s*<\/i>\s*Contacts/i;
const match3 = html.match(regex3);
console.log(match3 ? match3[1] : 'No match3');
