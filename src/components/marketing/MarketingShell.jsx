import React from 'react';
import useBrand from '@/hooks/useBrand';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';

// Shared frame for every public marketing page: top navigation and footer.
export default function MarketingShell({ children }) {
  const brand = useBrand();

  return (
    <div className="min-h-screen bg-white">
      <LandingHeader brand={brand} />
      <main>{children}</main>
      <LandingFooter brand={brand} />
    </div>
  );
}