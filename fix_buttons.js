const fs = require('fs');

let f1 = fs.readFileSync('frontend/src/app/login/page.tsx', 'utf8');
f1 = f1.replace(
  '<button className="social-button-item">\\n              <svg width="20" height="20" fill="#1877F2"',
  '<button className="social-button-item btn-facebook">\\n              <svg width="20" height="20" fill="#1877F2"'
);
f1 = f1.replace(
  'class="social-button-item btn-facebook"',
  'className="social-button-item btn-facebook"'
);
f1 = f1.replace(
  '<div style={{ textAlign: \'center\', marginTop: \'20px\', fontSize: \'13.5px\', color: \'#888\' }}>\\n            Don&apos;t have an account?{\' \'}\\n            <Link href="/register" style={{ color: \'#5145FF\', fontWeight: 600, textDecoration: \'none\' }}>\\n              Create Account\\n            </Link>',
  '<div style={{ textAlign: \'center\', marginTop: \'30px\', fontSize: \'14px\', color: \'#666\' }}>\\n            Not a member yet?{\' \'}\\n            <Link href="/register" style={{ color: \'#3B82F6\', fontWeight: 600, textDecoration: \'none\' }}>\\n              Create a New Account\\n            </Link>'
);
fs.writeFileSync('frontend/src/app/login/page.tsx', f1);

let f2 = fs.readFileSync('frontend/src/app/register/page.tsx', 'utf8');
f2 = f2.replace(
  '<button className="social-button-item">\\n              <svg width="20" height="20" fill="#1877F2"',
  '<button className="social-button-item btn-facebook">\\n              <svg width="20" height="20" fill="#1877F2"'
);
fs.writeFileSync('frontend/src/app/register/page.tsx', f2);
