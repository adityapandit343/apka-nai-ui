import { useCallback, useEffect, useMemo, useState } from 'react';
import DashboardShell from '../components/layout/DashboardShell';
import { getQueue } from '../services/queueService';
import { getShops } from '../services/shopService';

const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.queue)) return payload.queue;
  if (Array.isArray(payload?.shops)) return payload.shops;
  return [];
};

const countStatus = (entries, status) =>
  entries.filter((entry) => String(entry.status).toLowerCase() === status.toLowerCase()).length;

function StatTile({ label, value, tone = 'default' }) {
  const color = tone === 'gold' ? 'text-gold' : tone === 'green' ? 'text-green-300' : 'text-cream';

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div className={`font-playfair text-4xl font-black ${color}`}>{value}</div>
      <div className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-cream/35">
        {label}
      </div>
    </div>
  );
}

function ShopAnalyticsRow({ item }) {
  const total = item.waiting + item.serving + item.done + item.noShow;
  const completionRate = total > 0 ? Math.round((item.done / total) * 100) : 0;

  return (
    <tr className="border-b border-white/10 last:border-b-0">
      <td className="px-4 py-4">
        <div className="font-semibold text-cream">{item.name}</div>
        <div className="mt-1 text-xs text-cream/35">{item.address || 'No address added'}</div>
      </td>
      <td className="px-4 py-4 text-right text-cream/80">{item.waiting}</td>
      <td className="px-4 py-4 text-right text-cream/80">{item.serving}</td>
      <td className="px-4 py-4 text-right text-green-300">{item.done}</td>
      <td className="px-4 py-4 text-right text-red-300">{item.noShow}</td>
      <td className="px-4 py-4 text-right text-gold">{completionRate}%</td>
    </tr>
  );
}

export default function AnalyticsPage() {
  const [shops, setShops] = useState([]);
  const [shopStats, setShopStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const { data } = await getShops();
      const nextShops = normalizeList(data);
      setShops(nextShops);

      const stats = await Promise.all(
        nextShops.map(async (shop) => {
          try {
            const queueResponse = await getQueue(shop.id);
            const queue = normalizeList(queueResponse.data);

            return {
              id: shop.id,
              name: shop.name,
              address: shop.address,
              isOpen: Boolean(shop.isOpen ?? shop.isActive),
              waiting: countStatus(queue, 'Waiting'),
              serving: countStatus(queue, 'Serving'),
              done: countStatus(queue, 'Done'),
              noShow: countStatus(queue, 'NoShow'),
            };
          } catch (_) {
            return {
              id: shop.id,
              name: shop.name,
              address: shop.address,
              isOpen: Boolean(shop.isOpen ?? shop.isActive),
              waiting: 0,
              serving: 0,
              done: 0,
              noShow: 0,
            };
          }
        })
      );

      setShopStats(stats);
    } catch (loadError) {
      setError(loadError?.response?.data?.message || 'Could not load analytics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const totals = useMemo(() => {
    return shopStats.reduce(
      (acc, item) => ({
        openShops: acc.openShops + (item.isOpen ? 1 : 0),
        waiting: acc.waiting + item.waiting,
        serving: acc.serving + item.serving,
        done: acc.done + item.done,
        noShow: acc.noShow + item.noShow,
      }),
      { openShops: 0, waiting: 0, serving: 0, done: 0, noShow: 0 }
    );
  }, [shopStats]);

  const totalCustomers = totals.waiting + totals.serving + totals.done + totals.noShow;

  return (
    <DashboardShell
      title="Analytics"
      subtitle="Today ka shop-wise queue performance."
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
      {error && (
        <div className="mb-5 rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatTile label="Total shops" value={shops.length} tone="gold" />
        <StatTile label="Open now" value={totals.openShops} tone="green" />
        <StatTile label="Waiting" value={totals.waiting} />
        <StatTile label="Done today" value={totals.done} tone="green" />
        <StatTile label="No shows" value={totals.noShow} />
      </section>

      <section className="mt-6 rounded-xl border border-white/10 bg-white/[0.03]">
        <div className="flex flex-col justify-between gap-2 border-b border-white/10 px-5 py-4 md:flex-row md:items-center">
          <div>
            <h2 className="font-playfair text-2xl font-bold">Shop performance</h2>
            <p className="mt-1 text-sm text-cream/40">{totalCustomers} customer records counted from today's queues.</p>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-cream/45">Loading analytics...</div>
        ) : shopStats.length === 0 ? (
          <div className="p-10 text-center text-sm text-cream/45">Create a shop to see analytics.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-[0.14em] text-cream/35">
                  <th className="px-4 py-3 text-left">Shop</th>
                  <th className="px-4 py-3 text-right">Waiting</th>
                  <th className="px-4 py-3 text-right">Serving</th>
                  <th className="px-4 py-3 text-right">Done</th>
                  <th className="px-4 py-3 text-right">No show</th>
                  <th className="px-4 py-3 text-right">Completion</th>
                </tr>
              </thead>
              <tbody>
                {shopStats.map((item) => (
                  <ShopAnalyticsRow key={item.id} item={item} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
