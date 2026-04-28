const fs = require('fs');

let f1 = fs.readFileSync('frontend/src/app/login/page.tsx', 'utf8');
f1 = f1.replace(/<button className="social-button-item">([\s\S]*?)Facebook/i, '<button className="social-button-item btn-facebook">$1Facebook');
f1 = f1.replace(/Don&apos;t have an account\?\{\' \'\}[\s\S]*?Create Account[\s\S]*?<\/Link>/i, 'Not a member yet?{\' \'}\\n            <Link href="/register" style={{ color: \'#3B82F6\', fontWeight: 600, textDecoration: \'none\' }}>\\n              Create a New Account\\n            </Link>');
// Make sure "or" is lowercase
f1 = f1.replace(/<span>or<\/span>/i, '<span>or</span>');

fs.writeFileSync('frontend/src/app/login/page.tsx', f1);

let f2 = fs.readFileSync('frontend/src/app/register/page.tsx', 'utf8');
f2 = f2.replace(/<button className="social-button-item">([\s\S]*?)Facebook/i, '<button className="social-button-item btn-facebook">$1Facebook');
f2 = f2.replace(/<span>or<\/span>/i, '<span>or</span>');

fs.writeFileSync('frontend/src/app/register/page.tsx', f2);
