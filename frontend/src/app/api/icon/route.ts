import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'https://bill.ultahost.com/templates/os-images';
const PRODUCT_URL = 'https://bill.ultahost.com/templates/lagom2/assets/img/logos/products';

const ICON_MAP: Record<string, string> = {
  // OS Icons (Directly from os-images folder)
  'ubuntu': `${BASE_URL}/UbuntuCoF1.svg`,
  'debian': `${BASE_URL}/debian-logo.svg`,
  'alma': `${BASE_URL}/AlmaLinux-logo.svg`,
  'cent': `${BASE_URL}/CentOS-logo.svg`,
  'rocky': `${BASE_URL}/Rocky_Linux_logo1.svg`,
  'kali': `${BASE_URL}/Kali-dragon-logo.svg`,
  'none': `${BASE_URL}/None.svg`,
  
  // Control Panel / App Mix (found in os-images folder)
  'hestia': `${BASE_URL}/Hestia-logo.svg`,
  'cyber': `${BASE_URL}/Cyberpanel-logo.svg`,
  'cpanel': `${BASE_URL}/cPanel-logo.svg`,
  'plesk': `${BASE_URL}/Plesk-logo.svg`,
  'ispmanager': `${BASE_URL}/ISPmanager-logo.svg`,
  'aapanel': `${BASE_URL}/aapanel-logo.svg`,
  'n8n': `${BASE_URL}/N8n--Streamline-Simple-Icons 1.svg`,
  'docker': `${BASE_URL}/docker-4 1.svg`,
  'vs-code': `${BASE_URL}/visual-studio-code-1 1.svg`,
  'pterodactyl': `${BASE_URL}/pterodactyl.svg`,
  'pufferpane': `${BASE_URL}/PufferPanel.svg`,
  'wordpress': `${BASE_URL}/wordpress-icon 2.svg`,
  'wp-extendify': `${BASE_URL}/WP-extendify.svg`,
  'laravel': `${BASE_URL}/Laravel.svg`,
  'drupal': `${BASE_URL}/drupal-icon 2.svg`,
  'opencart': `${BASE_URL}/OpenCart.svg`,
  'prestashop': `${BASE_URL}/prestashop 2.svg`,
  'nextcloud': `${BASE_URL}/nextcloud-svgrepo-com 2.svg`,
  'seafile': `${BASE_URL}/seafile-svgrepo-com 2.svg`,
  'photoprism': `${BASE_URL}/Photoprism.svg`,
  'jitsi': `${BASE_URL}/Jitsi.svg`,
  'plex': `${BASE_URL}/plex-logo 2.svg`,
  'owncast': `${BASE_URL}/Owncast.svg`,
  'openvpn': `${BASE_URL}/openvpn-logo-1 2.svg`,
  'wireguard': `${BASE_URL}/wireguard-svgrepo-com 2.svg`,
  'xray': `${BASE_URL}/Xray-Logo-Website-150x61px-24 2.svg`,
  'wowonder': `${BASE_URL}/Wowonder.svg`,
  'playtube': `${BASE_URL}/Playtube Logo.svg`,
  'portainer': `${BASE_URL}/portainer 1.svg`,
  'woocommerce': `${BASE_URL}/woocommerce 1.svg`,
  'gitlab': `${PRODUCT_URL}/gitlab.svg`,
  'grafana': `${BASE_URL}/grafana.svg`,
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name')?.toLowerCase() || 'none';
    
    // Fuzzy matching
    let iconUrl = '';
    const key = Object.keys(ICON_MAP).find(k => name.includes(k) || k.includes(name));
    iconUrl = ICON_MAP[key || 'none'];

    const response = await fetch(iconUrl);
    if (!response.ok) {
        const fallback = await fetch(ICON_MAP['none']);
        return new NextResponse(await fallback.text(), { headers: { 'Content-Type': 'image/svg+xml' } });
    }
    
    return new NextResponse(await response.text(), {
      headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' },
    });
  } catch (error) {
    return new NextResponse('<svg></svg>', { headers: { 'Content-Type': 'image/svg+xml' } });
  }
}
