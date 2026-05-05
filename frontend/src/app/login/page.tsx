'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import './login.css';

interface AuthMethods {
  email: boolean;
  google: boolean;
  facebook: boolean;
  github: boolean;
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(searchParams.get('error') ? 'Authentication failed. Please try again.' : '');
  const [rememberMe, setRememberMe] = useState(false);
  const [methods, setMethods] = useState<AuthMethods>({ email: true, google: true, facebook: true, github: true });

  useEffect(() => {
    // Force OAuth buttons to show for UI consistency with youuhost
    // fetch('/api/auth/methods')
    //   .then(res => res.json())
    //   .then(data => {
    //     if (data && typeof data.email !== 'undefined') {
    //       setMethods(data);
    //     }
    //   })
    //   .catch((err) => {
    //     console.error('Failed to fetch auth methods:', err);
    //   });
  }, []);

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
        localStorage.setItem('token', data.token);
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
        if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
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

  const handleOAuth = (provider: string) => {
    window.location.href = `/api/auth/${provider}`;
  };

  return (
    <main className="login-section">
      <div className="login-form-card">
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img src="/custom-logo.png" alt="youuhost" style={{ height: '45px', margin: '0 auto' }} />
        </div>
        <h2 className="form-title">Secure Client Login</h2>

        {error && (
          <div style={{
            background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA',
            borderRadius: '8px', padding: '10px 14px', marginBottom: '16px',
            fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* OAuth Buttons */}
        <div className="social-login-grid">
          {methods.google && (
            <button onClick={() => handleOAuth('google')} className="social-button-item">
              <svg width="20" height="20" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="#4285F4" /></svg>
              Continue with Google
            </button>
          )}
          {methods.facebook && (
            <button onClick={() => handleOAuth('facebook')} className="social-button-item btn-facebook">
              <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /><path fill="#fff" d="M16.671 15.542l.532-3.469h-3.328V9.823c0-.949.465-1.874 1.956-1.874h1.514V5.004s-1.374-.235-2.686-.235c-2.741 0-4.533 1.662-4.533 4.669v2.645H7.078v3.469h3.047v8.385a12.09 12.09 0 003.75 0v-8.385h2.796z" /></svg>
              Continue with Facebook
            </button>
          )}
          {methods.github && (
            <button onClick={() => handleOAuth('github')} className="social-button-item">
              <svg width="20" height="20" fill="black" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
              Continue with GitHub
            </button>
          )}
        </div>

        {(methods.google || methods.facebook || methods.github) && methods.email && (
          <div className="form-divider"><span>or</span></div>
        )}

        {/* Email Login Form */}
        {methods.email && (
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
              />
            </div>

            <div className="input-group">
              <Link href="/forgot-password" style={{ float: 'right', fontSize: '13px', color: '#3B82F6', textDecoration: 'none' }}>Forgot?</Link>
              <label className="input-label">Password</label>
              <input
                id="loginPassword"
                type="password"
                className="text-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="remember-check" style={{ marginBottom: '20px' }}>
              <input
                type="checkbox"
                id="rem"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="rem" style={{ fontSize: '13.5px', color: '#666', cursor: 'pointer' }}>
                Keep me signed in
              </label>
            </div>

            <button
              type="submit"
              className="btn-submit-login"
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Processing...' : 'Login to Dashboard'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '14px', color: '#666' }}>
          New to <img src="/custom-logo.png" alt="youuhost" style={{ height: '14px', verticalAlign: 'middle', display: 'inline-block' }} /> ?{' '}
          <Link href="/register" style={{ color: '#3B82F6', fontWeight: 600, textDecoration: 'none' }}>
            Create Account
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <div className="login-page-wrapper" style={{ fontFamily: "Outfit, sans-serif" }}>
      <Suspense fallback={<div>Loading...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}
