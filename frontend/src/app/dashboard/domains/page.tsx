'use client';

import React from 'react';

export default function DomainsPage() {
  return (
    <div className="w-full h-screen overflow-hidden bg-[#fdfdfd]">
      <iframe
        src="/domains-static.html"
        className="w-full h-full border-none"
        title="My Domains"
      />
    </div>
  );
}
