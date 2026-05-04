'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import FragmentPage from '@/components/FragmentPage';

export default function StoreDynamicPage() {
  const params = useParams();
  const slugArray = params.slug as string[];
  const slug = slugArray ? slugArray[0] : '';

  // Map slugs to fragment names
  const fragmentMapping: Record<string, string> = {
    'ultasecurity': 'ssl_certificates',
    'ssl-certificaties': 'ssl_certificates',
    'codeguard': 'website_backup',
    'marketgoo': 'seo_tools',
    'sitelock': 'website_security',
    'website-security': 'website_security',
    'shared-hosting': 'ssl_certificates', 
    'wordpress-hosting': 'ssl_certificates',
    'linux-vps-hosting': 'ssl_certificates',
    'vps-hosting': 'ssl_certificates',
  };

  const fragmentName = slugArray && slugArray.length > 1 
    ? 'cart_configure' 
    : (fragmentMapping[slug] || 'ssl_certificates');

  return <FragmentPage fragmentName={fragmentName} />;
}
