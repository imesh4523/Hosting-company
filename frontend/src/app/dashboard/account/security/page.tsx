'use client';
import React, { useState, useEffect } from 'react';
import FragmentPage from '@/components/FragmentPage';
import TwoFactorSetup from '@/components/TwoFactorSetup';

export default function Page() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setUser(data);
      } catch (e) {}
    };
    fetchUser();
  }, []);

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Account Security</h1>
        <p className="text-slate-500">Manage your password and authentication settings.</p>
      </div>

      {!user?.twoFactorEnabled ? (
        <TwoFactorSetup onEnabled={() => {}} />
      ) : (
        <div className="max-w-xl mx-auto bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
          <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
             <div className="w-8 h-8 bg-emerald-500 rounded-full border-4 border-white"></div>
          </div>
          <h2 className="text-xl font-bold text-slate-800">2FA is Enabled</h2>
          <p className="text-slate-500 mb-6">Your account is protected with two-factor authentication.</p>
          <button className="text-red-500 font-semibold hover:underline">Disable 2FA</button>
        </div>
      )}

      <div className="opacity-50 pointer-events-none">
        <FragmentPage fragmentName="account_security" />
      </div>
    </div>
  );
}
