import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, Plug, Unplug } from 'lucide-react';

const directionLabels = {
  push: 'ShopClutter → QuickBooks',
  pull: 'QuickBooks → ShopClutter',
  two_way: 'Both ways',
};

export default function QuickBooksConnectionCard({
  connection,
  configured,
  busy,
  error,
  onConnect,
  onDisconnect,
}) {
  const connected = connection?.status === 'connected';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div
          className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${
            connected ? 'bg-emerald-100' : 'bg-slate-100'
          }`}
        >
          {connected ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <Plug className="w-5 h-5 text-slate-500" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold text-slate-900">Your QuickBooks company</h2>
          {connected ? (
            <p className="text-sm text-slate-500">
              Connected to {connection.company_name || 'your company'}
              {connection.realm_id ? ` (ID ${connection.realm_id})` : ''}.
              {connection.last_sync_at
                ? ` Last synced ${new Date(connection.last_sync_at).toLocaleString()}.`
                : ' Not synced yet.'}
            </p>
          ) : (
            <p className="text-sm text-slate-500">
              Connect the QuickBooks company this shop keeps its books in. Each
              shop connects its own company — nothing is shared between shops.
            </p>
          )}
        </div>
      </div>

      {connected && (
        <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-600">
          Syncing {directionLabels[connection.accounting_direction] || 'Both ways'}
        </div>
      )}

      {connection?.last_error && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{connection.last_error}</span>
        </div>
      )}

      {!configured && (
        <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-600">
          This app still needs its Intuit app keys before a shop can connect.
          They are added from the dashboard's Secrets page.
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-2">
        {connected ? (
          <Button variant="outline" onClick={onDisconnect} disabled={busy}>
            <Unplug className="w-4 h-4" /> Disconnect
          </Button>
        ) : (
          <Button onClick={onConnect} disabled={busy || !configured}>
            <Plug className="w-4 h-4" />
            {busy ? 'Opening QuickBooks…' : 'Connect QuickBooks'}
          </Button>
        )}
      </div>
    </div>
  );
}