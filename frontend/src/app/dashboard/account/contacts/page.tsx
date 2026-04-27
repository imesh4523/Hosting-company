'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ContactsPage() {
  const router = useRouter();
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) { router.replace('/login'); return; }
  }, []);
  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <iframe src="/contacts-static.html" style={{ width: '100%', height: '100%', border: 'none' }} title="Contacts" />
    </div>
  );
}
