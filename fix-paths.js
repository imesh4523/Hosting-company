const fs = require('fs');
const path = require('path');

const publicDir = 'c:/Users/azureuser/Desktop/Hosting site/frontend/public';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.html') || file.endsWith('.css') || file.endsWith('.js')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(publicDir);
let changedCount = 0;

files.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Fix CSS urls in inline styles and HTML src/hrefs
    const dirs = ['themes', 'img', 'images', 'uploads', 'fonts', 'js', 'css', 'assets'];
    
    dirs.forEach(d => {
        // url('themes/ -> url('/themes/
        content = content.replace(new RegExp(`url\\((['"]?)${d}\\/`, 'g'), `url($1/${d}/`);
        
        // src="themes/ -> src="/themes/
        content = content.replace(new RegExp(`src=(['"])${d}\\/`, 'g'), `src=$1/${d}/`);
        
        // href="themes/ -> href="/themes/
        content = content.replace(new RegExp(`href=(['"])${d}\\/`, 'g'), `href=$1/${d}/`);
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        changedCount++;
    }
});

console.log(`Fixed relative paths in ${changedCount} files.`);
