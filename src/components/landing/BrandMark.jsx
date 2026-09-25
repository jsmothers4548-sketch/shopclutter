import React from 'react';
import { Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BrandMark({
  logo,
  name = 'Logo',
  className = 'w-9 h-9 rounded-xl',
  iconClassName = 'w-5 h-5',
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-primary overflow-hidden shrink-0',
        className
      )}
    >
      {logo ? (
        <img src={logo} alt={name} className="w-full h-full object-contain" />
      ) : (
        <Wrench className={cn('text-primary-foreground', iconClassName)} aria-hidden="true" />
      )}
    </div>
  );
}