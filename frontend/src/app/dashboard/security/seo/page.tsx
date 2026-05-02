'use client';
import React, { useState, useEffect } from 'react';

export default function Page() {
  const [html, setHtml] = useState('<div style="padding:40px;text-align:center">Loading...</div>');
  
  useEffect(() => {
    fetch('/api/fragment?name=fullpage&page=seo_tools')
      .then(r => r.text())
      .then(content => setHtml(content))
      .catch(() => setHtml('<div style="padding:40px;color:red">Failed to load content.</div>'));
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
