import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

// One help article in the browse or search list. It is a real link, so opening
// a guide adds a step to history and the phone's Back button returns here.
export default function HelpArticleCard({ article, topicLabel }) {
  return (
    <Link
      to={`/help/${article.id}`}
      className="w-full text-left bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3 active:bg-slate-50 transition-colors"
    >
      <div className="min-w-0 flex-1">
        {topicLabel && (
          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-600 mb-0.5">
            {topicLabel}
          </p>
        )}
        <p className="font-semibold text-slate-900 leading-snug">{article.title}</p>
        <p className="text-sm text-slate-500 mt-1 leading-snug">{article.summary}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />
    </Link>
  );
}