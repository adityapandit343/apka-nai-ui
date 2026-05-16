import { useCallback, useEffect, useMemo, useState } from 'react';
import DashboardShell from '../components/layout/DashboardShell';
import {
  createShop,
  getMyShop,
  goLive,
  goOffline,
  normalizeShop,
} from '../services/shopService';
import {
  acceptRequest,
  getLiveQueue,
  getPendingRequests,
  nextCustomer,
  rejectRequest,
} from '../services/queueService';
import { getApiErrorMessage } from '../utils/apiError';

const POLL_MS = 8000;

const emptyShopForm = {
  shopName: '',
  description: '',
  address: '',
  phoneNumber: '',
  latitude: '',
  longitude: '',
  salonType: 'Unisex',
  openingTime: '09:00:00',
  closingTime: '21:00:00',
  services: [
    { serviceName: 'Haircut', category: 'Hair', estimatedMinutes: 20, price: 150 },
  ],
};

function Alert({ message, type = 'error' }) {
  if (!message) return null;
  const classes =
    type === 'success'
      ? 'border-green-400/30 bg-green-400/10 text-green-100'
      : 'border-red-400/30 bg-red-400/10 text-red-100';
  return <div className={`mb-5 rounded-lg border px-4 py-3 text-sm ${classes}`}>{message}</div>;
}

function StatusPill({ status }) {
  const normalized = String(status || 'Waiting');
  const tone =
    normalized === 'InProgress'
      ? 'border-green-400/30 bg-green-400/10 text-green-300'
      : normalized === 'Done'
        ? 'border-white/10 bg-white/10 text-cream/50'
        : normalized === 'Rejected'
          ? 'border-red-400/30 bg-red-400/10 text-red-300'
          : 'border-gold/30 bg-gold/10 text-gold';
  return <span className={`rounded-md border px-2.5 py-1 text-xs font-bold ${tone}`}>{normalized}</span>;
}

function ServiceEditor({ services, setServices }) {
  const updateService = (index, field, value) => {
    setServices((current) =>
      current.map((service, serviceIndex) =>
        serviceIndex === index ? { ...service, [field]: value } : service
      )
    );
  };

  const addService = () => {
    setServices((current) => [
      ...current,
      { serviceName: '', category: 'Hair', estimatedMinutes: 20, price: 0 },
    ]);
  };

  const removeService = (index) => {
    setServices((current) => current.filter((_, serviceIndex) => serviceIndex !== index));
  };

  return (
    <div className="grid gap-3">
      {services.map((service, index) => (
        <div key={index} className="grid gap-3 rounded-lg border border-white/10 bg-black/20 p-3 md:grid-cols-[1fr_120px_120px_120px_auto]">
          <input
            className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-gold/40"
            placeholder="Service name"
            value={service.serviceName}
            onChange={(event) => updateService(index, 'serviceName', event.target.value)}
            required
          />
          <select
            className="rounded-md border border-white/10 bg-ink px-3 py-2 text-sm outline-none focus:border-gold/40"
            value={service.category}
            onChange={(event) => updateService(index, 'category', event.target.value)}
          >
            <option>Hair</option>
            <option>Beard</option>
            <option>Skin</option>
            <option>Other</option>
          </select>
          <input
            type="number"
            min="1"
            className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-gold/40"
            placeholder="Minutes"
            value={service.estimatedMinutes}
            onChange={(event) => updateService(index, 'estimatedMinutes', Number(event.target.value))}
            required
          />
          <input
            type="number"
            min="0"
            className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-gold/40"
            placeholder="Price"
            value={service.price}
            onChange={(event) => updateService(index, 'price', Number(event.target.value))}
            required
          />
          <button
            type="button"
            onClick={() => removeService(index)}
            disabled={services.length === 1}
            className="rounded-md border border-red-400/25 px-3 py-2 text-sm font-semibold text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addService}
        className="w-fit rounded-lg border border-gold/30 px-4 py-2 text-sm font-semibold text-gold hover:bg-gold/10"
      >
        Add service
      </button>
    </div>
  );
}

function ShopSetup({ onCreated }) {
  const [form, setForm] = useState(emptyShopForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const setServices = (updater) =>
    setForm((current) => ({
      ...current,
      services: typeof updater === 'function' ? updater(current.services) : updater,
    }));

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Location is not supported in this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        updateField('latitude', coords.latitude.toFixed(6));
        updateField('longitude', coords.longitude.toFixed(6));
      },
      () => setError('Could not capture location. Enter latitude and longitude manually.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const { data } = await createShop({
        ...form,
        latitude: form.latitude === '' ? null : Number(form.latitude),
        longitude: form.longitude === '' ? null : Number(form.longitude),
      });
      onCreated(normalizeShop(data));
    } catch (shopError) {
      setError(getApiErrorMessage(shopError, 'Could not create shop.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-5">
        <h2 className="font-playfair text-2xl font-bold">Create your shop</h2>
        <p className="mt-1 text-sm text-cream/45">A shop is required before customers can send requests.</p>
      </div>

      <Alert message={error} />

      <div className="grid gap-4 md:grid-cols-2">
        <input className="rounded-lg border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-gold/40" placeholder="Shop name" value={form.shopName} onChange={(event) => updateField('shopName', event.target.value)} required />
        <input className="rounded-lg border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-gold/40" placeholder="Phone number" value={form.phoneNumber} onChange={(event) => updateField('phoneNumber', event.target.value)} required />
        <input className="rounded-lg border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-gold/40 md:col-span-2" placeholder="Address" value={form.address} onChange={(event) => updateField('address', event.target.value)} required />
        <textarea className="min-h-24 rounded-lg border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-gold/40 md:col-span-2" placeholder="Description" value={form.description} onChange={(event) => updateField('description', event.target.value)} />
        <select className="rounded-lg border border-white/10 bg-ink px-4 py-3 outline-none focus:border-gold/40" value={form.salonType} onChange={(event) => updateField('salonType', event.target.value)}>
          <option>Male</option>
          <option>Female</option>
          <option>Unisex</option>
        </select>
        <div className="grid grid-cols-2 gap-3">
          <input type="time" className="rounded-lg border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-gold/40" value={form.openingTime.slice(0, 5)} onChange={(event) => updateField('openingTime', `${event.target.value}:00`)} />
          <input type="time" className="rounded-lg border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-gold/40" value={form.closingTime.slice(0, 5)} onChange={(event) => updateField('closingTime', `${event.target.value}:00`)} />
        </div>
        <input type="number" step="any" className="rounded-lg border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-gold/40" placeholder="Latitude" value={form.latitude} onChange={(event) => updateField('latitude', event.target.value)} />
        <input type="number" step="any" className="rounded-lg border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-gold/40" placeholder="Longitude" value={form.longitude} onChange={(event) => updateField('longitude', event.target.value)} />
      </div>

      <button type="button" onClick={useCurrentLocation} className="mt-3 rounded-lg border border-gold/30 px-4 py-2 text-sm font-semibold text-gold hover:bg-gold/10">
        Use my current location
      </button>

      <div className="mt-6">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-cream/35">Services</h3>
        <ServiceEditor services={form.services} setServices={setServices} />
      </div>

      <button disabled={saving} className="mt-6 rounded-lg bg-gold px-5 py-3 text-sm font-bold text-ink transition hover:bg-gold-light disabled:cursor-not-allowed disabled:bg-gold/50">
        {saving ? 'Creating shop...' : 'Create shop'}
      </button>
    </form>
  );
}

function RequestCard({ request, onAccept, onReject, busy }) {
  return (
    <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h3 className="font-semibold text-cream">{request.customerName}</h3>
          <p className="mt-1 text-sm text-cream/45">{request.customerPhone || 'No phone number'}</p>
          <p className="mt-3 text-sm text-cream/65">{request.hairStyle || 'No hairstyle preference added.'}</p>
          <p className="mt-2 text-xs text-cream/35">{request.requestedServiceNames.join(', ') || 'No services listed'}</p>
        </div>
        <StatusPill status={request.status} />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button disabled={busy} onClick={() => onAccept(request.id)} className="rounded-lg bg-gold px-4 py-2 text-sm font-bold text-ink disabled:opacity-50">
          Accept
        </button>
        <button disabled={busy} onClick={() => onReject(request.id)} className="rounded-lg border border-red-400/30 px-4 py-2 text-sm font-bold text-red-300 disabled:opacity-50">
          Reject
        </button>
      </div>
    </article>
  );
}

function QueueTable({ queue }) {
  if (!queue.length) {
    return <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-cream/45">No live queue entries yet.</div>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-[0.14em] text-cream/35">
              <th className="px-4 py-3 text-left">Position</th>
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
                <td className="px-4 py-4 text-cream/70">{entry.position || '-'}</td>
                <td className="px-4 py-4 font-bold text-gold">#{entry.tokenNumber || '-'}</td>
                <td className="px-4 py-4 text-cream">{entry.customerName}</td>
                <td className="px-4 py-4 text-cream/55">{entry.services.join(', ') || '-'}</td>
                <td className="px-4 py-4 text-right text-cream/70">{entry.totalEstimatedMinutes}</td>
                <td className="px-4 py-4 text-right"><StatusPill status={entry.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [shop, setShop] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [liveQueue, setLiveQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadDashboard = useCallback(async () => {
    setError('');

    try {
      const [shopResponse, pendingResponse, queueResponse] = await Promise.allSettled([
        getMyShop(),
        getPendingRequests(),
        getLiveQueue(),
      ]);

      if (shopResponse.status === 'fulfilled') {
        setShop(shopResponse.value.data);
      } else if (shopResponse.reason?.response?.status !== 404) {
        throw shopResponse.reason;
      }

      setPendingRequests(pendingResponse.status === 'fulfilled' ? pendingResponse.value.data : []);
      setLiveQueue(queueResponse.status === 'fulfilled' ? queueResponse.value.data : []);
    } catch (dashboardError) {
      setError(getApiErrorMessage(dashboardError, 'Could not load dashboard.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    const intervalId = setInterval(loadDashboard, POLL_MS);
    return () => clearInterval(intervalId);
  }, [loadDashboard]);

  const runAction = async (action, successMessage) => {
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      await action();
      setSuccess(successMessage);
      await loadDashboard();
    } catch (actionError) {
      setError(getApiErrorMessage(actionError));
    } finally {
      setActionLoading(false);
    }
  };

  const currentCustomer = useMemo(
    () => liveQueue.find((entry) => entry.status === 'InProgress'),
    [liveQueue]
  );

  const waitingCount = liveQueue.filter((entry) => entry.status === 'Waiting').length;

  return (
    <DashboardShell
      title="Live Queue"
      subtitle="Review incoming requests, call the next customer, and control shop visibility."
      actions={
        <>
          <button onClick={loadDashboard} disabled={loading} className="rounded-lg border border-gold/30 px-4 py-2 text-sm font-semibold text-gold hover:bg-gold/10 disabled:opacity-50">
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          {shop && (
            <button
              disabled={actionLoading}
              onClick={() => runAction(
                () => shop.isLive ? goOffline() : goLive({ latitude: shop.latitude, longitude: shop.longitude }),
                shop.isLive ? 'Shop is now offline.' : 'Shop is now live.'
              )}
              className="rounded-lg bg-gold px-4 py-2 text-sm font-bold text-ink hover:bg-gold-light disabled:opacity-50"
            >
              {shop.isLive ? 'Go offline' : 'Go live'}
            </button>
          )}
        </>
      }
    >
      <Alert message={error} />
      <Alert message={success} type="success" />

      {loading ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-cream/45">Loading dashboard...</div>
      ) : !shop ? (
        <ShopSetup onCreated={setShop} />
      ) : (
        <div className="grid gap-6">
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <div className="font-playfair text-4xl font-black text-gold">{pendingRequests.length}</div>
              <div className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-cream/35">Pending requests</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <div className="font-playfair text-4xl font-black text-cream">{waitingCount}</div>
              <div className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-cream/35">Waiting</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <div className="font-playfair text-4xl font-black text-green-300">{currentCustomer?.tokenNumber ? `#${currentCustomer.tokenNumber}` : '-'}</div>
              <div className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-cream/35">In progress</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <div className="font-playfair text-4xl font-black text-cream">{shop.isLive ? 'Live' : 'Offline'}</div>
              <div className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-cream/35">{shop.shopName}</div>
            </div>
          </section>

          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-playfair text-2xl font-bold">Current service</h2>
                <p className="mt-1 text-sm text-cream/45">
                  {currentCustomer ? `${currentCustomer.customerName} is in progress.` : 'No customer is currently in progress.'}
                </p>
              </div>
              <button
                disabled={actionLoading}
                onClick={() => runAction(nextCustomer, 'Next customer called.')}
                className="rounded-lg bg-gold px-5 py-3 text-sm font-bold text-ink hover:bg-gold-light disabled:opacity-50"
              >
                Complete and call next
              </button>
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-playfair text-2xl font-bold">Incoming requests</h2>
              <span className="text-sm text-cream/35">{pendingRequests.length} pending</span>
            </div>
            {pendingRequests.length ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {pendingRequests.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    busy={actionLoading}
                    onAccept={(id) => runAction(() => acceptRequest(id), 'Request accepted.')}
                    onReject={(id) => runAction(() => rejectRequest(id), 'Request rejected.')}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-cream/45">No pending requests.</div>
            )}
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-playfair text-2xl font-bold">Live queue</h2>
              <span className="text-sm text-cream/35">Refreshes every {POLL_MS / 1000}s</span>
            </div>
            <QueueTable queue={liveQueue} />
          </section>
        </div>
      )}
    </DashboardShell>
  );
}
