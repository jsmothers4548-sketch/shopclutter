import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// Whether the signed-in user is the app owner. The backend is the source of
// truth (the owner address is a secret), so we ask it rather than comparing
// anything on the client. Used to keep owner-only tools out of every other
// shop's Admin menu.
export default function useIsAppOwner() {
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    let active = true;
    base44.functions
      .invoke('betaAccess', { action: 'check' })
      .then((res) => {
        if (active) setIsOwner(!!res.data?.isOwner);
      })
      .catch(() => {
        if (active) setIsOwner(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return isOwner;
}