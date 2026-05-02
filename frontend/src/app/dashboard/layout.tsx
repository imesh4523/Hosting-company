'use client';
import React from 'react';

// Minimal layout - just CSS/JS injection, no nav (each page handles its own layout from fragment)
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="stylesheet" href="/ultahost-assets/templates/lagom2/core/styles/modern/assets/css/vars/minified.css" />
      <link rel="stylesheet" href="/ultahost-assets/templates/lagom2/assets/css/theme.css" />
      <link rel="stylesheet" href="/ultahost-assets/templates/lagom2/assets/css/custom.css" />
      <link rel="stylesheet" href="/ultahost-assets/assets/css/fontawesome-all.min.css" />
      <link rel="stylesheet" href="/ultahost-assets/modules/addons/supportpin/assets/css/bootstrap-pincode-input.css" />
      {children}
      <script src="https://code.jquery.com/jquery-3.6.0.min.js" />
      <script src="/ultahost-assets/templates/lagom2/assets/js/vendor.js" />
      <script src="/ultahost-assets/templates/lagom2/assets/js/lagom-app.js" />
      <script src="/ultahost-assets/templates/lagom2/assets/js/scripts.min.js" />
    </>
  );
}
