import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

// One printable page of unit labels: 12 per sheet (3 across, 4 down), each a
// QR code carrying only the unit number, with cut guides between them. The
// page is sized to the printable area of letter paper (7.5in x 10in) so the
// browser's half-inch page margin lands the grid exactly on the sheet.
const COLS = 3;
const ROWS = 4;

export default function LabelSheet({ startNumber, count }) {
  const [codes, setCodes] = useState([]);
  const numbers = Array.from({ length: count }, (_, i) =>
    String(Number(startNumber) + i)
  );

  useEffect(() => {
    let alive = true;
    Promise.all(
      numbers.map((n) =>
        QRCode.toString(n, {
          type: 'svg',
          margin: 4,
          errorCorrectionLevel: 'M',
        }).catch(() => '')
      )
    ).then((svgs) => {
      if (alive) setCodes(svgs);
    });
    return () => {
      alive = false;
    };
  }, [startNumber, count]);

  return (
    <div
      className="sheet-page grid bg-white shadow-xl"
      style={{
        width: 720,
        height: 960,
        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        gridTemplateRows: `repeat(${ROWS}, 1fr)`,
      }}
    >
      {numbers.map((n, i) => (
        <div
          key={n}
          className="flex flex-col items-center justify-center border border-dashed border-slate-300"
        >
          <div
            className="w-[150px] h-[150px] [&>svg]:w-full [&>svg]:h-full"
            dangerouslySetInnerHTML={{ __html: codes[i] || '' }}
          />
          <p className="mt-1 text-3xl font-black tracking-tight text-black">
            #{n}
          </p>
        </div>
      ))}
    </div>
  );
}