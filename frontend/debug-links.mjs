const res = await fetch('http://localhost:3000/api/fragment?name=fullpage&page=ssl_certificates');
const html = await res.text();

// Find ALL sidebar links containing 'vps' or 'vds'
const allLinks = html.match(/href="\/store\/[^"]*"/g) || [];
const vpsVds = allLinks.filter(l => l.includes('vps') || l.includes('vds') || l.includes('macos'));

console.log('=== VPS / VDS / macOS links in processed HTML ===');
vpsVds.forEach(l => console.log(' ', l));

// Check specifically around macos
const macosSections = [...html.matchAll(/macos[^"<]{0,50}/gi)];
console.log('\n=== All "macos" occurrences ===');
macosSections.forEach(m => console.log(' ', m[0]));
