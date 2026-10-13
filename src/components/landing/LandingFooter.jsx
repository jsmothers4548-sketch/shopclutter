import React from 'react';
import { Link } from 'react-router-dom';
import BrandMark from '@/components/landing/BrandMark';

const COLUMNS = [
  {
    heading: 'Product',
    links: [
      { to: '/features', label: 'Features' },
      { to: '/pricing', label: 'Pricing' },
      { to: '/login', label: 'Sign In' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { to: '/about', label: 'About' },
      { to: '/register', label: 'Start free' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { to: '/privacy', label: 'Privacy Policy' },
      { to: '/terms', label: 'Terms of Service' },
    ],
  },
];

export default function LandingFooter({ brand }) {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 px-6 py-14">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3">
              <BrandMark logo={brand.logo_url} name={brand.name} className="h-8 w-8 rounded-lg" />
              <p className="font-semibold tracking-tight text-slate-900">{brand.name}</p>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              Shop management for small engine and equipment repair — built on a real bench,
              for a one-man shop and a full crew alike.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.heading}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                {column.heading}
              </p>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.to + link.label}>
                    <Link
                      to={link.to}
                      className="text-sm font-medium text-slate-700 transition-colors hover:text-slate-900"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} {brand.name}. All rights reserved.
          </p>
          <div className="flex gap-5">
            <Link to="/privacy" className="text-xs text-slate-400 hover:text-slate-700">
              Privacy
            </Link>
            <Link to="/terms" className="text-xs text-slate-400 hover:text-slate-700">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}