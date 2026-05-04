const http = require('http');
http.get('http://localhost:3000/api/fragment?name=fullpage&page=services', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const idx = d.indexOf('class="app-main');
    console.log(d.substring(idx, idx + 500));
  });
});
