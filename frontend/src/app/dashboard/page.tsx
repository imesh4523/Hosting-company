'use client';

import React, { useEffect, useRef } from 'react';

export default function DashboardPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text');
      if (text && text.includes('<html')) {
        console.log('Detected HTML paste, saving...');
        await fetch('/api/save-html', { method: 'POST', body: text });
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  return (
    <div className="w-full h-screen overflow-hidden bg-[#fdfdfd]">
      <iframe
        ref={iframeRef}
        src="/dashboard-static.html"
        className="w-full h-full border-none"
        title="Customer Dashboard"
      />
    </div>
  );
}
