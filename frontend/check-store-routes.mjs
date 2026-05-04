// Quick test - check all store URLs for 404s
const BASE = 'http://localhost:3000';

const ALL_SLUGS = [
  // Shared Hosting
  'shared-hosting', 'linux-shared-hosting', 'windows-shared-hosting',
  // WordPress
  'wordpress-hosting',
  // VPS
  'vps-hosting', 'linux-vps-hosting', 'macos-vps-hosting', 'windows-vps-hosting',
  // VDS
  'vds-hosting', 'linux-vds-hosting', 'macos-vds-hosting', 'windows-vds-hosting',
  // Dedicated
  'dedicated-hosting', 'nested-dedicated-servers',
  // Reseller
  'reseller-hosting', 'linux-reseller-hosting', 'windows-reseller-hosting',
  'internet-radio-reseller-hosting', 'shoutcast-radio-reseller-hosting',
  // Email / Radio
  'email-hosting', 'radio-hosting',
  // Game Servers
  'game-servers', 'minecraft-game-server',
  // Security
  'ultasecurity', 'ssl-certificates', 'ssl-certificaties',
  'codeguard', 'website-backup', 'website-builder',
  'marketgoo', 'sitelock', 'website-security',
  // Other
  'other-products', 'server-support-service', 'popular-hosting',
];

async function checkUrl(slug) {
  const url = `${BASE}/store/${slug}`;
  try {
    const res = await fetch(url);
    return { slug, url, status: res.status, ok: res.status < 400 };
  } catch (e) {
    return { slug, url, status: 'ERR', ok: false, error: e.message };
  }
}

async function main() {
  console.log('🔍 Checking all /store/* routes...\n');
  const results = await Promise.all(ALL_SLUGS.map(checkUrl));

  const ok    = results.filter(r => r.ok);
  const fails = results.filter(r => !r.ok);

  console.log(`✅ OK     (${ok.length}):`);
  ok.forEach(r => console.log(`   ${r.status}  /store/${r.slug}`));

  console.log(`\n❌ FAILED (${fails.length}):`);
  if (fails.length === 0) {
    console.log('   None! All routes work 🎉');
  } else {
    fails.forEach(r => console.log(`   ${r.status}  /store/${r.slug}  ${r.error || ''}`));
  }
}

main();
