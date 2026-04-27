'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AccountDetailsPage() {
  const router = useRouter();
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) { router.replace('/login'); return; }
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <iframe
        src="/account-details-static.html"
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Account Details"
      />
    </div>
  );
}
