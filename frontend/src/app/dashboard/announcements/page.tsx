'use client';
import React, { useState, useEffect } from 'react';

export default function Page() {
  const [html, setHtml] = useState('');
  
  useEffect(() => {
    // Fetch the full page: sidebar + this page's content combined
    fetch('/api/fragment?name=fullpage&page=announcements')
      .then(r => r.text())
      .then(content => setHtml(content))
      .catch(() => setHtml('<div style="padding:40px;color:red">Failed to load content.</div>'));
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
