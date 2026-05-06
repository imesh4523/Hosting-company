import axios from 'axios';
import fs from 'fs';
import path from 'path';

async function download(url, filename) {
    try {
        console.log(`Downloading ${url}...`);
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        let html = response.data;
        
        // Basic absolute path fix for images/css/js if they are relative
        html = html.replace(/src="\//g, 'src="https://bill.ultahost.com/');
        html = html.replace(/href="\//g, 'href="https://bill.ultahost.com/');
        html = html.replace(/url\('\//g, "url('https://bill.ultahost.com/");
        html = html.replace(/url\("\//g, 'url("https://bill.ultahost.com/');

        const targetPath = path.join('c:/Users/azureuser/Desktop/Hosting site/backend/fragments', filename);
        fs.writeFileSync(targetPath, html);
        console.log(`Saved to ${targetPath}`);
    } catch (error) {
        console.error(`Failed to download ${url}: ${error.message}`);
    }
}

const pages = [
    { url: 'https://bill.ultahost.com/login', file: 'login.html' },
    { url: 'https://bill.ultahost.com/register.php', file: 'register.html' },
    { url: 'https://bill.ultahost.com/pwreset.php', file: 'password-reset.html' }
];

for (const page of pages) {
    await download(page.url, page.file);
}
