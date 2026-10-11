import React from 'react';
import { ArrowLeft } from 'lucide-react';

// A single, task-focused help guide with its numbered steps.
export default function HelpArticleView({ article, topicLabel, onBack }) {
  return (
    <div className="p-4 space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 active:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" /> All help
      </button>

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
  );
}