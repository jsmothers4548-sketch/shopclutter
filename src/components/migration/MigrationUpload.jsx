import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Download, ArrowLeft, FileSpreadsheet, AlertCircle } from 'lucide-react';

export default function MigrationUpload({ category, onFile, onBack, onTemplate, error }) {
  const inputRef = useRef(null);

  return (
    <div className="space-y-3">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm font-medium text-slate-500"
      >
        <ArrowLeft className="w-4 h-4" /> All import types
      </button>

      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
        <div>
          <h2 className="font-bold text-slate-900">{category.label}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{category.description}</p>
        </div>

        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-2">
          <p className="text-xs text-slate-600">
            New to this? Download the template, fill it in, then bring it back
            here.
          </p>
          <Button variant="outline" size="sm" className="w-full" onClick={onTemplate}>
            <Download className="w-4 h-4 mr-1.5" /> Download the template
          </Button>
        </div>

        <div className="rounded-lg border-2 border-dashed border-slate-300 p-6 text-center space-y-2">
          <FileSpreadsheet className="w-8 h-8 mx-auto text-slate-400" />
          <p className="text-sm text-slate-600">
            Already have a spreadsheet? Choose your CSV file.
          </p>
          <Button onClick={() => inputRef.current?.click()} className="w-full">
            <Upload className="w-4 h-4 mr-1.5" /> Choose a CSV file
          </Button>
          <p className="text-xs text-slate-400">
            Your file is read on this device and is never uploaded.
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (file) onFile(file);
            }}
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}