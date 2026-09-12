import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, ScanLine } from 'lucide-react';

export default function QrScanner({ onClose, onResult }) {
  const scannerRef = useRef(null);
  const handledRef = useRef(false);
  const [cameraError, setCameraError] = useState(null);
  const [manual, setManual] = useState('');

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-scanner-region', { verbose: false });
    scannerRef.current = scanner;
    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (handledRef.current) return;
          handledRef.current = true;
          scanner.stop().catch(() => {});
          onResult(decodedText);
        },
        () => {}
      )
      .catch((err) => setCameraError(err?.message || 'Camera unavailable'));
    return () => {
      if (scannerRef.current && !handledRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const submitManual = (e) => {
    e.preventDefault();
    const value = manual.trim();
    if (!value) return;
    handledRef.current = true;
    if (scannerRef.current) scannerRef.current.stop().catch(() => {});
    onResult(value);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2 text-white">
          <ScanLine className="w-5 h-5 text-amber-400" />
          <h2 className="font-bold">Scan Unit QR Code</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-slate-300 active:bg-slate-800"
          aria-label="Close scanner"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        {cameraError ? (
          <p className="text-slate-300 text-sm text-center max-w-xs">
            Camera unavailable on this device — enter the unit number below instead.
          </p>
        ) : (
          <div className="w-full max-w-sm overflow-hidden rounded-xl bg-black">
            <div id="qr-scanner-region" className="w-full" />
          </div>
        )}
      </div>

      <form
        onSubmit={submitManual}
        className="p-4 border-t border-slate-700 space-y-2"
      >
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          Or enter the unit or ticket number
        </label>
        <div className="flex gap-2">
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="e.g. 1001 or 26-001"
            className="flex-1 rounded-lg border border-slate-600 bg-slate-800 text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="submit"
            className="bg-amber-500 text-slate-900 px-4 py-2.5 rounded-lg font-semibold text-sm active:bg-amber-600"
          >
            Look Up
          </button>
        </div>
      </form>
    </div>
  );
}