const fs = require('fs');
let f = fs.readFileSync('frontend/next.config.ts', 'utf8');
f = f.replace('return [', 'return [\n      { source: \'/modules/:path*\', destination: \'https://bill.ultahost.com/modules/:path*\' },');
fs.writeFileSync('frontend/next.config.ts', f);
