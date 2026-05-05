const https = require('https');
https.get('https://youuhost.com/', (res) => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
        const matches = d.match(/<link[^>]*rel=['"]stylesheet['"][^>]*>/gi);
        console.log(matches);
    });
});
