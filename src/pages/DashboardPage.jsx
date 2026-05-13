import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../store/AuthContext';
import {
  getQueue,
  nextCustomer,
  markDone,
  markNoShow,
} from '../services/queueService';
import { getShops, createShop, toggleShop, deleteShop } from '../services/shopService';
import Sidebar from '../components/layout/Sidebar';

// ─── helpers ─────────────────────────────────────────────────────────────────
const POLL_MS = 8000;

function Badge({ children, color = 'gold' }) {
  const map = {
    gold: { bg: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: 'rgba(212,175,55,0.3)' },
    green: { bg: 'rgba(74,222,128,0.12)', color: '#4ADE80', border: 'rgba(74,222,128,0.3)' },
    red: { bg: 'rgba(239,68,68,0.1)', color: '#F87171', border: 'rgba(239,68,68,0.25)' },
    gray: { bg: 'rgba(255,255,255,0.07)', color: 'rgba(245,240,232,0.5)', border: 'rgba(255,255,255,0.12)' },
  };
  const s = map[color];
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        padding: '3px 12px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {children}
    </span>
  );
}

function Spinner({ size = 20 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `2px solid rgba(212,175,55,0.2)`,
        borderTop: `2px solid #D4AF37`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        flexShrink: 0,
      }}
    />
  );
}

function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message.text) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [message.text]);
  if (!message.text) return null;
  const isErr = message.type === 'error';
  return (
    <div
      style={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 9999,
        background: isErr ? 'rgba(239,68,68,0.12)' : 'rgba(74,222,128,0.12)',
        border: `1px solid ${isErr ? 'rgba(239,68,68,0.35)' : 'rgba(74,222,128,0.35)'}`,
        color: isErr ? '#F87171' : '#4ADE80',
        padding: '13px 20px',
        borderRadius: 12,
        fontSize: 14,
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 500,
        backdropFilter: 'blur(8px)',
        maxWidth: 340,
        animation: 'slideIn 0.25s ease',
      }}
    >
      {message.text}
    </div>
  );
}

// ─── QR / Share link card ─────────────────────────────────────────────────────
function ShareCard({ shop }) {
  const url = `${window.location.origin}/customer/${shop.id}`;
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        background: 'rgba(212,175,55,0.06)',
        border: '1px solid rgba(212,175,55,0.2)',
        borderRadius: 14,
        padding: '18px 20px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.4)', marginBottom: 4 }}>
          Customer Join Link
        </div>
        <div
          style={{
            fontSize: 13,
            color: '#D4AF37',
            fontFamily: 'monospace',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {url}
        </div>
      </div>
      <button
        onClick={copy}
        style={{
          background: copied ? 'rgba(74,222,128,0.15)' : 'rgba(212,175,55,0.15)',
          border: `1px solid ${copied ? 'rgba(74,222,128,0.3)' : 'rgba(212,175,55,0.3)'}`,
          color: copied ? '#4ADE80' : '#D4AF37',
          padding: '8px 18px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
          whiteSpace: 'nowrap',
          transition: 'all 0.2s',
          flexShrink: 0,
        }}
      >
        {copied ? '✓ Copied!' : 'Copy Link'}
      </button>
    </div>
  );
}

// ─── Serving card ─────────────────────────────────────────────────────────────
function ServingCard({ customer, onDone, shopId }) {
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    await onDone(customer.id);
    setLoading(false);
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(212,175,55,0.04) 100%)',
        border: '1px solid rgba(212,175,55,0.3)',
        borderRadius: 16,
        padding: '20px 24px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'rgba(212,175,55,0.15)',
            border: '2px solid rgba(212,175,55,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            fontSize: 18,
            color: '#D4AF37',
            flexShrink: 0,
          }}
        >
          {customer.tokenNumber}
        </div>
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#D4AF37',
              marginBottom: 2,
            }}
          >
            ● Serving Now
          </div>
          <div style={{ fontSize: 20, fontFamily: "'Playfair Display', serif", fontWeight: 700, color: '#F5F0E8' }}>
            {customer.customerName}
          </div>
        </div>
      </div>
      <button
        onClick={handle}
        disabled={loading}
        style={{
          background: 'rgba(74,222,128,0.15)',
          border: '1px solid rgba(74,222,128,0.35)',
          color: '#4ADE80',
          padding: '10px 24px',
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: "'DM Sans', sans-serif",
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          transition: 'all 0.2s',
          opacity: loading ? 0.6 : 1,
          flexShrink: 0,
        }}
      >
        {loading ? <Spinner size={14} /> : '✓'} Mark Done
      </button>
    </div>
  );
}

// ─── Queue row ────────────────────────────────────────────────────────────────
function QueueRow({ customer, position, avgServiceTime, onNoShow }) {
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    await onNoShow(customer.id);
    setLoading(false);
  };

  const waitMin = position * (avgServiceTime ?? 15);

  return (
    <div
      style={{
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {/* position badge */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 700,
          color: 'rgba(245,240,232,0.5)',
          flexShrink: 0,
        }}
      >
        {position}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: '#F5F0E8' }}>
          #{customer.tokenNumber} — {customer.customerName}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(245,240,232,0.35)', marginTop: 2 }}>
          Est. wait: ~{waitMin} min
        </div>
      </div>

      <button
        onClick={handle}
        disabled={loading}
        style={{
          background: 'transparent',
          border: '1px solid rgba(239,68,68,0.25)',
          color: 'rgba(239,68,68,0.7)',
          padding: '6px 14px',
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: "'DM Sans', sans-serif",
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          transition: 'all 0.2s',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
          e.currentTarget.style.color = '#F87171';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'rgba(239,68,68,0.7)';
        }}
      >
        {loading ? <Spinner size={12} /> : '✕'} No Show
      </button>
    </div>
  );
}

// ─── Stats bar ────────────────────────────────────────────────────────────────
function StatsBar({ queue }) {
  const serving = queue.find((c) => c.status === 'Serving');
  const waiting = queue.filter((c) => c.status === 'Waiting').length;
  const done = queue.filter((c) => c.status === 'Done').length;
  const noshow = queue.filter((c) => c.status === 'NoShow').length;

  const stat = (label, value, accent = false) => (
    <div
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: '14px 18px',
        flex: 1,
        minWidth: 80,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          fontFamily: "'Playfair Display', serif",
          color: accent ? '#D4AF37' : '#F5F0E8',
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.35)', marginTop: 4 }}>
        {label}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
      {stat('Serving', serving ? `#${serving.tokenNumber}` : '—', true)}
      {stat('Waiting', waiting)}
      {stat('Done Today', done)}
      {stat('No-shows', noshow)}
    </div>
  );
}

// ─── Shop selector / creator ──────────────────────────────────────────────────
// Inside DashboardPage, replace the ShopPanel component with this enhanced version:

function ShopPanel({ shops, activeShop, onSelect, onCreate, onToggle, onDelete }) {
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    latitude: '',
    longitude: '',
    avgServiceTime: 15,
  });
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);

  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast('error', 'Geolocation is not supported by your browser');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setForm(prev => ({
          ...prev,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
        }));
        setLocating(false);
        showToast('success', 'Location captured ✓');
      },
      (error) => {
        setLocating(false);
        let message = 'Could not get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location permission denied. Please allow access.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out.';
            break;
        }
        showToast('error', message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    await onCreate({
      name: form.name.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
      latitude: form.latitude === '' ? null : Number(form.latitude),
      longitude: form.longitude === '' ? null : Number(form.longitude),
      avgServiceTime: Number(form.avgServiceTime) || 15,
    });
    setForm({ name: '', address: '', phone: '', latitude: '', longitude: '', avgServiceTime: 15 });
    setCreating(false);
    setSaving(false);
  };

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.4)' }}>
          Your Shops
        </div>
        <button
          onClick={() => setCreating((v) => !v)}
          style={{
            background: 'rgba(212,175,55,0.12)',
            border: '1px solid rgba(212,175,55,0.25)',
            color: '#D4AF37',
            padding: '5px 14px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {creating ? 'Cancel' : '+ New Shop'}
        </button>
      </div>

      {creating && (
        <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            placeholder="Shop name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={inputStyle}
          />
          <input
            placeholder="Address (optional)"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            style={inputStyle}
          />
          <input
            placeholder="Phone (optional)"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            style={inputStyle}
          />
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input
                type="number"
                step="any"
                placeholder="Latitude"
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                style={inputStyle}
              />
              <input
                type="number"
                step="any"
                placeholder="Longitude"
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                style={inputStyle}
              />
            </div>
            <button
              onClick={fetchCurrentLocation}
              disabled={locating}
              style={{
                background: 'rgba(212,175,55,0.12)',
                border: '1px solid rgba(212,175,55,0.3)',
                color: '#D4AF37',
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: locating ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {locating ? <Spinner size={12} /> : '📍 Use My Location'}
            </button>
          </div>
          <input
            type="number"
            min="1"
            max="120"
            placeholder="Average service time in minutes"
            value={form.avgServiceTime}
            onChange={(e) => setForm({ ...form, avgServiceTime: e.target.value })}
            style={inputStyle}
          />
          <button
            onClick={handleCreate}
            disabled={saving}
            style={{
              background: '#D4AF37',
              color: '#0D0D0D',
              border: 'none',
              borderRadius: 8,
              padding: '10px',
              fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {saving ? <Spinner size={14} /> : 'Create Shop'}
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {shops.map((shop) => (
          <div
            key={shop.id}
            onClick={() => onSelect(shop)}
            style={{
              padding: '12px 16px',
              borderRadius: 10,
              background: activeShop?.id === shop.id ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${activeShop?.id === shop.id ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.06)'}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.15s',
              gap: 10,
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: activeShop?.id === shop.id ? '#D4AF37' : '#F5F0E8' }}>
                {shop.name}
              </div>
              {shop.address && (
                <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.35)', marginTop: 2 }}>{shop.address}</div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => onToggle(shop.id)}
                style={{
                  background: shop.isOpen ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${shop.isOpen ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.1)'}`,
                  color: shop.isOpen ? '#4ADE80' : 'rgba(245,240,232,0.35)',
                  padding: '4px 12px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {shop.isOpen ? 'Open' : 'Closed'}
              </button>
              <button
                onClick={() => onDelete(shop.id)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: 'rgba(239,68,68,0.5)',
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 11,
                  cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Del
              </button>
            </div>
          </div>
        ))}
        {shops.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(245,240,232,0.25)', fontSize: 13 }}>
            No shops yet — create one above.
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  padding: '10px 14px',
  fontSize: 14,
  color: '#F5F0E8',
  outline: 'none',
  fontFamily: "'DM Sans', sans-serif",
  width: '100%',
  boxSizing: 'border-box',
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const [queue, setQueue] = useState([]);
  const [shops, setShops] = useState([]);
  const [activeShop, setActiveShop] = useState(null);
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [loadingShops, setLoadingShops] = useState(true);
  const [nextLoading, setNextLoading] = useState(false);
  const [toast, setToast] = useState({ type: '', text: '' });

  const showToast = (type, text) => setToast({ type, text });
  const clearToast = () => setToast({ type: '', text: '' });

  // ── fetch shops ────────────────────────────────────────────────────────────
  const fetchShops = useCallback(async () => {
    try {
      const { data } = await getShops();
      const list = Array.isArray(data) ? data : (data?.data || []);
      setShops(list);
      if (list.length > 0 && !activeShop) {
        setActiveShop(list[0]);
      }
    } catch (_) {
      showToast('error', 'Could not load shops');
    } finally {
      setLoadingShops(false);
    }
  }, []);

  // ── fetch queue ────────────────────────────────────────────────────────────
  const fetchQueue = useCallback(async (shopId) => {
    if (!shopId) return;
    try {
      const { data } = await getQueue(shopId);
      const list = Array.isArray(data) ? data : (data?.data || data?.queue || []);
      setQueue(Array.isArray(list) ? list : []);
    } catch (_) {
      showToast('error', 'Could not refresh queue');
    } finally {
      setLoadingQueue(false);
    }
  }, []);

  useEffect(() => { fetchShops(); }, [fetchShops]);
  useEffect(() => {
    if (!activeShop) return;
    setLoadingQueue(true);
    fetchQueue(activeShop.id);
    const id = setInterval(() => fetchQueue(activeShop.id), POLL_MS);
    return () => clearInterval(id);
  }, [activeShop, fetchQueue]);

  // ── shop actions ───────────────────────────────────────────────────────────
  const handleCreateShop = async (form) => {
    try {
      const { data } = await createShop(form);
      await fetchShops();
      if (data?.id) setActiveShop(data);
      showToast('success', `"${form.name}" created!`);
    } catch (_) {
      showToast('error', 'Could not create shop');
    }
  };

  const handleToggleShop = async (id) => {
    try {
      await toggleShop(id);
      await fetchShops();
      showToast('success', 'Shop status updated');
    } catch (_) {
      showToast('error', 'Could not toggle shop');
    }
  };

  const handleDeleteShop = async (id) => {
    if (!window.confirm('Delete this shop? This cannot be undone.')) return;
    try {
      await deleteShop(id);
      const remaining = shops.filter((s) => s.id !== id);
      setShops(remaining);
      if (activeShop?.id === id) setActiveShop(remaining[0] ?? null);
      showToast('success', 'Shop deleted');
    } catch (_) {
      showToast('error', 'Could not delete shop');
    }
  };

  // ── queue actions ──────────────────────────────────────────────────────────
  const handleNext = async () => {
    if (!activeShop) return;
    setNextLoading(true);
    try {
      await nextCustomer(activeShop.id);
      await fetchQueue(activeShop.id);
      showToast('success', 'Called next customer');
    } catch (_) {
      showToast('error', 'Could not call next customer');
    } finally {
      setNextLoading(false);
    }
  };

  const handleDone = async (entryId) => {
    try {
      await markDone(activeShop.id, entryId);
      await fetchQueue(activeShop.id);
      showToast('success', 'Customer marked done ✓');
    } catch (_) {
      showToast('error', 'Error marking done');
    }
  };

  const handleNoShow = async (entryId) => {
    try {
      await markNoShow(activeShop.id, entryId);
      await fetchQueue(activeShop.id);
      showToast('success', 'Marked as no-show');
    } catch (_) {
      showToast('error', 'Error marking no-show');
    }
  };

  const serving = queue.find((c) => c.status === 'Serving') ?? null;
  const waiting = queue.filter((c) => c.status === 'Waiting');
  const avgServiceTime = Number(activeShop?.avgServiceTime ?? activeShop?.avgServiceTimeMinutes ?? 15);

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#0D0D0D',
        color: '#F5F0E8',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <Sidebar />

      <main
        className="dashboard-main"
        style={{
          flex: 1,
          padding: '32px 40px',
          maxWidth: '100%',
          overflowX: 'hidden',
        }}
      >
        <Toast message={toast} onClose={clearToast} />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 32,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 32,
                fontWeight: 700,
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              Live Queue
            </h1>
            {activeShop && (
              <p style={{ color: 'rgba(245,240,232,0.4)', margin: '6px 0 0', fontSize: 14 }}>
                {activeShop.name}
                {activeShop.isOpen
                  ? ' · 🟢 Open'
                  : ' · 🔴 Closed'}
              </p>
            )}
          </div>
          <button
            onClick={handleNext}
            disabled={nextLoading || !activeShop}
            style={{
              background: nextLoading ? 'rgba(212,175,55,0.4)' : '#D4AF37',
              color: '#0D0D0D',
              border: 'none',
              borderRadius: 10,
              padding: '12px 28px',
              fontSize: 15,
              fontWeight: 700,
              cursor: nextLoading || !activeShop ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
          >
            {nextLoading ? <Spinner size={16} /> : null}
            Next Customer →
          </button>
        </div>

        {/* Shop panel */}
        {loadingShops ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
            <Spinner size={28} />
          </div>
        ) : (
          <ShopPanel
            shops={shops}
            activeShop={activeShop}
            onSelect={setActiveShop}
            onCreate={handleCreateShop}
            onToggle={handleToggleShop}
            onDelete={handleDeleteShop}
          />
        )}

        {activeShop && (
          <>
            {/* Share link */}
            <ShareCard shop={activeShop} />

            {/* Stats */}
            <StatsBar queue={queue} />

            {/* Serving now */}
            {serving ? (
              <ServingCard customer={serving} onDone={handleDone} shopId={activeShop.id} />
            ) : (
              <div
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px dashed rgba(255,255,255,0.1)',
                  borderRadius: 14,
                  padding: '24px',
                  textAlign: 'center',
                  color: 'rgba(245,240,232,0.3)',
                  fontSize: 14,
                  marginBottom: 24,
                }}
              >
                No one being served right now — press "Next Customer" to begin.
              </div>
            )}

            {/* Waiting list */}
            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <span
                  style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.4)' }}
                >
                  Waiting Queue
                </span>
                <Badge color={waiting.length > 0 ? 'gold' : 'gray'}>
                  {waiting.length} waiting
                </Badge>
              </div>

              {loadingQueue ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                  <Spinner size={24} />
                </div>
              ) : waiting.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'rgba(245,240,232,0.25)', fontSize: 14 }}>
                  Queue is empty — all clear! ✓
                </div>
              ) : (
                waiting.map((c, i) => (
                  <QueueRow
                    key={c.id}
                    customer={c}
                    position={i + 1}
                    avgServiceTime={avgServiceTime}
                    onNoShow={handleNoShow}
                  />
                ))
              )}
            </div>

            <p style={{ textAlign: 'center', color: 'rgba(245,240,232,0.2)', fontSize: 11, marginTop: 16 }}>
              Auto-refreshes every {POLL_MS / 1000}s
            </p>
          </>
        )}

        {!activeShop && !loadingShops && (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'rgba(245,240,232,0.3)',
              fontSize: 16,
            }}
          >
            Create a shop above to get started.
          </div>
        )}
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .dashboard-main { margin-left: 256px; padding-bottom: 32px; }
        @media (max-width: 767px) {
          .dashboard-main { margin-left: 0; padding: 24px 16px 88px !important; }
        }
        * { box-sizing: border-box; }
        ::placeholder { color: rgba(245,240,232,0.3); }
      `}</style>
    </div>
  );
}
