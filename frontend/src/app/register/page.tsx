'use client';

import React, { useEffect, useState } from 'react';

export default function RegisterPage() {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/fragment?name=register')
      .then(res => res.text())
      .then(data => {
        setHtml(data);
      })
      .catch(err => console.error('Failed to load register fragment:', err));
  }, []);

  useEffect(() => {
    if (!html) return;

    // Attach register handler
    const setupRegister = () => {
      const regForm = document.getElementById('frmCheckout') as HTMLFormElement;
      if (regForm) {
        regForm.addEventListener('submit', async function(e) {
          e.preventDefault();
          
          const formData = new FormData(regForm);
          const data = Object.fromEntries(formData.entries());
          
          // Map to our API expected fields
          const signupData = {
              email: data.email,
              password: data.password,
              name: `${data.firstname || ''} ${data.lastname || ''}`.trim(),
              phone: data.phonenumber,
              address1: data.address1,
              address2: data.address2,
              city: data.city,
              state: data.state,
              postcode: data.postcode,
              country: data.country,
              company: data.companyname
          };

          const btn = regForm.querySelector('button[type="submit"]') as HTMLButtonElement;
          const loader = btn?.querySelector('.loader');
          const btnText = btn?.querySelector('.btn-text') as HTMLElement;
          
          if (btn) btn.disabled = true;
          if (loader) loader.classList.remove('hidden');
          if (btnText) btnText.style.opacity = '0.5';

          try {
              const res = await fetch('/api/auth/register', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(signupData)
              });
              const result = await res.json();
              if (res.ok) {
                  alert('Registration successful! Please login.');
                  window.location.href = '/login';
              } else {
                  alert(result.message || 'Registration failed');
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
    const timer = setTimeout(setupRegister, 300);
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
            max-width: 900px !important;
          }
          body { background: #f4f7fa !important; }
        </style>
      ` }} 
    />
  );
}
