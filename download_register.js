const fs = require('fs');
const https = require('https');

https.get('https://bill.youuhost.com/register.php', (res) => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
        console.log('Downloaded register, size:', d.length);
        console.log('Has SocialMedia:', d.includes('SocialMedia'));
        console.log('Has fa-facebook:', d.includes('fa-facebook'));
        fs.writeFileSync('frontend/public/register.html', d);
        console.log('Saved register.html');
    });
});
