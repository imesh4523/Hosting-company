const fs = require('fs');
const path = './frontend/public/dashboard-static.html';

let html = fs.readFileSync(path, 'utf8');

if (!html.includes('font-awesome/6.5.0/css/all.min.css')) {
  // Inject FontAwesome CDN
  const fontAwesomeLink = '\n<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">\n<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">\n<style>\n /* Override custom icon fonts that fail CORS */\n .lm, .fa, .fas, .far { font-family: "Font Awesome 6 Free", "Font Awesome 5 Free", "FontAwesome" !important; }\n</style>\n';
  html = html.replace('</head>', fontAwesomeLink + '</head>');
  fs.writeFileSync(path, html, 'utf8');
  console.log('FontAwesome injected successfully.');
} else {
  console.log('FontAwesome already injected.');
}
