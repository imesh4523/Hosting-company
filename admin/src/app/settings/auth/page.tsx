'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

interface AuthSettings {
  googleEnabled: boolean;
  googleClientId: string | null;
  googleSecret: string | null;
  facebookEnabled: boolean;
  facebookAppId: string | null;
  facebookSecret: string | null;
  githubEnabled: boolean;
  githubClientId: string | null;
  githubSecret: string | null;
  emailEnabled: boolean;
}

export default function AuthSettingsPage() {
  const [settings, setSettings] = useState<AuthSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ provider: string; ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/auth/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/auth/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert('Settings saved successfully!');
      }
    } catch (error) {
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async (provider: string) => {
    if (!settings) return;
    let clientId, secret;
    if (provider === 'google') { clientId = settings.googleClientId; secret = settings.googleSecret; }
    else if (provider === 'facebook') { clientId = settings.facebookAppId; secret = settings.facebookSecret; }
    else if (provider === 'github') { clientId = settings.githubClientId; secret = settings.githubSecret; }

    try {
      const res = await fetch('/api/admin/auth/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, clientId, secret })
      });
      const data = await res.json();
      setTestResult({ provider, ok: data.ok, msg: data.message });
      setTimeout(() => setTestResult(null), 5000);
    } catch (error) {
      setTestResult({ provider, ok: false, msg: 'Connection test failed' });
    }
  };

  if (loading) return <div style={{ padding: '40px', fontFamily: 'Outfit, sans-serif' }}>Loading settings...</div>;
  if (!settings) return <div style={{ padding: '40px', fontFamily: 'Outfit, sans-serif' }}>Error loading settings</div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FA', fontFamily: 'Outfit, sans-serif' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '30px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: 0 }}>🔐 Authentication Methods</h1>
            <p style={{ color: '#6B7280', fontSize: '14px', marginTop: '4px' }}>Control how users can log in to the platform</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            style={{ 
              background: '#5145FF', color: 'white', padding: '10px 25px', borderRadius: '10px', 
              border: 'none', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1,
              boxShadow: '0 4px 12px rgba(81,69,255,0.25)'
            }}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        <div style={{ display: 'grid', gap: '24px' }}>
          {/* Email & Password */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5145FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Email & Password</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#6B7280' }}>Traditional login method (Always recommended)</p>
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={settings.emailEnabled}
                onChange={e => setSettings({...settings, emailEnabled: e.target.checked})}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Google OAuth */}
          <ProviderSection 
            title="Google OAuth 2.0"
            icon={<svg width="24" height="24" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="#4285F4"/></svg>}
            enabled={settings.googleEnabled}
            clientId={settings.googleClientId || ''}
            secret={settings.googleSecret || ''}
            onToggle={v => setSettings({...settings, googleEnabled: v})}
            onIdChange={v => setSettings({...settings, googleClientId: v})}
            onSecretChange={v => setSettings({...settings, googleSecret: v})}
            onTest={() => testConnection('google')}
            guide={`🌐 GOOGLE SETUP GUIDE:\n1. Go to Google Cloud Console (console.cloud.google.com)\n2. Create a New Project and select it.\n3. Navigate to "APIs & Services" > "OAuth consent screen". Configure it as "External".\n4. Go to "Credentials" > "Create Credentials" > "OAuth client ID".\n5. Select "Web application" as the type.\n6. Under "Authorized redirect URIs", add:\n   👉 ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/google/callback\n7. Copy the Client ID and Secret and paste them above.`}
            testStatus={testResult?.provider === 'google' ? testResult : null}
          />

          {/* Facebook Login */}
          <ProviderSection 
            title="Facebook Login"
            icon={<svg width="24" height="24" viewBox="0 0 24 24"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/><path fill="#fff" d="M16.671 15.542l.532-3.469h-3.328V9.823c0-.949.465-1.874 1.956-1.874h1.514V5.004s-1.374-.235-2.686-.235c-2.741 0-4.533 1.662-4.533 4.669v2.645H7.078v3.469h3.047v8.385a12.09 12.09 0 003.75 0v-8.385h2.796z"/></svg>}
            enabled={settings.facebookEnabled}
            clientId={settings.facebookAppId || ''}
            secret={settings.facebookSecret || ''}
            onToggle={v => setSettings({...settings, facebookEnabled: v})}
            onIdChange={v => setSettings({...settings, facebookAppId: v})}
            onSecretChange={v => setSettings({...settings, facebookSecret: v})}
            onTest={() => testConnection('facebook')}
            guide={`🌐 FACEBOOK SETUP GUIDE:\n1. Go to Meta for Developers (developers.facebook.com).\n2. "My Apps" > "Create App" > "Allow people to log in with their Facebook account".\n3. In the App Dashboard, go to "Use cases" > "Authentication and account creation" > "Edit".\n4. Under "Facebook Login" settings, find "Valid OAuth Redirect URIs" and add:\n   👉 ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/facebook/callback\n5. Go to "App Settings" > "Basic" to find your App ID and App Secret.`}
            testStatus={testResult?.provider === 'facebook' ? testResult : null}
          />

          {/* GitHub OAuth */}
          <ProviderSection 
            title="GitHub OAuth"
            icon={<svg width="24" height="24" fill="black" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>}
            enabled={settings.githubEnabled}
            clientId={settings.githubClientId || ''}
            secret={settings.githubSecret || ''}
            onToggle={v => setSettings({...settings, githubEnabled: v})}
            onIdChange={v => setSettings({...settings, githubClientId: v})}
            onSecretChange={v => setSettings({...settings, githubSecret: v})}
            onTest={() => testConnection('github')}
            guide={`🌐 GITHUB SETUP GUIDE:\n1. Go to your GitHub Settings > "Developer settings" > "OAuth Apps".\n2. Click "New OAuth App".\n3. Set "Homepage URL" to your frontend URL.\n4. Set "Authorization callback URL" to:\n   👉 ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/github/callback\n5. Click "Register application", then "Generate a new client secret".`}
            testStatus={testResult?.provider === 'github' ? testResult : null}
          />
        </div>
      </main>
    </div>
  );
}

function ProviderSection({ title, icon, enabled, clientId, secret, onToggle, onIdChange, onSecretChange, onTest, guide, testStatus }: any) {
  return (
    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: enabled ? '20px' : '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
          </div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>{title}</h3>
        </div>
        <input 
          type="checkbox" 
          checked={enabled}
          onChange={e => onToggle(e.target.checked)}
          style={{ width: '20px', height: '20px', cursor: 'pointer' }}
        />
      </div>

      {enabled && (
        <div style={{ marginTop: '20px', borderTop: '1px solid #F3F4F6', paddingTop: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Client ID / App ID:</label>
              <input 
                type="text" 
                value={clientId}
                onChange={e => onIdChange(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Client Secret / App Secret:</label>
              <input 
                type="password" 
                value={secret}
                onChange={e => onSecretChange(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ background: '#F9FAFB', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 700, color: '#374151' }}>Setup Guide:</h4>
            <pre style={{ margin: 0, fontSize: '12px', color: '#6B7280', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{guide}</pre>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button 
              onClick={onTest}
              style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', background: 'white', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
            >
              🔌 Test Connection
            </button>
            {testStatus && (
              <span style={{ fontSize: '13px', fontWeight: 600, color: testStatus.ok ? '#10B981' : '#EF4444' }}>
                {testStatus.ok ? '✅ ' : '❌ '}{testStatus.msg}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
