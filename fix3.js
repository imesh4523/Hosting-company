const fs = require('fs');

const facebookSvg = `<svg width="20" height="20" viewBox="0 0 24 24"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/><path fill="#fff" d="M16.671 15.542l.532-3.469h-3.328V9.823c0-.949.465-1.874 1.956-1.874h1.514V5.004s-1.374-.235-2.686-.235c-2.741 0-4.533 1.662-4.533 4.669v2.645H7.078v3.469h3.047v8.385a12.09 12.09 0 003.75 0v-8.385h2.796z"/></svg>`;
const oldFacebookSvgRegex = /<svg width="20" height="20" fill="#1877F2" viewBox="0 0 24 24">[\s\S]*?<\/svg>/i;

['frontend/src/app/login/page.tsx', 'frontend/src/app/register/page.tsx'].forEach(file => {
  let f = fs.readFileSync(file, 'utf8');
  
  // Replace Facebook SVG
  f = f.replace(oldFacebookSvgRegex, facebookSvg);
  
  // Add inline styles for the buttons
  f = f.replace(/className="social-button-item btn-facebook"/g, 'className="social-button-item" style={{ backgroundColor: "#f4f5f7", borderColor: "#f4f5f7" }}');
  
  // Use Inter font and proper spacing
  f = f.replace(/<div className="login-page-wrapper">/g, '<div className="login-page-wrapper" style={{ fontFamily: "Inter, Roboto, sans-serif" }}>');
  
  // Divider spacing
  f = f.replace(/<div className="form-divider"><span>or<\/span><\/div>/g, '<div className="form-divider" style={{ margin: "25px 0" }}><span>or</span></div>');
  
  // Login button color to match original
  if (file.includes('login')) {
    f = f.replace(/className="btn-submit-login"(\s*)disabled=\{loading\}(\s*)style=\{\{/g, 'className="btn-submit-login" disabled={loading} style={{ backgroundColor: "#4B6BFB",');
  } else {
    f = f.replace(/className="btn-submit-login"(\s*)disabled=\{loading\}(\s*)style=\{\{/g, 'className="btn-submit-login" disabled={loading} style={{ backgroundColor: "#4B6BFB",');
  }

  // Update register text
  if (file.includes('register')) {
    f = f.replace(/Already have an account\?[\s\S]*?Login[\s\S]*?<\/Link>/i, 'Already registered?{\' \'}\\n            <Link href="/login" style={{ color: \'#3B82F6\', fontWeight: 600, textDecoration: \'none\' }}>\\n              Log In\\n            </Link>');
  }

  fs.writeFileSync(file, f);
});
