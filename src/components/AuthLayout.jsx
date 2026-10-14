import React from "react";
import { Link } from "react-router-dom";
import useBrand from "@/hooks/useBrand";
import BrandLogo from "@/components/BrandLogo";

export default function AuthLayout({ title, subtitle, footer, children }) {
  const brand = useBrand();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <BrandLogo brand={brand} className="mx-auto mb-5 h-14 sm:h-16" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
        </div>
        <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
          {children}
        </div>
        {footer && (
          <p className="text-center text-sm text-muted-foreground mt-6">{footer}</p>
        )}
        <p className="text-center text-xs text-muted-foreground mt-4">
          <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
          <span className="mx-2">·</span>
          <Link to="/terms" className="hover:underline">Terms of Service</Link>
        </p>
      </div>
    </div>
  );
}