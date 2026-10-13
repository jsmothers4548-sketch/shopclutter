import React from 'react';
import MarketingShell from '@/components/marketing/MarketingShell';
import LandingHero from '@/components/landing/LandingHero';
import ShopFit from '@/components/landing/ShopFit';
import FeatureShowcase from '@/components/landing/FeatureShowcase';
import FounderStory from '@/components/landing/FounderStory';
import CtaBand from '@/components/landing/CtaBand';
import useBrand from '@/hooks/useBrand';

export default function Landing() {
  const brand = useBrand();

  return (
    <MarketingShell>
      <LandingHero brand={brand} />
      <ShopFit />
      <FeatureShowcase />
      <FounderStory brand={brand} />
      <CtaBand
        title="Get the shop out of the notebook."
        body="Start free, take in your first job today, and only pay once the work outgrows the free plan."
      />
    </MarketingShell>
  );
}