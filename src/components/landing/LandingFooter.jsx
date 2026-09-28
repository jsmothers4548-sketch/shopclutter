import React from 'react';
import { Link } from 'react-router-dom';
import BrandMark from '@/components/landing/BrandMark';

export default function LandingFooter({ brand }) {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 px-6 py-12">
      <div className="max-w-5xl mx-auto flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <BrandMark logo={brand.logo_url} name={brand.name} className="w-8 h-8 rounded-lg" />
          <div>
            <p className="font-semibold tracking-tight text-slate-900">{brand.name}</p>
            <p className="text-sm text-slate-500">Shop management for small engine repair</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 text-sm sm:text-right">
          <Link to="/pricing" className="font-medium text-slate-700 hover:text-slate-900">
            Start Now
          </Link>
          <Link to="/login" className="font-medium text-slate-700 hover:text-slate-900">
            Sign In
          </Link>
          <Link to="/privacy" className="text-slate-500 hover:text-slate-800">
            Privacy Policy
          </Link>
          <Link to="/terms" className="text-slate-500 hover:text-slate-800">
            Terms of Service
          </Link>
        </div>
      </div>
      <p className="max-w-5xl mx-auto mt-10 text-xs text-slate-400">
        © {new Date().getFullYear()} {brand.name}. All rights reserved.
      </p>
    </footer>
  );
}