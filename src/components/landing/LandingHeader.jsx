import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import BrandMark from '@/components/landing/BrandMark';

export default function LandingHeader({ brand }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-3">
        <BrandMark logo={brand.logo_url} name={brand.name} className="w-9 h-9 rounded-xl" />
        <span className="font-bold tracking-tight text-slate-900">{brand.name}</span>
        <div className="ml-auto flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Sign In
          </Link>
          <Button asChild size="sm" className="h-9">
            <Link to="/pricing">Start Now</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}