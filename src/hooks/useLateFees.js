import { useCallback, useEffect, useState } from 'react';
import { getShopSettings } from '@/lib/shopSettings';
import { loadOverdueUnits } from '@/lib/lateFees';

// The shop's late-pickup settings plus every unit that has earned a fee.
export default function useLateFees(enabled) {
  const [settings, setSettings] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(!!enabled);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const next = await getShopSettings();
      setSettings(next);
      setUnits(await loadOverdueUnits(next));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    reload();
  }, [enabled, reload]);

  return { settings, units, loading, reload };
}