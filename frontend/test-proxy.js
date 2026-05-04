const fs = require('fs');

fetch('https://bill.ultahost.com/store/macos-vds-hosting')
  .then(r => r.text())
  .then(html => {
    fs.writeFileSync('proxy-test.html', html);
    const mainContentStart = html.indexOf('<div class="main-content');
    if (mainContentStart !== -1) {
      const mainContent = html.substring(mainContentStart, mainContentStart + 2000);
      console.log('Found main content!');
      console.log(mainContent.substring(0, 500));
    } else {
      console.log('Main content not found!');
    }
  });
