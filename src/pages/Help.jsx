import React, { useMemo, useState } from 'react';
import { Search, LifeBuoy } from 'lucide-react';
import {
  HELP_TOPICS,
  HELP_ARTICLES,
  filterArticles,
  topicLabel,
} from '@/lib/helpContent';
import HelpArticleCard from '@/components/help/HelpArticleCard';
import HelpArticleView from '@/components/help/HelpArticleView';
import { useAuth } from '@/lib/AuthContext';

export default function Help() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(null);

  const results = useMemo(
    () => filterArticles(query, isAdmin),
    [query, isAdmin]
  );
  const searching = query.trim().length > 0;

  // Return to the topic and search list, keeping the search text, and start
  // the list from the top rather than wherever the guide was scrolled to.
  const closeArticle = () => {
    setActive(null);
    window.scrollTo({ top: 0 });
  };

  // A regular user can never open an administrator-only guide, even if one
  // were somehow selected directly.
  if (active && (isAdmin || !active.adminOnly)) {
    return (
      <HelpArticleView
        article={active}
        topicLabel={topicLabel(active.topic)}
        onBack={closeArticle}
      />
    );
  }

  // Browse view: articles grouped under each topic, in topic order.
  const grouped = HELP_TOPICS.map((topic) => ({
    topic,
    articles: HELP_ARTICLES.filter(
      (a) => a.topic === topic.key && (isAdmin || !a.adminOnly)
    ),
  })).filter((g) => g.articles.length > 0);

  return (
    <div className="p-4 space-y-4 min-h-screen">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
          <LifeBuoy className="w-5 h-5 text-slate-900" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-none">
            Help Center
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Guides for everyday work in ShopClutter.
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search help, e.g. invoice, clock in, reorder..."
          className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-sm"
        />
      </div>

      {searching ? (
        results.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 px-1">
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </p>
            {results.map((a) => (
              <HelpArticleCard
                key={a.id}
                article={a}
                topicLabel={topicLabel(a.topic)}
                onOpen={setActive}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-600">
            <p className="text-sm">
              No guides match "{query}". Try a different word, or browse the
              topics below.
            </p>
          </div>
        )
      ) : (
        <div className="space-y-6">
          {grouped.map(({ topic, articles }) => (
            <div key={topic.key} className="space-y-2">
              <div className="px-1">
                <h2 className="text-sm font-bold text-slate-900">
                  {topic.label}
                </h2>
                <p className="text-xs text-slate-500">{topic.description}</p>
              </div>
              {articles.map((a) => (
                <HelpArticleCard
                  key={a.id}
                  article={a}
                  onOpen={setActive}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}