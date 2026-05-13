import { useCallback, useEffect, useMemo, useState } from 'react';
import DashboardShell from '../components/layout/DashboardShell';
import { useAuth } from '../store/AuthContext';
import { getShops } from '../services/shopService';

const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.shops)) return payload.shops;
  return [];
};

function SettingsCard({ title, description, children }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-5">
        <h2 className="font-playfair text-2xl font-bold">{title}</h2>
        {description && <p className="mt-1 text-sm text-cream/40">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-[0.14em] text-cream/35">{label}</label>
      <div className="mt-2 rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm text-cream">
        {value || 'Not available'}
      </div>
    </div>
  );
}

function ReadinessRow({ label, done, detail }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/10 py-3 last:border-b-0">
      <div>
        <div className="font-semibold text-cream">{label}</div>
        {detail && <div className="mt-1 text-xs text-cream/35">{detail}</div>}
      </div>
      <span
        className={`shrink-0 rounded-md border px-2.5 py-1 text-xs font-bold ${
          done
            ? 'border-green-400/30 bg-green-400/10 text-green-300'
            : 'border-gold/30 bg-gold/10 text-gold'
        }`}
      >
        {done ? 'Ready' : 'Needs setup'}
      </span>
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const { data } = await getShops();
      setShops(normalizeList(data));
    } catch (settingsError) {
      setError(settingsError?.response?.data?.message || 'Could not load shop settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const readiness = useMemo(() => {
    const hasShop = shops.length > 0;
    const shopsWithLocation = shops.filter((shop) => shop.latitude && shop.longitude).length;
    const openShops = shops.filter((shop) => Boolean(shop.isOpen ?? shop.isActive)).length;

    return {
      hasShop,
      shopsWithLocation,
      openShops,
      allHaveLocation: hasShop && shopsWithLocation === shops.length,
      hasOpenShop: openShops > 0,
    };
  }, [shops]);

  return (
    <DashboardShell
      title="Settings"
      subtitle="Account, API, and production readiness."
      actions={
        <button
          onClick={loadSettings}
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

      <div className="grid gap-5 lg:grid-cols-2">
        <SettingsCard title="Owner account" description="Profile data returned by /api/auth/me.">
          <div className="grid gap-4">
            <Field label="Name" value={user?.name} />
            <Field label="Email" value={user?.email} />
            <Field label="Phone" value={user?.phone} />
          </div>
        </SettingsCard>

        <SettingsCard title="API connection" description="Frontend environment currently used by Axios.">
          <div className="grid gap-4">
            <Field label="Base URL" value={import.meta.env.VITE_API_URL || 'http://localhost:8082'} />
            <Field label="Auth token" value={localStorage.getItem('access_token') ? 'Stored in browser' : 'Not logged in'} />
            <Field label="Mode" value={import.meta.env.MODE} />
          </div>
        </SettingsCard>

        <SettingsCard title="Shop readiness" description="Nearby discovery needs shop location and open status.">
          <ReadinessRow
            label="At least one shop created"
            done={readiness.hasShop}
            detail={`${shops.length} shop${shops.length === 1 ? '' : 's'} found`}
          />
          <ReadinessRow
            label="Shop latitude and longitude added"
            done={readiness.allHaveLocation}
            detail={`${readiness.shopsWithLocation}/${shops.length} shops ready for nearby search`}
          />
          <ReadinessRow
            label="At least one shop open"
            done={readiness.hasOpenShop}
            detail={`${readiness.openShops} shop${readiness.openShops === 1 ? '' : 's'} currently open`}
          />
        </SettingsCard>

        <SettingsCard title="Production notes" description="Recommended backend upgrades for editable settings.">
          <div className="space-y-3 text-sm text-cream/55">
            <p>Add `PUT /api/auth/me` when you want owner profile edits.</p>
            <p>Add `PUT /api/shops/{'{shopId}'}` when you want editing shop name, address, phone, location, and average service time.</p>
            <p>Use HTTPS in production and set `VITE_API_URL` to your live API domain.</p>
          </div>
        </SettingsCard>
      </div>
    </DashboardShell>
  );
}
