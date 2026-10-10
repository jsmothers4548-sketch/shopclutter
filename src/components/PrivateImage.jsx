import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// Photos of a customer's property and job site are kept in private storage, so
// each one is resolved to a short-lived signed URL when it is shown. Entries
// saved before this change already hold a public URL, which is used as-is.
export default function PrivateImage({ fileUri, className, alt = '' }) {
  const isPublic =
    typeof fileUri === 'string' && fileUri.startsWith('http');
  const [src, setSrc] = useState(isPublic ? fileUri : null);

  useEffect(() => {
    let active = true;
    if (!fileUri || fileUri.startsWith('http')) {
      setSrc(fileUri || null);
      return;
    }
    setSrc(null);
    base44.integrations.Core.CreateFileSignedUrl({ file_uri: fileUri })
      .then((res) => {
        if (active) setSrc(res?.signed_url || null);
      })
      .catch(() => {
        if (active) setSrc(null);
      });
    return () => {
      active = false;
    };
  }, [fileUri]);

  if (!src) {
    return <div className={`${className} bg-slate-100 animate-pulse`} />;
  }
  return <img src={src} className={className} alt={alt} />;
}