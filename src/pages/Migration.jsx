import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { downloadCsv, parseCsv, readFileText } from '@/lib/csv';
import { autoMap, getCategory, templateCsv, validateRows } from '@/lib/migration';
import MigrationSteps from '@/components/migration/MigrationSteps';
import MigrationIntro from '@/components/migration/MigrationIntro';
import MigrationUpload from '@/components/migration/MigrationUpload';
import ColumnMapper from '@/components/migration/ColumnMapper';
import ImportPreview from '@/components/migration/ImportPreview';
import DuplicateReview from '@/components/migration/DuplicateReview';
import ImportResults from '@/components/migration/ImportResults';
import { ShieldAlert } from 'lucide-react';

const CHUNK = 200;

export default function Migration() {
  const { user } = useAuth();
  const [step, setStep] = useState('choose');
  const [categoryKey, setCategoryKey] = useState(null);
  const [source, setSource] = useState(null);
  const [mapping, setMapping] = useState({});
  const [preview, setPreview] = useState([]);
  const [matches, setMatches] = useState({});
  const [decisions, setDecisions] = useState({});
  const [progress, setProgress] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const category = categoryKey ? getCategory(categoryKey) : null;

  if (user && user.role !== 'admin') {
    return (
      <div className="p-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6 text-center space-y-2">
          <ShieldAlert className="w-8 h-8 mx-auto text-slate-400" />
          <h2 className="font-bold text-slate-900">Administrators only</h2>
          <p className="text-sm text-slate-500">
            Bringing in existing data is limited to shop administrators.
          </p>
        </div>
      </div>
    );
  }

  const restart = () => {
    setStep('choose');
    setCategoryKey(null);
    setSource(null);
    setMapping({});
    setPreview([]);
    setMatches({});
    setDecisions({});
    setProgress(null);
    setResults(null);
    setError('');
  };

  const chooseCategory = (key) => {
    setCategoryKey(key);
    setError('');
    setStep('upload');
  };

  const handleFile = async (file) => {
    setError('');
    try {
      const text = await readFileText(file);
      const { headers, rows } = parseCsv(text);
      if (!headers.length || !rows.length) {
        setError(
          'We could not find any rows in that file. Make sure the first line holds your column names.'
        );
        return;
      }
      setSource({ name: file.name, headers, rows });
      setMapping(autoMap(headers, category.fields));
      setStep('map');
    } catch (e) {
      setError(e?.message || 'That file could not be read.');
    }
  };

  const handlePreview = () => {
    setPreview(validateRows(category, source.rows, mapping));
    setStep('preview');
  };

  const handleReview = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await base44.functions.invoke('bulkImport', {
        action: 'match',
        category: category.key,
        rows: preview.map((r) => r.data),
      });
      const found = {};
      (res.data?.matches || []).forEach((m) => {
        if (m) found[m.row] = m;
      });
      const next = {};
      preview.forEach((r) => {
        next[r.index] = found[r.index] ? 'skip' : 'create';
      });
      setMatches(found);
      setDecisions(next);
      setStep('review');
    } catch (e) {
      setError(
        e?.response?.data?.error || e?.message || 'We could not check for matches.'
      );
    } finally {
      setBusy(false);
    }
  };

  const handleImport = async () => {
    setStep('import');
    setError('');
    const totals = { imported: 0, updated: 0, skipped: 0, failed: 0, errors: [] };
    const rows = preview
      .filter((r) => !r.issues.length)
      .map((r) => ({
        index: r.index,
        data: r.data,
        decision: decisions[r.index] || 'create',
        update_id: matches[r.index]?.id,
      }));
    const leftOut = preview.length - rows.length;

    try {
      for (let i = 0; i < rows.length; i += CHUNK) {
        setProgress({ done: i, total: rows.length });
        const res = await base44.functions.invoke('bulkImport', {
          action: 'commit',
          category: category.key,
          rows: rows.slice(i, i + CHUNK),
        });
        const data = res.data || {};
        totals.imported += data.imported || 0;
        totals.updated += data.updated || 0;
        totals.skipped += data.skipped || 0;
        totals.failed += data.failed || 0;
        if (Array.isArray(data.errors)) totals.errors.push(...data.errors);
      }
      setProgress({ done: rows.length, total: rows.length });
      totals.skipped += leftOut;
      setResults(totals);
      setStep('done');
    } catch (e) {
      setResults({
        ...totals,
        skipped: totals.skipped + leftOut,
        error:
          e?.response?.data?.error ||
          e?.message ||
          'The import stopped before it finished.',
      });
      setStep('done');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Bring in your data</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Move customers, jobs, inventory and sales over from a spreadsheet.
        </p>
      </div>

      <MigrationSteps step={step} />

      {step === 'choose' && <MigrationIntro onChoose={chooseCategory} />}

      {step === 'upload' && category && (
        <MigrationUpload
          category={category}
          error={error}
          onBack={restart}
          onFile={handleFile}
          onTemplate={() =>
            downloadCsv(`${category.key}-template.csv`, templateCsv(category))
          }
        />
      )}

      {step === 'map' && category && source && (
        <ColumnMapper
          category={category}
          headers={source.headers}
          mapping={mapping}
          onChange={(key, value) =>
            setMapping((prev) => ({ ...prev, [key]: value }))
          }
          onBack={() => setStep('upload')}
          onNext={handlePreview}
        />
      )}

      {step === 'preview' && category && (
        <>
          <ImportPreview
            category={category}
            preview={preview}
            busy={busy}
            onBack={() => setStep('map')}
            onNext={handleReview}
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
        </>
      )}

      {step === 'review' && category && (
        <DuplicateReview
          category={category}
          preview={preview}
          matches={matches}
          decisions={decisions}
          onDecide={(index, choice) =>
            setDecisions((prev) => ({ ...prev, [index]: choice }))
          }
          onBulk={(choice) =>
            setDecisions((prev) => {
              const next = { ...prev };
              Object.keys(matches).forEach((index) => {
                next[index] = choice;
              });
              return next;
            })
          }
          onBack={() => setStep('preview')}
          onImport={handleImport}
        />
      )}

      {step === 'import' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 text-center space-y-3">
          <div className="w-8 h-8 mx-auto border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-700">Importing your rows…</p>
          {progress && (
            <p className="text-xs text-slate-500">
              {progress.done} of {progress.total}
            </p>
          )}
        </div>
      )}

      {step === 'done' && category && results && (
        <ImportResults
          category={category}
          preview={preview}
          results={results}
          onRestart={restart}
        />
      )}
    </div>
  );
}