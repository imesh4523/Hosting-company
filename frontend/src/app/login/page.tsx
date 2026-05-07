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

  useEffect(() => {
    if (!html) return;

    // Attach login handler
    const setupLogin = () => {
      const loginForm = document.querySelector('.login-form');
      if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
          e.preventDefault();
          const emailInput = document.getElementById('inputEmail') as HTMLInputElement;
          const passwordInput = document.getElementById('inputPassword') as HTMLInputElement;
          
          const email = emailInput?.value;
          const password = passwordInput?.value;
          
          const btn = document.getElementById('login') as HTMLButtonElement;
          const loader = btn?.querySelector('.loader');
          const btnText = btn?.querySelector('.btn-text') as HTMLElement;
          
          if (btn) btn.disabled = true;
          if (loader) loader.classList.remove('hidden');
          if (btnText) btnText.style.opacity = '0.5';

          try {
            const res = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (data.token) {
              localStorage.setItem('token', data.token);
              localStorage.setItem('user', JSON.stringify(data.user));
              window.location.href = '/dashboard';
            } else {
              alert(data.message || 'Login failed');
            }
          } catch (err) {
            alert('Connection error');
          } finally {
            if (btn) btn.disabled = false;
            if (loader) loader.classList.add('hidden');
            if (btnText) btnText.style.opacity = '1';
          }
        });
      }
    };

    // Use a small timeout to ensure DOM is ready after injection
    const timer = setTimeout(setupLogin, 300);
    return () => clearTimeout(timer);
  }, [html]);

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
