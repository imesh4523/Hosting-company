const fs = require('fs');
const path = require('path');
const https = require('https');

const STORE_URL = 'https://bill.youuhost.com/store/';
const TARGET_DIR = path.join(__dirname, '..', 'backend', 'fragments');

if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// These are the main categories found in page.tsx that map to 'services'
const CATEGORY_SLUGS = [
  'vps-hosting', 'linux-vps-hosting', 'macos-vps-hosting', 'windows-vps-hosting',
  'vds-hosting', 'linux-vds-hosting', 'macos-vds-hosting', 'windows-vds-hosting',
  'dedicated-hosting', 'dedicated-servers', 'nested-dedicated-servers', 'mac-dedicated-servers', 'gaming-dedicated-servers',
  'shared-hosting', 'linux-shared-hosting', 'windows-shared-hosting', 'wordpress-hosting',
  'reseller-hosting', 'linux-reseller-hosting', 'windows-reseller-hosting', 'internet-radio-reseller-hosting', 'shoutcast-radio-reseller-hosting',
  'email-hosting', 'radio-hosting',
  'game-servers', 'minecraft-game-server', '7-days-to-die-game-server', 'rust-game-server', 'counter-strike-go-game-server', 'valheim-game-server',
  'mac-mini-hosting', 'mac-studio-hosting', 'mac-pro-hosting', 'dmca-ignored-vps', 'dmca-ignored-dedicated',
  'youuhostsecurity', 'ssl-certificates', 'codeguard', 'website-backup', 'marketgoo', 'sitelock', 'website-security', 'website-builder'
];

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function fetchWithCookies(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const cookies = res.headers['set-cookie'];

      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          redirectUrl = 'https://bill.youuhost.com' + redirectUrl;
        }

        const req = https.get(redirectUrl, {
          headers: {
            'Cookie': cookies ? cookies.map(c => c.split(';')[0]).join('; ') : ''
          }
        }, (res2) => {
          let data = '';
          res2.on('data', chunk => data += chunk);
          res2.on('end', () => resolve(data));
        });
        req.on('error', reject);
      } else {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }
    }).on('error', reject);
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

function extractAppMain(html) {
  const appMainStart = html.indexOf('<div class="app-main');
  if (appMainStart === -1) return null;
  const innerStart = html.indexOf('>', appMainStart) + 1;
  let extracted = html.substring(innerStart);
  const appMainEnd = extracted.indexOf('</div><!-- /.app-main -->');
  if (appMainEnd !== -1) {
    return extracted.substring(0, appMainEnd);
  }
  return extracted;
}

async function scrapeAll() {
  console.log(`Starting extraction of ${CATEGORY_SLUGS.length} categories...`);

  let allOrderLinks = [];

  // 1. Scrape Store Pages in batches of 5
  const BATCH_SIZE = 5;
  for (let i = 0; i < CATEGORY_SLUGS.length; i += BATCH_SIZE) {
    const batch = CATEGORY_SLUGS.slice(i, i + BATCH_SIZE);
    console.log(`Processing category batch ${i / BATCH_SIZE + 1} / ${Math.ceil(CATEGORY_SLUGS.length / BATCH_SIZE)}`);

    await Promise.all(batch.map(async (slug) => {
      try {
        const html = await fetchHtml(STORE_URL + slug);
        const extracted = extractAppMain(html);
        if (extracted) {
          fs.writeFileSync(path.join(TARGET_DIR, `store-${slug}.html`), extracted);

          // Extract order links e.g., /store/vps-hosting/vps-basic
          const linkRegex = new RegExp(`href="/store/${slug}/([^"]+)"`, 'g');
          let match;
          while ((match = linkRegex.exec(extracted)) !== null) {
            allOrderLinks.push({ slug, subSlug: match[1] });
          }
        } else {
          console.log(`Warning: Could not extract app-main for ${slug}`);
        }
      } catch (e) {
        console.error(`Error scraping store page ${slug}:`, e.message);
      }
    }));

    await sleep(2000); // 2 second delay between batches
  }

  // Deduplicate links
  const uniqueLinks = [];
  const seen = new Set();
  for (const link of allOrderLinks) {
    if (!seen.has(link.subSlug)) {
      seen.add(link.subSlug);
      uniqueLinks.push(link);
    }
  }

  console.log(`\nExtracted ${uniqueLinks.length} unique products. Starting Cart Configuration scraping...`);

  // 2. Scrape Cart Configuration Pages in batches of 5
  for (let i = 0; i < uniqueLinks.length; i += BATCH_SIZE) {
    const batch = uniqueLinks.slice(i, i + BATCH_SIZE);
    console.log(`Processing cart batch ${i / BATCH_SIZE + 1} / ${Math.ceil(uniqueLinks.length / BATCH_SIZE)}`);

    await Promise.all(batch.map(async ({ slug, subSlug }) => {
      try {
        const html = await fetchWithCookies(STORE_URL + slug + '/' + subSlug);
        let extracted = extractAppMain(html);
        if (extracted) {
          // Rewrite the submit button to point to our local checkout
          extracted = extracted.replace(
            /<button type="submit" id="btnCompleteProductConfig"[^>]*>[\s\S]*?<\/button>/gi,
            `<a href="/store/checkout?product=${encodeURIComponent(subSlug)}" class="btn btn-primary btn-lg" id="btnCompleteProductConfig">
               <i class="fas fa-arrow-circle-right"></i> Continue
             </a>`
          );

          fs.writeFileSync(path.join(TARGET_DIR, `cart-configure-${subSlug}.html`), extracted);
        } else {
          console.log(`Warning: Could not extract cart configuration for ${subSlug}`);
        }
      } catch (e) {
        console.error(`Error scraping cart configure ${subSlug}:`, e.message);
      }
    }));

    await sleep(2000);
  }

  console.log('\nScraping complete! All files saved to backend/fragments.');
}

scrapeAll().catch(console.error);
