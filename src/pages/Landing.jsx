import React from 'react';
import useBrand from '@/hooks/useBrand';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingHero from '@/components/landing/LandingHero';
import FounderStory from '@/components/landing/FounderStory';
import FeatureGrid from '@/components/landing/FeatureGrid';
import LandingFooter from '@/components/landing/LandingFooter';

export default function Landing() {
  const brand = useBrand();

  return (
    <div className="min-h-screen bg-white">
      <LandingHeader brand={brand} />
      <LandingHero brand={brand} />
      <FounderStory brand={brand} />
      <FeatureGrid />
      <LandingFooter brand={brand} />
    </div>
  );
}