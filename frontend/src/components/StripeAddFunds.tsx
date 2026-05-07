'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51P...placeholder');

export default function StripeAddFunds() {
    const [stripe, setStripe] = useState<any>(null);
    const [elements, setElements] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [isStripeSelected, setIsStripeSelected] = useState(false);
    const [savedCards, setSavedCards] = useState<any[]>([]);
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

    useEffect(() => {
        // Fetch real balance
        fetch('/api/user/profile')
            .then(res => res.json())
            .then(data => {
                if (data && data.balance !== undefined) {
                    const el = document.getElementById('user-credit-balance');
                    if (el) el.textContent = `$${data.balance.toFixed(2)}USD`;
                }
            })
            .catch(err => console.error('Balance fetch error:', err));

        // Fetch saved cards
        fetch('/api/payments/saved-cards')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.cards.length > 0) {
                    setSavedCards(data.cards);
                    setSelectedCardId(data.cards[0].id);
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

    const handleFormSubmit = async (e: Event) => {
        const select = document.getElementById('paymentmethod') as HTMLSelectElement;
        if (select?.value !== 'stripe') return;

        e.preventDefault();
        e.stopPropagation();

        const amountInput = document.getElementById('amount') as HTMLInputElement;
        const amount = parseFloat(amountInput.value);

        if (isNaN(amount) || amount < 1) {
            alert('Please enter a valid amount');
            return;
        }

        setLoading(true);
        const errorDiv = document.getElementById('stripe-error');
        if (errorDiv) errorDiv.textContent = '';

        try {
            // 1. Create Intent on backend
            const response = await fetch('/api/payments/create-add-funds-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    amount,
                    paymentMethodId: selectedCardId || undefined
                })
            });

            const { clientSecret, success, message, requiresAction } = await response.json();
            if (!success) throw new Error(message || 'Failed to create payment intent');

            let result;
            if (selectedCardId) {
                // Confirm with saved card
                if (requiresAction) {
                    result = await stripe.confirmCardPayment(clientSecret);
                } else {
                    // Success already (confirmed on backend)
                    alert('Funds added successfully!');
                    window.location.reload();
                    return;
                }
            } else {
                // Confirm with new card
                result = await stripe.confirmCardPayment(clientSecret, {
                    payment_method: {
                        card: elements.getElement('card'),
                        billing_details: { name: 'Customer' },
                    }
                });
            }

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
        }
    };

    useEffect(() => {
        if (stripe && !elements) {
            const el = stripe.elements();
            const card = el.create('card', {
                style: {
                    base: { fontSize: '16px', color: '#32325d' },
                },
            });
            card.mount('#stripe-element');
            setElements(el);

            const form = document.getElementById('add-funds-form');
            if (form) {
                form.addEventListener('submit', handleFormSubmit);
            }
        }
    }, [stripe]);

    // Handle visibility of new card section
    useEffect(() => {
        const newCardSec = document.getElementById('stripe-new-card-section');
        if (newCardSec) {
            newCardSec.style.display = selectedCardId === null ? 'block' : 'none';
        }
    }, [selectedCardId]);

    const SavedCardsUI = (
        <div style={{ marginBottom: '20px' }}>
            <h5 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>Select Payment Method:</h5>
            {savedCards.map(card => (
                <div 
                    key={card.id} 
                    onClick={() => setSelectedCardId(card.id)}
                    style={{ 
                        display: 'flex', alignItems: 'center', marginBottom: '8px', padding: '12px', 
                        border: '1px solid', borderRadius: '6px', cursor: 'pointer',
                        borderColor: selectedCardId === card.id ? '#5145ff' : '#eee',
                        background: selectedCardId === card.id ? '#f0f4ff' : '#fff'
                    }}
                >
                    <input type="radio" checked={selectedCardId === card.id} readOnly style={{ marginRight: '12px' }} />
                    <span style={{ fontSize: '13px' }}>
                        <strong>{card.brand.toUpperCase()}</strong> ending in {card.last4} (Exp: {card.expMonth}/{card.expYear})
                    </span>
                </div>
            ))}
            <div 
                onClick={() => setSelectedCardId(null)}
                style={{ 
                    display: 'flex', alignItems: 'center', padding: '12px', 
                    border: '1px solid', borderRadius: '6px', cursor: 'pointer',
                    borderColor: selectedCardId === null ? '#5145ff' : '#eee',
                    background: selectedCardId === null ? '#f0f4ff' : '#fff'
                }}
            >
                <input type="radio" checked={selectedCardId === null} readOnly style={{ marginRight: '12px' }} />
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Use a new credit or debit card</span>
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
