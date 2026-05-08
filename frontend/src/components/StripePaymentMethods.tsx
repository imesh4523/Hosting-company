import React, { useEffect, useState } from 'react';
import { useStripe, useElements } from '@stripe/react-stripe-js';

const StripePaymentMethods: React.FC = () => {
    const s = useStripe();

    const loadBillingAddress = async () => {
        const container = document.getElementById('billing-address-container');
        if (!container) return;

        const jwt = localStorage.getItem('token');
        try {
            const res = await fetch('/api/account/details', {
                headers: { 'Authorization': `Bearer ${jwt}` }
            });
            const data = await res.json();
            
            if (data.success && data.data) {
                const u = data.data;
                
                // Pre-fill Name
                const nameInput = document.getElementById('pm-description') as HTMLInputElement;
                if (nameInput && (!nameInput.value || nameInput.value === '') && u.name) {
                    nameInput.value = u.name;
                }

                const addr = [u.address1, u.city, u.postcode, u.country].filter(Boolean).join(', ');
                if (!addr) {
                    container.innerHTML = '<p style="color:#888;font-size:14px;">No address on file. <a href="/dashboard/account/details" style="color:#4a6aff;">Add one</a>.</p>';
                    return;
                }

                container.innerHTML = `
                    <label style="display:flex;align-items:flex-start;gap:12px;cursor:pointer;padding:15px;border:1.5px solid #4a6aff;border-radius:12px;background:#f4f7fe;margin:0;width:100%;box-sizing:border-box;">
                        <input type="radio" name="billing_address" checked style="margin-top:4px;accent-color:#4a6aff;width:18px;height:18px;">
                        <div style="font-size:14px;color:#111;line-height:1.5;">
                            <div style="font-weight:700;margin-bottom:2px;color:#4a6aff;">${u.name || 'Account Holder'}</div>
                            <div style="color:#555;">${addr}</div>
                        </div>
                    </label>
                `;
            } else {
                container.innerHTML = '<p style="color:#888;font-size:14px;">No address on file. <a href="/dashboard/account/details" style="color:#4a6aff;">Add one</a>.</p>';
            }
        } catch (err) {
            container.innerHTML = '<p style="color:#e53e3e;font-size:14px;">Failed to load address.</p>';
        }
    };

    const initStripeElements = async (retryCount = 0) => {
        if (!s) return;

        const cardNumElem = document.getElementById('stripe-card-number');
        if (!cardNumElem) {
            if (retryCount < 20) {
                setTimeout(() => initStripeElements(retryCount + 1), 200);
            }
            return;
        }

        try {
            const res = await fetch('/api/account/create-setup-intent', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (!data.success) return;

            const clientSecret = data.clientSecret;
            (window as any).clientSecret = clientSecret;

            const appearance = { theme: 'stripe' as const };
            const els = s.elements({ appearance, clientSecret });
            const stripeStyle = {
                base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': { color: '#aab7c4' },
                    fontFamily: 'Inter, system-ui, sans-serif',
                },
                invalid: { color: '#9e2146' },
            };

            // Destroy previous elements if they exist
            if ((window as any).stripeCardNumber) (window as any).stripeCardNumber.destroy();
            if ((window as any).stripeCardExpiry) (window as any).stripeCardExpiry.destroy();
            if ((window as any).stripeCardCvc) (window as any).stripeCardCvc.destroy();

            const cardNumber = els.create('cardNumber', { style: stripeStyle });
            cardNumber.mount('#stripe-card-number');
            (window as any).stripeCardNumber = cardNumber;

            const cardExpiry = els.create('cardExpiry', { style: stripeStyle });
            cardExpiry.mount('#stripe-card-expiry');
            (window as any).stripeCardExpiry = cardExpiry;

            const cardCvc = els.create('cardCvc', { style: stripeStyle });
            cardCvc.mount('#stripe-card-cvc');
            (window as any).stripeCardCvc = cardCvc;

            (window as any).stripeElements = els;

            const form = document.getElementById('pm-add-form');
            if (form) {
                form.onsubmit = async (e) => {
                    e.preventDefault();
                    if ((window as any).handleCardSubmit) {
                        (window as any).handleCardSubmit(e);
                    }
                };
            }
        } catch (err) {
            console.error('Stripe Init Error:', err);
        }
    };

    const loadPaymentMethods = async () => {
        const container = document.getElementById('pm-list-container');
        if (!container) return;

        const jwt = localStorage.getItem('token');
        try {
            const res = await fetch('/api/account/payment-methods', {
                headers: { 'Authorization': `Bearer ${jwt}` }
            });

            if (res.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
                return;
            }

            const data = await res.json();
            const cards = (data.success && data.data) ? data.data : [];

            if (cards.length === 0) {
                container.innerHTML = `
                    <div style="background:#fff;border-radius:24px;padding:80px 40px;text-align:center;box-shadow: 0 10px 30px rgba(0,0,0,0.05);border: 1px solid rgba(0,0,0,0.03);">
                        <div style="width:100px;height:100px;background:#f0f3ff;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;">
                            <i class="fas fa-credit-card" style="font-size:40px;color:#4a6aff;"></i>
                        </div>
                        <h2 style="font-size:22px;font-weight:700;color:#1a1a1a;margin-bottom:12px;">No cards found</h2>
                        <p style="color:#666;margin-bottom:30px;max-width:300px;margin-left:auto;margin-right:auto;">Add your first credit or debit card to enjoy seamless payments.</p>
                        <button onclick="window.switchView('add')" style="background:linear-gradient(135deg, #4a6aff 0%, #3355ff 100%);color:#fff;border:none;padding:14px 32px;border-radius:30px;font-weight:600;font-size:15px;cursor:pointer;box-shadow: 0 4px 15px rgba(74,106,255,0.3);transition:transform 0.2s;">+ Add New Card</button>
                    </div>
                `;
            } else {
                let cardsHtml = '';
                const defaultGradients = [
                    'linear-gradient(135deg, #4a00e0 0%, #8e2de2 100%)',
                    'linear-gradient(135deg, #232526 0%, #414345 100%)',
                    'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
                ];
                
                cards.forEach((card: any, index: number) => {
                    const brand = (card.brand || 'card').toLowerCase();
                    const gradient = defaultGradients[index % defaultGradients.length];
                    const brandIcon = brand === 'visa' ? 'fab fa-cc-visa' : (brand === 'mastercard' ? 'fab fa-cc-mastercard' : 'fas fa-credit-card');
                    
                    cardsHtml += `
                        <div style="flex: 0 0 350px; max-width: 350px; height: 210px; border-radius: 20px; background: ${gradient}; position: relative; padding: 25px; color: #fff; box-shadow: 0 15px 35px rgba(0,0,0,0.2); overflow: hidden; margin-right: 20px; margin-bottom: 25px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                                <img src="/custom-logo.png" style="height: 35px; object-fit: contain; filter: brightness(0) invert(1);">
                                <i class="${brandIcon}" style="font-size: 32px;"></i>
                            </div>
                            <div style="font-size: 20px; letter-spacing: 2px; font-family: monospace; margin-bottom: 25px;">
                                •••• •••• •••• <span style="font-weight: 800;">${card.last4}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="font-size: 10px; text-transform: uppercase; opacity: 0.7;">Expiry</div>
                                    <div style="font-size: 16px; font-weight: 700;">${card.expMonth}/${card.expYear}</div>
                                </div>
                                <button onclick="window.deletePM('${card.id}')" style="background: rgba(255,255,255,0.25); border: none; color: #fff; padding: 8px 15px; border-radius: 10px; font-size: 12px; font-weight: 700; cursor: pointer;">Remove</button>
                            </div>
                        </div>
                    `;
                });

                container.innerHTML = `
                    <div style="margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="font-size: 24px; font-weight: 800;">Your Cards</h2>
                        <button onclick="window.switchView('add')" style="background: #4a6aff; color: #fff; border: none; padding: 10px 20px; border-radius: 20px; font-weight: 700; cursor: pointer;">+ Add Card</button>
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 5px;">${cardsHtml}</div>
                `;
            }
        } catch (err) {
            container.innerHTML = '<div style="color:red;">Error loading cards.</div>';
        }
    };

    useEffect(() => {
        const observer = new MutationObserver(() => {
            const el = document.getElementById('stripe-card-number');
            const viewAdd = document.getElementById('view-add');
            if (el && viewAdd && viewAdd.style.display !== 'none' && !(el as any)._mounted) {
                (el as any)._mounted = true;
                initStripeElements();
                loadBillingAddress();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        const setupGlobalsAndLoad = () => {
            const container = document.getElementById('pm-list-container');
            if (container) {
                (window as any).handleCardSubmit = async (e: any) => {
                    const errorElement = document.getElementById('stripe-card-errors');
                    const btn = document.getElementById('pm-save-btn');
                    const els = (window as any).stripeElements;
                    if (btn) (btn as any).disabled = true;
                    if (errorElement) { errorElement.textContent = ''; errorElement.style.display = 'none'; }

                    try {
                        const { setupIntent, error } = await s!.confirmCardSetup((window as any).clientSecret, {
                            payment_method: {
                                card: els.getElement('cardNumber'),
                                billing_details: { name: (document.getElementById('pm-description') as HTMLInputElement)?.value || 'Cardholder' }
                            }
                        });

                        if (error) {
                            if (errorElement) { errorElement.textContent = error.message || 'An error occurred'; errorElement.style.display = 'block'; }
                            if (btn) (btn as any).disabled = false;
                        } else {
                            const res = await fetch('/api/account/verify-payment-method', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                                body: JSON.stringify({ paymentMethodId: setupIntent!.payment_method })
                            });
                            const result = await res.json();
                            if (result.success) { (window as any).switchView('list'); }
                            else { 
                                if (errorElement) { errorElement.textContent = result.message || 'Already added'; errorElement.style.display = 'block'; }
                                if (btn) (btn as any).disabled = false;
                            }
                        }
                    } catch (err: any) {
                        if (errorElement) { errorElement.textContent = err.message; errorElement.style.display = 'block'; }
                        if (btn) (btn as any).disabled = false;
                    }
                };

                (window as any).switchView = (view: string) => {
                    const list = document.getElementById('view-list');
                    const add = document.getElementById('view-add');
                    if (list && add) {
                        list.style.display = view === 'list' ? 'block' : 'none';
                        add.style.display = view === 'add' ? 'block' : 'none';
                        if (view === 'list') loadPaymentMethods();
                        else { initStripeElements(); loadBillingAddress(); }
                        window.scrollTo(0, 0);
                    }
                };

                (window as any).deletePM = async (pmId: string) => {
                    if (!confirm('Are you sure?')) return;
                    try {
                        const res = await fetch(`/api/account/payment-methods/${pmId}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                        });
                        if ((await res.json()).success) loadPaymentMethods();
                    } catch (err) { alert('Error removing'); }
                };

                loadPaymentMethods();
            }
        };

        const handleGlobalClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target && (target.id === 'btn-add-address' || target.closest('#btn-add-address'))) {
                window.location.href = '/dashboard/account/details';
            }
        };
        document.addEventListener('click', handleGlobalClick);

        setTimeout(setupGlobalsAndLoad, 100);
        window.addEventListener('fragment-loaded', setupGlobalsAndLoad);

        return () => {
            observer.disconnect();
            window.removeEventListener('fragment-loaded', setupGlobalsAndLoad);
            document.removeEventListener('click', handleGlobalClick);
        };
    }, [s]);

    return null;
};

export default StripePaymentMethods;
