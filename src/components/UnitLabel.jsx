import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'qrcode';
import { Printer, X } from 'lucide-react';
import UpgradePrompt from '@/components/UpgradePrompt';
import usePlanFeature from '@/hooks/usePlanFeature';

// The printable unit label: a QR code with the unit number beneath it.
// The code carries the unit number only — nothing public, nothing cross-shop.
export default function UnitLabel({ labelNumber, closeLabel = 'Close', onClose }) {
  const { locked } = usePlanFeature('qr_scan');
  const [svg, setSvg] = useState('');

  useEffect(() => {
    if (locked) return;
    QRCode.toString(String(labelNumber), {
      type: 'svg',
      margin: 1,
      errorCorrectionLevel: 'M',
    })
      .then(setSvg)
      .catch(() => setSvg(''));
  }, [labelNumber, locked]);

  // Scopes the print stylesheet to this label so other printable pages keep working.
  useEffect(() => {
    document.body.classList.add('printing-label');
    return () => document.body.classList.remove('printing-label');
  }, []);

  return createPortal(
    <div className="print-root pointer-events-auto fixed inset-0 z-[60] bg-slate-900/95 flex flex-col items-center justify-center p-4 overflow-y-auto">
      <button
        onClick={onClose}
        className="no-print absolute top-4 right-4 p-2 rounded-lg text-slate-300 active:bg-slate-800"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      {locked ? (
        <div className="w-full max-w-sm">
          <UpgradePrompt
            feature="qr_scan"
            title="Label printing is a paid feature"
          />
          <button
            onClick={onClose}
            className="mt-4 w-full text-sm font-semibold text-slate-400 active:text-white"
          >
            {closeLabel}
          </button>
        </div>
      ) : (
        <>
          <div className="print-area bg-white rounded-xl p-6 flex flex-col items-center">
            <div
              className="w-56 h-56 [&>svg]:w-full [&>svg]:h-full"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
            <p className="mt-3 text-4xl font-black tracking-tight text-black">
              #{labelNumber}
            </p>
          </div>

          <div className="no-print mt-6 w-full max-w-sm space-y-2">
            <button
              onClick={() => window.print()}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 text-slate-900 py-3 rounded-lg font-semibold active:bg-amber-600"
            >
              <Printer className="w-4 h-4" /> Print QR Code
            </button>
            <button
              onClick={onClose}
              className="w-full text-sm font-semibold text-slate-400 active:text-white py-2"
            >
              {closeLabel}
            </button>
          </div>
        </>
      )}
    </div>,
    document.body
  );
}