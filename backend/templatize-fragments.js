import fs from 'fs';
import path from 'path';

const navPath = 'C:\\Users\\azureuser\\Desktop\\Hosting site\\backend\\fragments\\nav.html';
const mainPath = 'C:\\Users\\azureuser\\Desktop\\Hosting site\\backend\\fragments\\main.html';

let nav = fs.readFileSync(navPath, 'utf8');
let main = fs.readFileSync(mainPath, 'utf8');

// Replace user name
nav = nav.replace(/Romania Srilanka/g, '{userName}');
main = main.replace(/Romania Srilanka/g, '{userName}');

// Fix logout links
nav = nav.replace(/\/logout\.php/g, '/api/auth/logout');
main = main.replace(/\/logout\.php/g, '/api/auth/logout');

// Remove hardcoded domain
nav = nav.replace(/https:\/\/bill\.ultahost\.com/g, '');
main = main.replace(/https:\/\/bill\.ultahost\.com/g, '');

fs.writeFileSync(navPath, nav);
fs.writeFileSync(mainPath, main);

console.log('Fragments templatized.');
