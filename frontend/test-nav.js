const http = require('http');
http.get('http://localhost:3000/api/fragment?name=nav', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const matches = [...d.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
    console.log(Array.from(new Set(matches)).sort().join('\n'));
  });
});
