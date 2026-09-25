import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import useBrand from '@/hooks/useBrand';
import BrandMark from '@/components/landing/BrandMark';

export default function LegalPageLayout({ title, updated, intro, sections }) {
  const brand = useBrand();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center gap-3">
          <BrandMark logo={brand.logo_url} name={brand.name} className="w-9 h-9 rounded-xl" />
          <span className="font-bold tracking-tight text-slate-900">{brand.name}</span>
          <Link
            to="/"
            className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-2 text-sm text-slate-500">Last updated {updated}</p>
        {intro && <p className="mt-6 text-slate-600 leading-relaxed">{intro}</p>}

        <div className="mt-10 space-y-9">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-lg font-semibold text-slate-900">{s.heading}</h2>
              {s.body.map((p, i) => (
                <p key={i} className="mt-3 text-slate-600 leading-relaxed">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-slate-200">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}