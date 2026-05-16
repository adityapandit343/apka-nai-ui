import { useCallback, useEffect, useMemo, useState } from 'react';
import DashboardShell from '../components/layout/DashboardShell';
import { useAuth } from '../store/AuthContext';
import { getMyShop } from '../services/shopService';
import { getApiErrorMessage } from '../utils/apiError';

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
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const { data } = await getMyShop();
      setShop(data);
    } catch (settingsError) {
      if (settingsError.response?.status === 404) {
        setShop(null);
      } else {
        setError(getApiErrorMessage(settingsError, 'Could not load shop settings.'));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const readiness = useMemo(() => {
    const hasShop = Boolean(shop?.id);
    const hasLocation = Boolean(shop?.latitude && shop?.longitude);
    const isLive = Boolean(shop?.isLive);

    return {
      hasShop,
      hasLocation,
      isLive,
    };
  }, [shop]);

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
        <SettingsCard title="Owner account" description="Profile data stored from the latest auth response.">
          <div className="grid gap-4">
            <Field label="Name" value={user?.fullName || user?.name} />
            <Field label="Email" value={user?.email} />
            <Field label="Phone" value={user?.phoneNumber || user?.phone} />
            <Field label="Role" value={user?.role} />
          </div>
        </SettingsCard>

        <SettingsCard title="API connection" description="Frontend environment currently used by Axios.">
          <div className="grid gap-4">
            <Field label="Base URL" value={import.meta.env.VITE_API_URL || 'http://localhost:8082'} />
            <Field label="Auth token" value={localStorage.getItem('access_token') ? 'Stored in browser' : 'Not logged in'} />
            <Field label="Mode" value={import.meta.env.MODE} />
          </div>
        </SettingsCard>

        <SettingsCard title="Shop readiness" description="Nearby discovery needs shop location and live status.">
          <ReadinessRow
            label="Shop created"
            done={readiness.hasShop}
            detail={shop?.shopName || 'No shop found'}
          />
          <ReadinessRow
            label="Latitude and longitude added"
            done={readiness.hasLocation}
            detail={readiness.hasLocation ? `${shop.latitude}, ${shop.longitude}` : 'Location is required before going live'}
          />
          <ReadinessRow
            label="Shop is live"
            done={readiness.isLive}
            detail={readiness.isLive ? 'Customers can find this shop nearby' : 'Use Go live from the dashboard'}
          />
        </SettingsCard>

        <SettingsCard title="Production notes" description="Current backend contract from the supplied API docs.">
          <div className="space-y-3 text-sm text-cream/55">
            <p>Owner profile editing is not documented yet.</p>
            <p>Shop updates use `PUT /api/shop`; service edits use `/api/shop/services`.</p>
            <p>Use HTTPS in production and set `VITE_API_URL` to your live API domain.</p>
          </div>
        </SettingsCard>
      </div>
    </DashboardShell>
  );
}
