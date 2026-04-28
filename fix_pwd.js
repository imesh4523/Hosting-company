const fs = require('fs');
let f = fs.readFileSync('frontend/next.config.ts', 'utf8');
f = f.replace('return [', "return [\n      { source: '/password/reset', destination: '/password-reset.html' },\n      { source: '/password/:path*', destination: '/password-reset.html' },");
fs.writeFileSync('frontend/next.config.ts', f);
console.log('Added password/reset rewrite');
console.log(fs.readFileSync('frontend/next.config.ts', 'utf8'));
