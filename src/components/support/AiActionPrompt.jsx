import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

// The assistant can suggest one supported app action. Nothing runs until the
// user confirms it here.
export default function AiActionPrompt({ message, onRun, running }) {
  let action = null;
  if (message?.action_json) {
    try {
      action = JSON.parse(message.action_json);
    } catch (e) {
      action = null;
    }
  }
  if (!action?.type) return null;

  if (message.action_done) {
    return (
      <p className="mt-1.5 flex items-center gap-1 text-[11px] text-green-700">
        <CheckCircle2 className="w-3 h-3" /> Done
      </p>
    );
  }

  return (
    <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-2">
      <p className="flex items-center gap-1 text-[11px] text-amber-900 mb-1.5">
        <Sparkles className="w-3 h-3" /> Suggested step
      </p>
      <Button
        size="sm"
        variant="outline"
        className="bg-white"
        onClick={() => onRun(message, action)}
        disabled={running}
      >
        {running && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {action.label || 'Do it'}
      </Button>
    </div>
  );
}