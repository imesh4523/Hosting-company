'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_live_51TSotXGXMorGW5X8sHJWDCeTleA27pQrdgi21q6WIxZV5QHrXVSRjV4HSGnmTol3skCzg5LAD21yetRjGKo3ABO500lkucLtEI');

export default function StripeAddFunds() {
    const [stripe, setStripe] = useState<any>(null);
    const [elements, setElements] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [isStripeSelected, setIsStripeSelected] = useState(false);
    const [savedCards, setSavedCards] = useState<any[]>([]);
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        // Fetch real balance
        fetch('/api/user/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data && data.balance !== undefined) {
                    const el = document.getElementById('user-credit-balance');
                    if (el) el.textContent = `$${data.balance.toFixed(2)}USD`;
                }
            })
            .catch(err => console.error('Balance fetch error:', err));

        // Fetch saved cards (using the account payment methods endpoint for consistency)
        fetch('/api/account/payment-methods', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data && data.data.length > 0) {
                    setSavedCards(data.data);
                    setSelectedCardId(data.data[0].id);
                }
            })
            .catch(err => console.error('Saved cards fetch error:', err));

        const checkSelect = () => {
            const select = document.getElementById('paymentmethod') as HTMLSelectElement;
            if (select) {
                setIsStripeSelected(select.value === 'stripe');
            }
        };

        const interval = setInterval(() => {
            const select = document.getElementById('paymentmethod') as HTMLSelectElement;
            if (select) {
                select.addEventListener('change', (e: any) => {
                    setIsStripeSelected(e.target.value === 'stripe');
                });
                checkSelect();
                clearInterval(interval);
            }
        }, 500);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const container = document.getElementById('stripe-payment-container');
        if (container) {
            container.style.display = isStripeSelected ? 'block' : 'none';
        }

        if (isStripeSelected && !stripe) {
            initStripe();
        }
    }, [isStripeSelected]);

    const initStripe = async () => {
        const s = await stripePromise;
        setStripe(s);
    };

    const handleFormSubmit = useCallback(async (e: Event) => {
        if (loading) return;
        console.log('Form submit triggered');
        
        const select = document.getElementById('paymentmethod') as HTMLSelectElement;
        if (select?.value !== 'stripe') {
            console.log('Stripe not selected, skipping');
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        const amountInput = document.getElementById('amount') as HTMLInputElement;
        const amount = parseFloat(amountInput.value);
        console.log('Amount:', amount);

        if (isNaN(amount) || amount < 1) {
            alert('Please enter a valid amount');
            return;
        }

        setLoading(true);
        const errorDiv = document.getElementById('stripe-error');
        if (errorDiv) errorDiv.textContent = '';

        // Manually show loader and disable button
        const submitBtn = document.querySelector('button[value="Add Funds"]') as HTMLButtonElement;
        const loader = document.querySelector('.loader-button');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';
            submitBtn.style.cursor = 'not-allowed';
        }
        if (loader) loader.classList.remove('hidden');

        try {
            console.log('Creating payment intent...');
            const token = localStorage.getItem('token');
            const response = await fetch('/api/payments/create-add-funds-intent', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    amount,
                    paymentMethodId: selectedCardId || undefined
                })
            });

            const data = await response.json();
            console.log('Intent response:', data);
            
            if (!data.success) throw new Error(data.message || 'Failed to create payment intent');

            const { clientSecret, requiresAction } = data;

            let result;
            if (selectedCardId) {
                console.log('Confirming with saved card...');
                if (requiresAction) {
                    result = await stripe.confirmCardPayment(clientSecret);
                } else {
                    alert('Funds added successfully!');
                    window.location.reload();
                    return;
                }
            } else {
                console.log('Confirming with new card...');
                result = await stripe.confirmCardPayment(clientSecret, {
                    payment_method: {
                        card: elements.getElement('card'),
                        billing_details: { name: 'Customer' },
                    }
                });
            }

            console.log('Payment result:', result);

            if (result.error) {
                if (errorDiv) errorDiv.textContent = result.error.message;
            } else if (result.paymentIntent.status === 'succeeded') {
                alert('Funds added successfully!');
                window.location.reload();
            }
        } catch (err: any) {
            console.error('Stripe Error:', err);
            if (errorDiv) errorDiv.textContent = err.message;
        } finally {
            setLoading(false);
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
                submitBtn.style.cursor = 'pointer';
            }
            if (loader) loader.classList.add('hidden');
        }
    }, [stripe, elements, selectedCardId, loading]);

    const [fragmentLoaded, setFragmentLoaded] = useState(false);

    useEffect(() => {
        const handler = () => {
            console.log('Fragment loaded event received');
            setFragmentLoaded(prev => !prev);
        };
        window.addEventListener('fragment-loaded', handler);
        
        if (document.getElementById('add-funds-form')) {
            setFragmentLoaded(true);
        }

        return () => window.removeEventListener('fragment-loaded', handler);
    }, []);

    // Effect for amount preset buttons
    useEffect(() => {
        const btnGroup = document.getElementById('add-credits-buttons');
        const amountInput = document.getElementById('amount') as HTMLInputElement;

        if (btnGroup && amountInput) {
            const btns = btnGroup.querySelectorAll('button');
            const handleBtnClick = (e: MouseEvent) => {
                const target = e.currentTarget as HTMLButtonElement;
                const price = target.getAttribute('data-price');
                if (price) {
                    amountInput.value = price;
                    // Also update active state classes
                    btns.forEach(b => b.classList.remove('active'));
                    target.classList.add('active');
                }
            };

            btns.forEach(btn => btn.addEventListener('click', handleBtnClick));
            return () => btns.forEach(btn => btn.removeEventListener('click', handleBtnClick));
        }
    }, [fragmentLoaded]);

    useEffect(() => {
        console.log('Stripe/Elements Effect:', { stripe: !!stripe, elements: !!elements });
        if (stripe && !elements) {
            const el = stripe.elements();
            const card = el.create('card', {
                style: {
                    base: { 
                        fontSize: '16px', 
                        color: '#1a1a2e',
                        fontFamily: 'Inter, system-ui, sans-serif',
                        '::placeholder': { color: '#aab7c4' },
                    },
                    invalid: { color: '#e53e3e' }
                },
            });
            card.mount('#stripe-element');
            setElements(el);
        }
    }, [stripe, elements]);

    useEffect(() => {
        const form = document.getElementById('add-funds-form');
        if (form) {
            console.log('Binding submit listener to form');
            form.addEventListener('submit', handleFormSubmit);
            return () => form.removeEventListener('submit', handleFormSubmit);
        } else {
            console.log('Form not found for binding');
        }
    }, [handleFormSubmit, fragmentLoaded]);


    // Handle visibility of new card section
    useEffect(() => {
        const newCardSec = document.getElementById('stripe-new-card-section');
        if (newCardSec) {
            newCardSec.style.display = selectedCardId === null ? 'block' : 'none';
        }
    }, [selectedCardId]);

    const SavedCardsUI = (
        <div style={{ marginBottom: '25px' }}>
            <h5 style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a2e', marginBottom: '15px' }}>Use a Saved Card:</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {savedCards.map(card => {
                    const brand = (card.brand || '').toLowerCase();
                    const brandIcon = brand === 'visa' ? 'fab fa-cc-visa' : 
                                     brand === 'mastercard' ? 'fab fa-cc-mastercard' : 
                                     brand === 'amex' ? 'fab fa-cc-amex' : 
                                     'fas fa-credit-card';
                    const iconColor = brand === 'visa' ? '#1a1f71' : 
                                     brand === 'mastercard' ? '#eb001b' : 
                                     brand === 'amex' ? '#007bc1' : 
                                     '#4a6aff';

                    return (
                        <div 
                            key={card.id} 
                            onClick={() => setSelectedCardId(card.id)}
                            style={{ 
                                display: 'flex', alignItems: 'center', padding: '10px 16px', 
                                border: '2px solid', borderRadius: '12px', cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                borderColor: selectedCardId === card.id ? '#4a6aff' : '#eee',
                                background: selectedCardId === card.id ? '#f4f7fe' : '#fff',
                                boxShadow: selectedCardId === card.id ? '0 4px 10px rgba(74, 106, 255, 0.08)' : 'none'
                            }}
                        >
                            <div style={{ 
                                width: '18px', height: '18px', borderRadius: '50%', border: '2px solid',
                                marginRight: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                borderColor: selectedCardId === card.id ? '#4a6aff' : '#ddd',
                                background: '#fff', flexShrink: 0
                            }}>
                                {selectedCardId === card.id && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4a6aff' }} />}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                <i className={brandIcon} style={{ fontSize: '24px', color: iconColor }}></i>
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a2e', textTransform: 'capitalize' }}>
                                        {brand} •••• {card.last4}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#888', marginTop: '1px' }}>Exp {card.expMonth}/{card.expYear}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div 
                    onClick={() => setSelectedCardId(null)}
                    style={{ 
                        display: 'flex', alignItems: 'center', padding: '10px 16px', 
                        border: '2px solid', borderRadius: '12px', cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        borderColor: selectedCardId === null ? '#4a6aff' : '#eee',
                        background: selectedCardId === null ? '#f4f7fe' : '#fff',
                        boxShadow: selectedCardId === null ? '0 4px 10px rgba(74, 106, 255, 0.08)' : 'none'
                    }}
                >
                    <div style={{ 
                        width: '18px', height: '18px', borderRadius: '50%', border: '2px solid',
                        marginRight: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderColor: selectedCardId === null ? '#4a6aff' : '#ddd',
                        background: '#fff', flexShrink: 0
                    }}>
                        {selectedCardId === null && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4a6aff' }} />}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <i className="fas fa-plus-circle" style={{ fontSize: '20px', color: '#4a6aff' }}></i>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a2e' }}>Add a New Card</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const savedCardsContainer = typeof document !== 'undefined' ? document.getElementById('stripe-saved-cards-container') : null;

    return (
        <>
            {savedCards.length > 0 && savedCardsContainer && createPortal(SavedCardsUI, savedCardsContainer)}
        </>
    );
}
