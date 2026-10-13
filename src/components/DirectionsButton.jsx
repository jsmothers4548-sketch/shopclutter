import React from 'react';
import { Navigation } from 'lucide-react';
import { directionsUrl } from '@/lib/maps';

export default function DirectionsButton({ address }) {
  if (!address?.trim()) return null;
  return (
    <a
      href={directionsUrl(address)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2.5 rounded-lg text-sm font-semibold active:bg-blue-700 transition-colors"
    >
      <Navigation className="w-4 h-4" /> Get Directions
    </a>
  );
}