import { useCallback, useEffect, useMemo, useState } from 'react';
import DashboardShell from '../components/layout/DashboardShell';
import { getLiveQueue } from '../services/queueService';
import { getMyShop } from '../services/shopService';
import { getApiErrorMessage } from '../utils/apiError';

const countStatus = (entries, status) =>
  entries.filter((entry) => String(entry.status).toLowerCase() === status.toLowerCase()).length;

function StatTile({ label, value, tone = 'default' }) {
  const color = tone === 'gold' ? 'text-gold' : tone === 'green' ? 'text-green-300' : 'text-cream';

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div className={`font-playfair text-4xl font-black ${color}`}>{value}</div>
      <div className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-cream/35">{label}</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [shop, setShop] = useState(null);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [shopResponse, queueResponse] = await Promise.all([getMyShop(), getLiveQueue()]);
      setShop(shopResponse.data);
      setQueue(queueResponse.data);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, 'Could not load analytics.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const totals = useMemo(() => ({
    waiting: countStatus(queue, 'Waiting'),
    inProgress: countStatus(queue, 'InProgress'),
    done: countStatus(queue, 'Done'),
    totalEstimatedMinutes: queue.reduce((sum, entry) => sum + Number(entry.totalEstimatedMinutes || 0), 0),
  }), [queue]);

  return (
    <DashboardShell
      title="Analytics"
      subtitle="Live queue overview from the production API."
      actions={
        <button
          onClick={loadAnalytics}
          disabled={loading}
          className="rounded-lg border border-gold/30 px-4 py-2 text-sm font-semibold text-gold hover:bg-gold/10 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      }
    >
      {error && <div className="mb-5 rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</div>}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatTile label="Shop status" value={shop?.isLive ? 'Live' : 'Offline'} tone={shop?.isLive ? 'green' : 'default'} />
        <StatTile label="Waiting" value={totals.waiting} tone="gold" />
        <StatTile label="In progress" value={totals.inProgress} tone="green" />
        <StatTile label="Done" value={totals.done} />
        <StatTile label="Service minutes" value={totals.totalEstimatedMinutes} />
      </section>

      <section className="mt-6 rounded-xl border border-white/10 bg-white/[0.03]">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="font-playfair text-2xl font-bold">Queue detail</h2>
          <p className="mt-1 text-sm text-cream/40">
            {shop?.shopName || 'Your shop'} currently has {queue.length} active queue record{queue.length === 1 ? '' : 's'}.
          </p>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-cream/45">Loading analytics...</div>
        ) : queue.length === 0 ? (
          <div className="p-10 text-center text-sm text-cream/45">No queue records are active right now.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-[0.14em] text-cream/35">
                  <th className="px-4 py-3 text-left">Token</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Services</th>
                  <th className="px-4 py-3 text-right">Minutes</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((entry) => (
                  <tr key={entry.id || entry.tokenNumber} className="border-b border-white/10 last:border-b-0">
                    <td className="px-4 py-4 font-bold text-gold">#{entry.tokenNumber || '-'}</td>
                    <td className="px-4 py-4 text-cream">{entry.customerName}</td>
                    <td className="px-4 py-4 text-cream/55">{entry.services.join(', ') || '-'}</td>
                    <td className="px-4 py-4 text-right text-cream/70">{entry.totalEstimatedMinutes}</td>
                    <td className="px-4 py-4 text-right text-cream/70">{entry.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
