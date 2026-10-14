import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BrandLogo from '@/components/BrandLogo';

const NAV_LINKS = [
  { to: '/features', label: 'Features' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'About' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms', label: 'Terms' },
];

export default function LandingHeader({ brand }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const isActive = (to) => pathname === to || pathname.startsWith(`${to}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-5">
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className="flex shrink-0 items-center gap-2.5"
        >
          <BrandLogo brand={brand} className="h-10 sm:h-11" />
        </Link>

        <nav className="ml-8 hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? 'bg-amber-50 text-primary'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/login"
            className="hidden text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900 sm:inline"
          >
            Sign In
          </Link>
          <Button asChild size="sm" className="hidden h-9 sm:inline-flex">
            <Link to="/pricing">Start Now</Link>
          </Button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="-mr-1 rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-5 pb-5 pt-3 lg:hidden">
          <nav className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-3 text-sm font-semibold ${
                  isActive(link.to)
                    ? 'bg-amber-50 text-primary'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex gap-2">
            <Button asChild variant="outline" className="h-11 flex-1">
              <Link to="/login" onClick={() => setOpen(false)}>
                Sign In
              </Link>
            </Button>
            <Button asChild className="h-11 flex-1">
              <Link to="/pricing" onClick={() => setOpen(false)}>
                Start Now
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}