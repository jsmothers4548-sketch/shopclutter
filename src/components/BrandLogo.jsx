import React from 'react';
import emblem from '@/assets/logo-emblem.png';
import lockup from '@/assets/logo-lockup.png';
import { cn } from '@/lib/utils';

// The ShopClutter wordmark, cropped into two shapes so it stays legible at the
// sizes a header allows: the artwork with the name, and the artwork alone.
const ARTWORK = { lockup, emblem };

export default function BrandLogo({
  brand,
  variant = 'lockup',
  className,
  logoClassName = 'h-9 w-9 rounded-lg',
  nameClassName = 'font-bold',
}) {
  // A shop on a paid plan shows its own uploaded logo and name instead.
  if (brand?.whiteLabel) {
    return (
      <span className="flex min-w-0 items-center gap-2">
        {brand.logo ? (
          <img
            src={brand.logo}
            alt={brand.name}
            className={cn('shrink-0 bg-white object-contain', logoClassName)}
          />
        ) : null}
        <span className={cn('truncate', nameClassName)}>{brand.name}</span>
      </span>
    );
  }

  return (
    <img
      src={ARTWORK[variant] || ARTWORK.lockup}
      alt="ShopClutter"
      className={cn('w-auto shrink-0 object-contain', className)}
    />
  );
}