const fs = require('fs');
const path = require('path');

// Mock FLAG_MAP and other things if needed, or just extract the function from route.ts
// Actually, I'll just copy the relevant part of route.ts into a test script.

function fixLinks(html) {
  // ── 15. Sidebar injection: App Deploy ────────────────────────────────────
  if (html.includes('Primary_Navbar-Dashboard') && !html.includes('Primary_Navbar-App_Deploy')) {
    html = html.replace(
      /(<li menuitemname="Dashboard"[^>]*>[\s\S]*?<\/li>)/,
      `$1<li menuitemname="App Deploy" class="" id="Primary_Navbar-App_Deploy"><a href="/dashboard/app-deploy"><i class="fab fa-test fas fa-rocket"></i><span class="item-text">App Deploy</span></a></li>`
    );
  }
  return html;
}

const navHtml = `
                <li menuitemname="Dashboard" class=" active" id="Primary_Navbar-Dashboard">
                    <a href="/clientarea.php">
                        <i class="fab fa-test fas fa-th"></i>
                        <span class="item-text">Dashboard</span>
                    </a>
                </li>
`;

console.log("BEFORE:", navHtml);
const result = fixLinks(navHtml);
console.log("AFTER:", result);

if (result.includes('Primary_Navbar-App_Deploy')) {
    console.log("SUCCESS: Injected correctly");
} else {
    console.log("FAILURE: Not injected");
}
