'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Key, Server } from 'lucide-react';

export default function AdminDOAccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    // Fetch accounts logic here
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    // API call to add account
    alert('This would connect to your backend to save the encrypted API Key.');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-4">
          <Shield className="text-indigo-600" /> DigitalOcean Accounts
        </h1>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-8">
          <h2 className="text-xl font-bold mb-6">Add New Account</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="Account Name (e.g. DO-App-1)" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3"
              />
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="password" 
                  placeholder="DigitalOcean API Key" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-10 py-3"
                />
              </div>
            </div>
            <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all">
              Save Account
            </button>
          </form>
        </div>

        <div className="grid gap-4">
          {accounts.map((acc, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Server size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{acc.name}</h4>
                  <p className="text-xs text-slate-400">Status: {acc.status} · Apps: {acc.appsCount}/{acc.appsLimit}</p>
                </div>
              </div>
              <button className="text-red-400 hover:text-red-600 transition-colors">
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
