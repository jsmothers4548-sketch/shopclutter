import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Printer, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LabelSheet from '@/components/LabelSheet';
import UpgradePrompt from '@/components/UpgradePrompt';
import usePlanFeature from '@/hooks/usePlanFeature';
import { nextUnitLabel, recordPrintedLabels } from '@/lib/unitNumbers';

const SHEET_WIDTH = 720;
const SHEET_HEIGHT = 960;

export default function LabelSheetDialog({ onClose }) {
  const { locked } = usePlanFeature('qr_scan');
  const [startNumber, setStartNumber] = useState('');
  const [count, setCount] = useState(12);
  const [scale, setScale] = useState(0.5);
  const [printing, setPrinting] = useState(false);

  // Open on the next number the shop hasn't printed yet.
  useEffect(() => {
    if (locked) return;
    nextUnitLabel()
      .then(setStartNumber)
      .catch(() => setStartNumber('1001'));
  }, [locked]);

  // Preview the sheet scaled to the screen; printing resets it to full size.
  useEffect(() => {
    const compute = () => {
      const w = Math.min(window.innerWidth - 32, SHEET_WIDTH);
      setScale(Math.max(0.3, Math.min(1, w / SHEET_WIDTH)));
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  useEffect(() => {
    document.body.classList.add('printing-sheet');
    return () => document.body.classList.remove('printing-sheet');
  }, []);

  const handlePrint = async () => {
    const first = parseInt(startNumber, 10);
    if (!Number.isFinite(first)) return;
    setPrinting(true);
    try {
      await recordPrintedLabels(first + count - 1);
    } finally {
      setPrinting(false);
    }
    window.print();
  };

  return createPortal(
    <div className="print-root fixed inset-0 z-[70] flex flex-col bg-slate-900/95">
      <div className="no-print flex items-center justify-between px-4 pt-4">
        <h2 className="text-lg font-bold text-white">Print Labels</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-slate-300 active:bg-slate-800"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {locked ? (
        <div className="no-print p-4">
          <UpgradePrompt
            feature="qr_scan"
            title="Label printing is a paid feature"
          />
        </div>
      ) : (
        <>
          <div className="no-print grid grid-cols-2 gap-3 px-4 py-3">
            <div>
              <Label className="text-slate-300">Start at #</Label>
              <Input
                type="number"
                inputMode="numeric"
                value={startNumber}
                onChange={(e) => setStartNumber(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-slate-300">Labels (max 12)</Label>
              <Input
                type="number"
                inputMode="numeric"
                value={count}
                onChange={(e) =>
                  setCount(
                    Math.max(1, Math.min(12, parseInt(e.target.value, 10) || 1))
                  )
                }
              />
            </div>
          </div>
          <p className="no-print px-4 pb-3 text-xs text-slate-400">
            12 labels per sheet. The preview is scaled down — the printed sheet
            is full size on letter paper.
          </p>

          <div className="sheet-viewport flex-1 overflow-y-auto px-4 pb-4">
            <div
              className="sheet-frame mx-auto"
              style={{ width: SHEET_WIDTH * scale, height: SHEET_HEIGHT * scale }}
            >
              <div
                className="sheet-scale"
                style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
              >
                <LabelSheet
                  startNumber={startNumber || '1001'}
                  count={count}
                />
              </div>
            </div>
          </div>

          <div className="no-print p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <button
              onClick={handlePrint}
              disabled={printing || !startNumber}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 text-slate-900 py-3 rounded-lg font-semibold active:bg-amber-600 disabled:opacity-50"
            >
              <Printer className="w-4 h-4" /> Print QR Code
            </button>
          </div>
        </>
      )}
    </div>,
    document.body
  );
}