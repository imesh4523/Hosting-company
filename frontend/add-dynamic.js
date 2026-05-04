const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (file === 'page.tsx') {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('FragmentPage') && !content.includes('force-dynamic')) {
        let newContent = content;
        if (newContent.includes("'use client';") || newContent.includes('"use client";')) {
          newContent = newContent.replace(/['"]use client['"];?\n?/, "'use client';\nexport const dynamic = 'force-dynamic';\n");
        } else {
          newContent = "'use client';\nexport const dynamic = 'force-dynamic';\n" + newContent;
        }
        fs.writeFileSync(fullPath, newContent);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir('c:/Users/azureuser/Desktop/Hosting site/frontend/src/app/dashboard');
console.log('Done');
