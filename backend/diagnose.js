import fs from 'fs';

const p = 'C:\\Users\\azureuser\\Desktop\\Hosting site\\frontend\\src\\app\\dashboard\\fragments.ts';
let c = fs.readFileSync(p, 'utf8');

// Find instances of //dashboard in the TS file
// When JSON.stringify encodes a string with `//dashboard`, it will appear as `\/\/dashboard` in the JSON string literal
// But since JSON.stringify doesn't escape forward slashes by default, it will be `//dashboard`
// The issue is the TS file contains: "//dashboard
// We need to replace all occurrences of `//dashboard` with `/dashboard` in the file

// Count occurrences
const count1 = (c.match(/\\\\\/\\\\\/dashboard/g) || []).length;
const count2 = (c.match(/\/\/dashboard/g) || []).length;
console.log(`Found ${count1} escaped occurrences and ${count2} literal occurrences of //dashboard`);

// Show a sample
const idx = c.indexOf('//dashboard');
if (idx !== -1) {
    console.log('Sample context:', c.substring(Math.max(0, idx-50), idx+100));
}
