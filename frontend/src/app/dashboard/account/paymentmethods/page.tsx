'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentMethodsPage() {
  const router = useRouter();
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) { router.replace('/login'); return; }
  }, []);
  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <iframe src="/payment-methods-static.html" style={{ width: '100%', height: '100%', border: 'none' }} title="Payment Methods" />
    </div>
  );
}
