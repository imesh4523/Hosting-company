'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CallbackLogic() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');

    if (token) {
      localStorage.setItem('token', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      
      // Fetch user info with the token
      fetch('/api/user/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        router.push('/dashboard');
      })
      .catch(() => {
        router.push('/dashboard');
      });
    } else {
      router.push('/login?error=auth_failed');
    }
  }, [router, searchParams]);

  return null;
}

export default function AuthCallbackPage() {
  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px', fontFamily: 'Outfit, sans-serif' }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #5145FF', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <p style={{ color: '#666', fontWeight: 500 }}>Completing secure login...</p>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      <Suspense fallback={null}>
        <CallbackLogic />
      </Suspense>
    </div>
  );
}
