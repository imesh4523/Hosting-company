'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [html, setHtml] = useState('');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) { router.replace('/login'); return; }

    fetch('/api/fragment?name=fullpage&page=main')
      .then(r => r.text())
      .then(content => setHtml(content))
      .catch(() => setHtml('<div style="padding:40px;color:red">Failed to load dashboard.</div>'));
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
