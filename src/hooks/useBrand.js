import { useEffect, useState } from 'react';
import { getBrand, DEFAULT_BRAND } from '@/lib/brand';

export default function useBrand() {
  const [brand, setBrand] = useState(DEFAULT_BRAND);

  useEffect(() => {
    let active = true;
    getBrand().then((b) => {
      if (active) setBrand(b);
    });
    return () => {
      active = false;
    };
  }, []);

  return brand;
}