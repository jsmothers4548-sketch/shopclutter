import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function CtaBand({ title, body, primaryLabel = 'Start free', to = '/register' }) {
  return (
    <section className="bg-primary px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/90 sm:text-lg">
          {body}
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" variant="secondary" className="h-12 w-full sm:w-auto">
            <Link to={to}>{primaryLabel}</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="ghost"
            className="h-12 w-full text-primary-foreground hover:bg-black/10 hover:text-primary-foreground sm:w-auto"
          >
            <Link to="/pricing">Compare plans</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}