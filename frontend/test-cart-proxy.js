const https = require('https');

function fetchWithCookies(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const cookies = res.headers['set-cookie'];

      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Handle redirect
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          redirectUrl = 'https://bill.youuhost.com' + redirectUrl;
        }

        console.log(`Redirecting to: ${redirectUrl} with cookies:`, cookies ? cookies.length : 0);

        const req = https.get(redirectUrl, {
          headers: {
            'Cookie': cookies ? cookies.map(c => c.split(';')[0]).join('; ') : ''
          }
        }, (res2) => {
          let data = '';
          res2.on('data', chunk => data += chunk);
          res2.on('end', () => resolve(data));
        });
        req.on('error', reject);
      } else {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }
    }).on('error', reject);
  });
}

fetchWithCookies('https://bill.youuhost.com/store/macos-vps-hosting/basic-macos-vps')
  .then(html => {
    console.log('Final HTML length:', html.length);
    console.log('Contains Configure:', html.includes('Configure'));
    const fs = require('fs');
    fs.writeFileSync('proxy-cart.html', html);
  })
  .catch(console.error);
