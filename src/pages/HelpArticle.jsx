import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { HELP_ARTICLES, topicLabel } from '@/lib/helpContent';
import HelpArticleView from '@/components/help/HelpArticleView';
import { useAuth } from '@/lib/AuthContext';

// A single help guide on its own screen, so the phone's Back button steps back
// to the Help Center list instead of leaving the Help Center entirely.
export default function HelpArticle() {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const article = HELP_ARTICLES.find((a) => a.id === articleId);

  // Return to the list the way the guide was opened, so this button and the
  // phone's Back button land in the same place. Opened straight from a link,
  // there is no list behind it, so go to the list itself.
  const goBack = () => {
    if ((window.history.state?.idx ?? 0) > 0) navigate(-1);
    else navigate('/help', { replace: true });
  };

  // A regular user can never open an administrator-only guide, even from a link.
  if (!article || (article.adminOnly && !isAdmin)) {
    return (
      <div className="p-4 space-y-3">
        <Link
          to="/help"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Help Center
        </Link>
        <p className="text-sm text-slate-500">
          That guide isn't available. Pick one from the Help Center list.
        </p>
      </div>
    );
  }

  return (
    <HelpArticleView
      article={article}
      topicLabel={topicLabel(article.topic)}
      onBack={goBack}
    />
  );
}