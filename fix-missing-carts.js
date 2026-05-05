const fs = require('fs');
const path = require('path');
const https = require('https');

const FRAGMENTS_DIR = path.join(__dirname, 'backend', 'fragments');

// Find all store html files and extract subSlugs that don't have a cart-configure file
const storeFiles = fs.readdirSync(FRAGMENTS_DIR).filter(f => f.startsWith('store-') && f.endsWith('.html'));

const allLinks = new Set();
const missing = [];

for (const file of storeFiles) {
  const slug = file.replace('store-', '').replace('.html', '');
  const html = fs.readFileSync(path.join(FRAGMENTS_DIR, file), 'utf8');
  // Only match clean slugs: /store/[category]/[product-slug] (no spaces, no HTML chars)
  const regex = /href="\/store\/[a-z0-9-]+\/([a-z0-9][a-z0-9-]{1,60})"/g;
  let m;
  while ((m = regex.exec(html)) !== null) {
    const subSlug = m[1];
    if (!allLinks.has(subSlug)) {
      allLinks.add(subSlug);
      const cartFile = path.join(FRAGMENTS_DIR, `cart-configure-${subSlug}.html`);
      if (!fs.existsSync(cartFile)) {
        missing.push({ slug, subSlug });
      }
    }
  }
}

console.log(`Found ${missing.length} missing cart configure files:`);
missing.forEach(m => console.log(`  ${m.slug} / ${m.subSlug}`));

// Now download the missing ones
const sleep = ms => new Promise(r => setTimeout(r, ms));

function fetchWithCookies(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      const cookies = res.headers['set-cookie'];
      const cookieStr = cookies ? cookies.map(c => c.split(';')[0]).join('; ') : '';

      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) redirectUrl = 'https://bill.youuhost.com' + redirectUrl;

        https.get(redirectUrl, { headers: { 'Cookie': cookieStr, 'User-Agent': 'Mozilla/5.0' } }, (res2) => {
          let data = '';
          res2.on('data', c => data += c);
          res2.on('end', () => resolve(data));
        }).on('error', () => resolve(''));
      } else {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => resolve(data));
      }
    });
    req.on('error', () => resolve(''));
    req.setTimeout(15000, () => { req.abort(); resolve(''); });
  });
}

function extractAppMain(html) {
  const start = html.indexOf('<div class="app-main');
  if (start === -1) return null;
  const innerStart = html.indexOf('>', start) + 1;
  let extracted = html.substring(innerStart);
  const end = extracted.indexOf('</div><!-- /.app-main -->');
  if (end !== -1) return extracted.substring(0, end);
  const footer = extracted.indexOf('<div class="footer');
  if (footer !== -1) return extracted.substring(0, footer);
  return extracted.substring(0, 100000); // cap at 100KB
}

// Inject a static Order Summary sidebar
function injectOrderSummary(html, subSlug, productName, basePrice) {
  const sidebarStart = html.indexOf('<div class="main-sidebar main-sidebar-lg">');
  const mobStart = html.indexOf('<div class="order-summary order-summary-mob');
  if (sidebarStart === -1 || mobStart === -1) return html;

  const before = html.substring(0, sidebarStart);
  const after = html.substring(mobStart);
  const total = (parseFloat(basePrice) + 0.62).toFixed(2);

  const summaryHtml = `<div class="main-sidebar main-sidebar-lg">
<div class="sidebar-sticky sidebar-sticky-summary" id="orderSummary">
  <div class="panel panel-summary panel-summary-default order-summary m-b-0x" style="border-radius:14px; border:1px solid #eaeaea; overflow:hidden; background:#fff; box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div class="panel-heading" style="padding:20px 24px 12px; border-bottom:1px solid #f0f0f0;">
      <h2 class="panel-title" style="font-size:20px; font-weight:700; color:#1a1a2e; margin:0;">Order Summary</h2>
    </div>
    <div id="producttotal" style="padding:20px 24px;">
      <div style="margin-bottom:16px; padding-bottom:16px; border-bottom:1px solid #f5f5f5;">
        <div style="font-weight:600; font-size:15px; color:#222; margin-bottom:4px;" id="os-product-name">${productName}</div>
        <div style="font-size:13px; color:#888;">Monthly Billing</div>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:14px; color:#555; margin-bottom:10px;">
        <span>Setup Fee</span><span style="color:#22c55e; font-weight:600;">FREE</span>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:14px; color:#555; margin-bottom:10px;">
        <span>Monthly Price</span><span id="os-monthly-price">$${basePrice} USD</span>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:14px; color:#555; margin-bottom:16px; padding-bottom:16px; border-bottom:1px solid #f0f0f0;">
        <span>Gateway Charge</span><span>$0.62 USD</span>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:24px;">
        <span style="font-size:13px; color:#888;">Total Due Today</span>
        <span id="os-total" style="font-size:26px; font-weight:800; color:#1a1a2e;">$${total} <span style="font-size:14px;">USD</span></span>
      </div>
      <a href="/store/checkout?product=${encodeURIComponent(productName)}&price=${basePrice}"
         class="btn btn-primary btn-block btn-lg" id="btnCompleteProductConfig"
         style="background:linear-gradient(135deg,#555bff,#7c3aed); border:none; border-radius:10px; padding:14px; font-weight:700; font-size:16px; display:flex; justify-content:center; align-items:center; text-decoration:none; color:white; gap:8px; box-shadow:0 4px 15px rgba(85,91,255,0.35);">
        <i class="ls ls-share"></i> Continue
      </a>
    </div>
  </div>
</div>
</div>`;

  return before + summaryHtml + '\n' + after;
}

async function downloadMissing() {
  const BATCH = 5;
  for (let i = 0; i < missing.length; i += BATCH) {
    const batch = missing.slice(i, i + BATCH);
    console.log(`Batch ${Math.floor(i / BATCH) + 1}/${Math.ceil(missing.length / BATCH)}: ${batch.map(b => b.subSlug).join(', ')}`);

    await Promise.all(batch.map(async ({ slug, subSlug }) => {
      try {
        const html = await fetchWithCookies(`https://bill.youuhost.com/store/${slug}/${subSlug}`);
        if (!html) { console.log(`  EMPTY: ${subSlug}`); return; }

        let extracted = extractAppMain(html);
        if (!extracted) { console.log(`  NO APP-MAIN: ${subSlug}`); return; }

        // Try to get product name and price
        let productName = subSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const h1 = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
        if (h1) productName = h1[1].trim();

        let basePrice = '0.00';
        const priceMatch = html.match(/\$(\d+\.\d{2})\s*USD/i);
        if (priceMatch) basePrice = parseFloat(priceMatch[1]).toFixed(2);

        // Inject order summary
        extracted = injectOrderSummary(extracted, subSlug, productName, basePrice);

        // Rewrite continue button
        extracted = extracted.replace(
          /<button type="submit" id="btnCompleteProductConfig"[^>]*>[\s\S]*?<\/button>/gi,
          `<a href="/store/checkout?product=${encodeURIComponent(productName)}&price=${basePrice}" class="btn btn-primary btn-lg" id="btnCompleteProductConfig" style="background:linear-gradient(135deg,#555bff,#7c3aed); border:none; border-radius:10px; padding:14px; font-weight:700; display:flex; justify-content:center; align-items:center; text-decoration:none; color:white; gap:8px;"><i class="ls ls-share"></i> Continue</a>`
        );

        fs.writeFileSync(path.join(FRAGMENTS_DIR, `cart-configure-${subSlug}.html`), extracted);
        console.log(`  ✓ ${subSlug} ($${basePrice})`);
      } catch (e) {
        console.log(`  ERROR: ${subSlug} - ${e.message}`);
      }
    }));

    await sleep(2500);
  }
  console.log('\nDone!');
}

downloadMissing().catch(console.error);
