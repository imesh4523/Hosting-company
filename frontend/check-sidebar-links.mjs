// Fetch the rendered fragment HTML and extract all sidebar category links
const BASE = 'http://localhost:3000';

async function getSidebarLinks() {
  const res = await fetch(`${BASE}/api/fragment?name=fullpage&page=ssl_certificates`);
  const html = await res.text();
  
  // Extract all <a> tags inside .hdcProSide
  const sidebarMatch = html.match(/hdcProSide[\s\S]*?<\/div>/);
  
  // Find all links in the sidebar section
  const linkRegex = /<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g;
  const results = [];
  let match;
  
  // Look for sidebar section
  const sidebarStart = html.indexOf('hdcProSide');
  const sidebarEnd = html.indexOf('main-content', sidebarStart);
  const sidebarHtml = sidebarStart > 0 ? html.substring(sidebarStart, sidebarEnd) : html;
  
  while ((match = linkRegex.exec(sidebarHtml)) !== null) {
    const href = match[1];
    const text = match[2].replace(/<[^>]*>/g, '').trim();
    const isCollapseToggle = match[0].includes('data-toggle="collapse"');
    const isSubItem = match[0].includes('href="/store/');
    
    if (text && text.length > 0) {
      results.push({
        text,
        href: href || '(no href)',
        type: isCollapseToggle ? 'EXPAND_TRIGGER' : isSubItem ? 'SUB_ITEM' : 'MAIN_LINK'
      });
    }
  }
  return results;
}

async function testLink(href) {
  if (!href || href === '#' || href.startsWith('javascript') || href === '(no href)') {
    return 'SKIP';
  }
  const url = href.startsWith('/') ? `${BASE}${href}` : href;
  try {
    const res = await fetch(url, { redirect: 'follow' });
    return res.status;
  } catch(e) {
    return `ERR: ${e.message.slice(0, 40)}`;
  }
}

async function main() {
  console.log('📋 Extracting sidebar links from API...\n');
  const links = await getSidebarLinks();
  
  console.log(`Found ${links.length} sidebar links. Testing each...\n`);
  console.log('TYPE          | STATUS | HREF');
  console.log('─'.repeat(70));
  
  for (const link of links) {
    const status = await testLink(link.href);
    const icon = status === 200 ? '✅' : status === 'SKIP' ? '⏭️ ' : '❌';
    const typeStr = link.type.padEnd(13);
    console.log(`${icon} ${typeStr} | ${String(status).padEnd(6)} | ${link.href.padEnd(35)} | ${link.text}`);
  }
}

main();
