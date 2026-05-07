'use client';
import React, { useState, useEffect } from 'react';
import { CreditCard, Trash2, Plus, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';

export default function PaymentMethodsPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/billing/cards', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch payment methods');
      const data = await res.json();
      setCards(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleDelete = async (cardId: string) => {
    if (!confirm('Are you sure you want to remove this card?')) return;
    
    const token = localStorage.getItem('token');
    try {
      // Note: Backend might need a delete-card endpoint. 
      // For now, we'll just show an alert if not implemented.
      alert('Card removal feature coming soon. Please contact support.');
    } catch (e) {
      alert('Error removing card');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center border-[20px] border-red-600">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <h1 className="text-4xl font-black text-white">REACT UI ACTIVE</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] p-8 text-white font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
              <CreditCard className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-red-500">DEBUG: REACT UI ACTIVE</h1>
              <p className="text-slate-400 font-medium text-xs uppercase tracking-widest">SECURELY STORED ON STRIPE CLOUD</p>
            </div>
          </div>
          <button 
            onClick={() => window.location.href = '/dashboard/billing/addfunds'}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)]"
          >
            <Plus className="w-5 h-5" />
            ADD NEW METHOD
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 mb-8">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {cards.length === 0 ? (
            <div className="bg-[#1e293b]/30 border border-slate-800 border-dashed rounded-3xl p-12 text-center">
              <CreditCard className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-400 mb-2">No saved cards found</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">Add your first card by making a deposit in the Add Funds section.</p>
            </div>
          ) : (
            cards.map(card => (
              <div 
                key={card.id}
                className="bg-[#1e293b]/50 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 flex items-center justify-between group hover:border-blue-500/30 transition-all"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-10 bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-center shadow-inner">
                    <span className="text-xs font-black italic text-slate-500 tracking-tighter">{card.brand?.toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-mono text-xl tracking-[0.2em] text-white">•••• •••• •••• {card.last4}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">EXPIRES {card.expMonth}/{card.expYear}</p>
                      <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">DEFAULT METHOD</p>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleDelete(card.id)}
                  className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  title="Remove card"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="mt-12 bg-blue-600/5 border border-blue-500/10 rounded-3xl p-8 flex items-start gap-6">
          <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center shrink-0">
             <ShieldCheck className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h4 className="font-bold text-white mb-2 tracking-tight">Enterprise-Grade Security</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              We utilize Stripe's cloud-based vaulting system. Your sensitive credit card numbers never touch our servers, 
              ensuring 100% compliance with PCI-DSS standards and maximum protection against data breaches.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
