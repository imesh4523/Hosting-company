'use client';
import React, { useState, useEffect } from 'react';
import { Shield, Smartphone, Key, AlertCircle, CheckCircle2, Copy, Download } from 'lucide-react';

interface TwoFactorSetupProps {
  onEnabled?: (backupCodes: string[]) => void;
}

export default function TwoFactorSetup({ onEnabled }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'initial' | 'setup' | 'verifying' | 'success'>('initial');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const startSetup = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setQrCode(data.qrCode);
        setSecret(data.secret);
        setStep('setup');
      } else {
        setError(data.message || 'Failed to start 2FA setup');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const verifySetup = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ token: code })
      });
      const data = await res.json();
      if (data.success) {
        setBackupCodes(data.backupCodes);
        setStep('success');
        if (onEnabled) onEnabled(data.backupCodes);
      } else {
        setError(data.message || 'Invalid code');
      }
    } catch (err) {
      setError('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Two-Factor Authentication</h2>
            <p className="text-blue-100 text-sm">Add an extra layer of security to your account</p>
          </div>
        </div>
      </div>

      <div className="p-8">
        {step === 'initial' && (
          <div className="text-center py-4">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Smartphone className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Enhance Your Security</h3>
            <p className="text-slate-600 mb-8 max-w-sm mx-auto">
              Protect your account by requiring a verification code from your mobile device during login.
            </p>
            <button
              onClick={startSetup}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              {loading ? 'Initializing...' : 'Enable 2FA Now'}
            </button>
          </div>
        )}

        {step === 'setup' && (
          <div>
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="bg-slate-50 p-4 rounded-2xl border-2 border-dashed border-slate-200">
                {qrCode ? (
                  <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-slate-400">Loading QR...</div>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-800 mb-2">1. Scan QR Code</h4>
                <p className="text-slate-600 text-sm mb-4">
                  Open your authenticator app (like Google Authenticator or Authy) and scan this QR code.
                </p>
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <p className="text-amber-800 text-xs">
                    If you can't scan, use this secret key: <code className="bg-white px-1 font-bold">{secret}</code>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100">
              <h4 className="font-bold text-slate-800 mb-2">2. Enter Verification Code</h4>
              <p className="text-slate-600 text-sm mb-4">Enter the 6-digit code from your app to verify the setup.</p>
              <div className="flex gap-4">
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-2xl tracking-[0.5em] font-mono text-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  onClick={verifySetup}
                  disabled={loading || code.length !== 6}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 rounded-xl transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
                >
                  {loading ? '...' : 'Verify'}
                </button>
              </div>
              {error && <p className="text-red-500 text-sm mt-3 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {error}</p>}
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-4">
            <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">2FA Enabled Successfully!</h3>
            <p className="text-slate-600 mb-8">
              Your account is now much more secure. Please save your recovery codes in a safe place.
            </p>
            
            <div className="bg-slate-900 rounded-2xl p-6 text-left mb-8 relative group">
              <div className="grid grid-cols-2 gap-4">
                {backupCodes.map((code, idx) => (
                  <div key={idx} className="text-emerald-400 font-mono text-lg">{code}</div>
                ))}
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <button className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-white transition-colors" title="Copy All">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="text-blue-600 font-semibold hover:underline"
            >
              Back to Security Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
