'use client';
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Loader2, CreditCard, Wallet, ShieldCheck, AlertCircle, CheckCircle2, PlusCircle } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm({ amount, onBalanceUpdate }: { amount: number, onBalanceUpdate: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/billing/payment-intent', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount }),
      });

      const { clientSecret, message } = await res.json();
      if (!res.ok) throw new Error(message || 'Failed to initialize payment');

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        }
      });

      if (result.error) {
        setError(result.error.message || 'Payment failed');
      } else if (result.paymentIntent?.status === 'succeeded') {
        setSucceeded(true);
        onBalanceUpdate();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (succeeded) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Funds Added Successfully!</h3>
        <p className="text-slate-400 mb-8 max-w-xs">Your wallet balance has been updated. You can now use these funds for your services.</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-slate-700"
        >
          Return to Billing
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Secure Card Information</label>
        <div className="p-3 border border-slate-700 rounded-lg bg-slate-950 focus-within:border-blue-500 transition-all">
          <CardElement options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#fff',
                '::placeholder': { color: '#64748b' },
                fontFamily: 'Inter, sans-serif',
              },
              invalid: { color: '#ef4444' },
            }
          }} />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-400 font-medium">{error}</p>
        </div>
      )}

      <button
        disabled={processing || !stripe}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50 group"
      >
        {processing ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            PROCESSING TRANSACTION...
          </>
        ) : (
          <>
            <ShieldCheck className="w-6 h-6 text-blue-200" />
            CONFIRM PAYMENT OF ${amount.toFixed(2)}
          </>
        )}
      </button>
      
      <p className="text-[11px] text-center text-slate-500 font-medium uppercase tracking-tighter">
        🔒 SECURE 256-BIT SSL ENCRYPTED PAYMENT
      </p>
    </form>
  );
}

export default function AddFundsPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [amount, setAmount] = useState<number>(25);
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewCard, setShowNewCard] = useState(false);

  const fetchWallet = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/user/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setBalance(data.walletBalance);

      const cardsRes = await fetch('http://localhost:5000/api/billing/cards', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const cards = await cardsRes.json();
      setSavedCards(cards);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleChargeSaved = async (cardId: string) => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/billing/charge-card', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ paymentMethodId: cardId, amount }),
      });
      if (res.ok) {
        await fetchWallet();
        alert('Payment successful!');
      } else {
        const d = await res.json();
        alert(d.message || 'Payment failed');
      }
    } catch (e) {
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && balance === null) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] p-8 text-white font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/30">
            <Wallet className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Terminal</h1>
            <p className="text-slate-400 font-medium">MANAGE CREDITS AND AUTOMATED BILLING</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <div className="bg-[#1e293b]/50 backdrop-blur-xl p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl transition-all group-hover:bg-blue-600/20"></div>
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Available Balance</p>
              <h2 className="text-5xl font-black text-white tracking-tighter">
                ${balance?.toFixed(2)}
              </h2>
              <div className="mt-6 flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                SECURE ASSETS
              </div>
            </div>

            <div className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800 space-y-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select Deposit Amount</label>
              <div className="grid grid-cols-2 gap-3">
                {[10, 25, 50, 100, 250, 500].map(val => (
                  <button
                    key={val}
                    onClick={() => setAmount(val)}
                    className={`py-3 rounded-xl font-bold transition-all border ${
                      amount === val 
                      ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]' 
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    ${val}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-center text-xl font-bold focus:outline-none focus:border-blue-500"
                placeholder="Custom Amount"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-[#1e293b]/50 backdrop-blur-xl p-8 rounded-3xl border border-slate-800 shadow-2xl h-full">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-slate-400" />
                  Payment Gateway
                </h3>
                {savedCards.length > 0 && (
                  <button 
                    onClick={() => setShowNewCard(!showNewCard)}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                  >
                    <PlusCircle className="w-4 h-4" />
                    {showNewCard ? 'CANCEL' : 'ADD NEW CARD'}
                  </button>
                )}
              </div>

              {savedCards.length > 0 && !showNewCard ? (
                <div className="space-y-4">
                  <p className="text-sm text-slate-400 mb-4 font-medium">Select a saved card for instant 1-click deposit:</p>
                  {savedCards.map(card => (
                    <button
                      key={card.id}
                      onClick={() => handleChargeSaved(card.id)}
                      className="w-full bg-slate-900/80 hover:bg-slate-800 p-5 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-8 bg-slate-800 rounded-md border border-slate-700 flex items-center justify-center">
                           <span className="text-[10px] font-black italic text-slate-500">{card.brand?.toUpperCase()}</span>
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-white tracking-widest">•••• •••• •••• {card.last4}</p>
                          <p className="text-[10px] text-slate-500 font-bold">EXPIRES {card.expMonth}/{card.expYear}</p>
                        </div>
                      </div>
                      <div className="px-4 py-2 bg-blue-600/10 text-blue-400 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-all">
                        ONE-CLICK PAY
                      </div>
                    </button>
                  ))}
                  <div className="pt-6 mt-6 border-t border-slate-800">
                     <p className="text-xs font-bold text-slate-500 mb-4">OR PAY WITH NEW CARD</p>
                    <Elements stripe={stripePromise}>
                      <CheckoutForm amount={amount} onBalanceUpdate={fetchWallet} />
                    </Elements>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <Elements stripe={stripePromise}>
                    <CheckoutForm amount={amount} onBalanceUpdate={fetchWallet} />
                  </Elements>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
