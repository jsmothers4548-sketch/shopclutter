import { useEffect, useState } from 'react';
import useShop from '@/hooks/useShop';
import { getShopSettings } from '@/lib/shopSettings';
import { resolveVisibleBrand } from '@/lib/visibleBrand';

// The business identity to show inside the app: the shop's own name, tagline,
// logo and contact details on a paid plan, ShopClutter on the free plan.
export default function useVisibleBrand() {
  const { shop } = useShop();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    getShopSettings()
      .then(setSettings)
      .catch(() => setSettings({}));
  }, []);

  return resolveVisibleBrand(settings, shop);
}