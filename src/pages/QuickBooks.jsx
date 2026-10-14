import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import usePlanFeature from '@/hooks/usePlanFeature';
import UpgradePrompt from '@/components/UpgradePrompt';
import QuickBooksConnectionCard from '@/components/quickbooks/QuickBooksConnectionCard';
import QuickBooksSyncPanel from '@/components/quickbooks/QuickBooksSyncPanel';
import QuickBooksPayrollPanel from '@/components/quickbooks/QuickBooksPayrollPanel';
import QuickBooksSyncLog from '@/components/quickbooks/QuickBooksSyncLog';
import { ShieldAlert } from 'lucide-react';

export default function QuickBooks() {
  const { user } = useAuth();
  const { locked, loading: planLoading } = usePlanFeature('quickbooks');
  const [state, setState] = useState({
    loading: true,
    connection: null,
    configured: false,
  });
  const [logs, setLogs] = useState([]);
  const [busy, setBusy] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [notice, setNotice] = useState('');

  const load = async () => {
    try {
      const res = await base44.functions.invoke('quickbooksAuth', { action: 'status' });
      setState({
        loading: false,
        connection: res.data?.connection || null,
        configured: !!res.data?.configured,
      });
      const hist = await base44.functions.invoke('quickbooksSync', { action: 'history' });
      setLogs(hist.data?.logs || []);
    } catch (e) {
      setState((s) => ({ ...s, loading: false }));
      setError(e?.response?.data?.error || e?.message || 'QuickBooks could not be reached.');
    }
  };

  useEffect(() => {
    if (planLoading || locked || !user) return;
    const params = new URLSearchParams(window.location.search);
    const flag = params.get('quickbooks');
    if (flag === 'connected') setNotice('QuickBooks is connected.');
    else if (flag === 'error') setError('QuickBooks did not finish connecting. Try again.');
    else if (flag === 'unconfigured')
      setError('This app still needs its Intuit app keys before a shop can connect.');
    if (flag) window.history.replaceState({}, '', '/quickbooks');
    load();
  }, [planLoading, locked, user]);

  if (planLoading) return null;
  if (locked) return <UpgradePrompt feature="quickbooks" />;

  if (user && user.role !== 'admin') {
    return (
      <div className="p-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6 text-center space-y-2">
          <ShieldAlert className="w-8 h-8 mx-auto text-slate-400" />
          <h2 className="font-bold text-slate-900">Administrators only</h2>
          <p className="text-sm text-slate-500">
            Connecting QuickBooks and syncing your books is limited to shop
            administrators.
          </p>
        </div>
      </div>
    );
  }

  const handleConnect = async () => {
    setError('');
    setNotice('');
    // Open the tab synchronously so the browser keeps the click's permission.
    const tab = window.open('', '_blank');
    if (!tab) {
      setError('Allow popups in your browser to connect QuickBooks.');
      return;
    }
    tab.opener = null;
    setBusy(true);
    try {
      const res = await base44.functions.invoke('quickbooksAuth', {
        action: 'start',
        environment: state.connection?.environment === 'sandbox' ? 'sandbox' : 'production',
      });
      const url = res.data?.url;
      if (!url) throw new Error(res.data?.error || 'Could not start the connection.');
      tab.location.replace(url);
      const timer = setInterval(() => {
        if (tab.closed) {
          clearInterval(timer);
          setBusy(false);
          load();
        }
      }, 500);
    } catch (e) {
      tab.close();
      setBusy(false);
      setError(e?.response?.data?.error || e?.message || 'Could not start the connection.');
    }
  };

  const handleDisconnect = async () => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await base44.functions.invoke('quickbooksAuth', { action: 'disconnect' });
      await load();
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Could not disconnect.');
    } finally {
      setBusy(false);
    }
  };

  const handleDirection = async (direction) => {
    setError('');
    try {
      const res = await base44.functions.invoke('quickbooksAuth', {
        action: 'direction',
        direction,
      });
      setState((s) => ({ ...s, connection: res.data?.connection || s.connection }));
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Could not save that choice.');
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setError('');
    setResult(null);
    try {
      const res = await base44.functions.invoke('quickbooksSync', { area: 'accounting' });
      setResult(res.data || {});
      await load();
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'The sync could not be completed.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">QuickBooks</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Connect your shop&apos;s own QuickBooks company and keep your books in
          step with ShopClutter.
        </p>
      </div>

      {notice && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-800">
          {notice}
        </div>
      )}

      <QuickBooksConnectionCard
        connection={state.connection}
        configured={state.configured}
        busy={busy}
        error={error}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      <QuickBooksSyncPanel
        connection={state.connection}
        busy={syncing}
        result={result}
        error={error}
        onDirection={handleDirection}
        onSync={handleSync}
      />

      <QuickBooksPayrollPanel />

      <QuickBooksSyncLog logs={logs} />
    </div>
  );
}