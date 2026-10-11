import React from 'react';
import { ArrowLeft } from 'lucide-react';

// A single, task-focused help guide with its numbered steps.
export default function HelpArticleView({ article, topicLabel, onBack }) {
  return (
    <div>
      {/* Stays under the app header while the guide is read, so there is
          always a way back to the topic and search list. */}
      <div className="sticky top-14 z-20 bg-slate-300/95 backdrop-blur px-4 py-2 border-b border-slate-400/40 print:hidden">
        <button
          onClick={onBack}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white border border-slate-200 text-sm font-semibold text-slate-700 active:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Help Center
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div>
          {topicLabel && (
            <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-600">
              {topicLabel}
            </p>
          )}
          <h1 className="text-2xl font-bold text-slate-900 leading-tight mt-0.5">
            {article.title}
          </h1>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            {article.summary}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {article.steps.map((step, i) => (
            <div key={i} className="flex gap-3 p-4">
              <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-900 text-sm font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 leading-snug">
                  {step.heading}
                </p>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}