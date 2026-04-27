'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import './login.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        // Store token
        localStorage.setItem('token', data.token);
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
        if (data.user) localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        setError(data.message || 'Invalid email or password. Please try again.');
      }
    } catch (err) {
      setError('Cannot connect to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      {/* Top Black Bar */}
      <div className="top-black-bar">
        <div className="top-bar-link">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          Style
        </div>
        <div className="top-bar-link">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          View Cart
        </div>
        <div className="top-bar-link">USD</div>
      </div>

      {/* Navbar */}
      <nav className="main-navbar">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link href="/" className="logo-container">
            <div className="logo-uh">
              <span className="logo-u">U</span>
              <span className="logo-h">
                H
                <div className="logo-h-dots">
                  <div className="logo-dot"></div>
                  <div className="logo-dot"></div>
                  <div className="logo-dot"></div>
                </div>
              </span>
              <span className="logo-text-brand">Ultahost</span>
            </div>
          </Link>
          <div className="nav-menu">
            <Link href="#">Products</Link>
            <Link href="#">Domains</Link>
            <Link href="#">Website &amp; Security</Link>
            <Link href="#">Support</Link>
          </div>
        </div>
        <div className="nav-auth-btns">
          <Link href="/register" className="btn-reg">Register</Link>
          <Link href="/login" className="btn-log-nav">Login</Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="login-section">
        <div className="login-form-card">
          <h2 className="form-title">Secure Client Login</h2>

          {/* Error Message */}
          {error && (
            <div style={{
              background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA',
              borderRadius: '8px', padding: '10px 14px', marginBottom: '16px',
              fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input
                id="loginEmail"
                type="email"
                className="text-input"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="input-group">
              <Link href="/forgot-password" className="forgot-pwd">Forgot?</Link>
              <label className="input-label">Password</label>
              <input
                id="loginPassword"
                type="password"
                className="text-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <div className="remember-check">
              <input
                type="checkbox"
                id="rem"
                style={{ cursor: 'pointer' }}
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="rem" style={{ fontSize: '14px', color: '#666', cursor: 'pointer' }}>
                Remember Me
              </label>
            </div>

            <button
              type="submit"
              className="btn-submit-login"
              disabled={loading}
              style={{
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              {loading ? (
                <>
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" 
                       style={{ animation: 'spin 1s linear infinite' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  Signing in...
                </>
              ) : 'Login'}
            </button>
          </form>

          <div className="form-divider"><span>or</span></div>

          <div className="social-login-grid">
            <button className="social-button-item">
              <svg width="20" height="20" fill="#1877F2" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
              Facebook
            </button>
            <button className="social-button-item">
              <svg width="20" height="20" fill="black" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
              GitHub
            </button>
            <button className="social-button-item">
              <svg width="20" height="20" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="#4285F4"/></svg>
              Google
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13.5px', color: '#888' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{ color: '#5145FF', fontWeight: 600, textDecoration: 'none' }}>
              Create Account
            </Link>
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="help-fab">
        <div className="help-pill">Talk to us</div>
        <div className="help-circle">
          <svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
