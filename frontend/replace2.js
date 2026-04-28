const fs = require('fs');
const path = 'public/index.html';
let html = fs.readFileSync(path, 'utf8');

const oldStr = '<a href="/github-deploy" class="uh_ai_input_placeholder" style="text-decoration:none;"><div class="form-control" style="color:#adb5bd;display:flex;align-items:center;">Paste your repo URL...</div></a>';
const newStr = '<a href="/github-deploy" class="uh_ai_input_placeholder" style="text-decoration:none;"><div class="form-control uh_hdr_ai_btn" style="color:#adb5bd;display:flex;align-items:center;border-radius:28px;width:100%;">Paste your repo URL...</div></a>';

if (html.includes(oldStr)) {
  html = html.replace(oldStr, newStr);
  fs.writeFileSync(path, html, 'utf8');
  console.log('Successfully replaced and added premium border class!');
} else {
  console.log('Target string not found in index.html');
}
