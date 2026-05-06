'use client';

import React, { useEffect, useState } from 'react';

export default function LoginPage() {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/fragment?name=login')
      .then(res => res.text())
      .then(data => {
        setHtml(data);
      })
      .catch(err => console.error('Failed to load login fragment:', err));
  }, []);

  if (!html) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8f9fa' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="auth-fragment-container"
      style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        width: '100vw',
        background: '#f4f7fa',
        overflowX: 'hidden'
      }}
      dangerouslySetInnerHTML={{ __html: html + `
        <style>
          .app-nav, .main-header, .footer-bottom, .main-footer { display: none !important; }
          .login { 
            margin: 0 auto !important; 
            padding: 40px 0 !important;
            display: flex !important;
            justify-content: center !important;
            width: 100% !important;
          }
          .login-wrapper { 
            margin: 0 auto !important;
            float: none !important;
          }
          body { background: #f4f7fa !important; }
        </style>
      ` }} 
    />
  );
}
