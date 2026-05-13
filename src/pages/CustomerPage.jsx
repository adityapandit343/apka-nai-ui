import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { joinQueue, getQueue } from '../services/queueService';

// ─── tiny helpers ───────────────────────────────────────────────────────────
const POLL_MS = 8000;
const tokenStorageKey = (shopId) => `cutbook_queue_token_${shopId}`;

function StatCard({ label, value, accent }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(212,175,55,0.18)',
        borderRadius: 14,
        padding: '18px 24px',
        textAlign: 'center',
        flex: 1,
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 36,
          fontWeight: 800,
          fontFamily: "'Playfair Display', serif",
          color: accent ? '#D4AF37' : '#F5F0E8',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 11,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgba(245,240,232,0.45)',
          marginTop: 6,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div
      style={{
        width: 28,
        height: 28,
        border: '3px solid rgba(212,175,55,0.2)',
        borderTop: '3px solid #D4AF37',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        margin: '0 auto',
      }}
    />
  );
}

// ─── Token-received screen ───────────────────────────────────────────────────
function TokenScreen({ token, shopId, queueStats, onRefresh }) {
  const position =
    token.position ??
    (queueStats.waiting?.findIndex?.((c) => c.id === token.id) ?? -1) + 1;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0D0D0D',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        fontFamily: "'DM Sans', sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* decorative ring */}
      <div
        style={{
          position: 'absolute',
          width: 520,
          height: 520,
          borderRadius: '50%',
          border: '1px solid rgba(212,175,55,0.08)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 340,
          height: 340,
          borderRadius: '50%',
          border: '1px solid rgba(212,175,55,0.13)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ fontSize: 40, marginBottom: 16 }}>✂</div>

      <div
        style={{
          fontSize: 12,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'rgba(245,240,232,0.4)',
          marginBottom: 8,
        }}
      >
        Your Token
      </div>

      <div
        style={{
          fontSize: 'clamp(96px, 20vw, 140px)',
          fontWeight: 900,
          fontFamily: "'Playfair Display', serif",
          color: '#D4AF37',
          lineHeight: 1,
          marginBottom: 8,
        }}
      >
        #{token.tokenNumber}
      </div>

      <div
        style={{
          color: 'rgba(245,240,232,0.65)',
          fontSize: 15,
          marginBottom: 32,
        }}
      >
        {token.customerName}
      </div>

      {/* Stats row */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          width: '100%',
          maxWidth: 420,
          marginBottom: 28,
        }}
      >
        <StatCard label="Your position" value={position > 0 ? `#${position}` : '—'} accent />
        <StatCard label="Est. wait" value={`${token.estimatedWait ?? queueStats.estimatedWait ?? '?'} min`} />
        <StatCard label="Waiting" value={queueStats.waitingCount ?? '—'} />
      </div>

      {/* Live queue list */}
      {queueStats.waiting?.length > 0 && (
        <div
          style={{
            width: '100%',
            maxWidth: 420,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(212,175,55,0.14)',
            borderRadius: 16,
            overflow: 'hidden',
            marginBottom: 24,
          }}
        >
          <div
            style={{
              padding: '12px 20px',
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(245,240,232,0.4)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            Queue
          </div>
          {queueStats.serving && (
            <div
              style={{
                padding: '14px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(212,175,55,0.08)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <span style={{ color: '#F5F0E8', fontSize: 14, fontWeight: 500 }}>
                #{queueStats.serving.tokenNumber} {queueStats.serving.customerName}
              </span>
              <span
                style={{
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#D4AF37',
                  background: 'rgba(212,175,55,0.15)',
                  padding: '3px 10px',
                  borderRadius: 20,
                }}
              >
                Serving
              </span>
            </div>
          )}
          {queueStats.waiting.slice(0, 6).map((c, i) => (
            <div
              key={c.id}
              style={{
                padding: '13px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                background: c.id === token.id ? 'rgba(212,175,55,0.06)' : 'transparent',
              }}
            >
              <span
                style={{
                  color: c.id === token.id ? '#D4AF37' : 'rgba(245,240,232,0.65)',
                  fontSize: 14,
                  fontWeight: c.id === token.id ? 600 : 400,
                }}
              >
                #{c.tokenNumber} {c.customerName}
                {c.id === token.id && ' (You)'}
              </span>
              <span style={{ color: 'rgba(245,240,232,0.3)', fontSize: 12 }}>~{(i + 1) * (queueStats.avgServiceTime ?? 15)} min</span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onRefresh}
        style={{
          background: 'transparent',
          border: '1px solid rgba(212,175,55,0.3)',
          color: 'rgba(212,175,55,0.7)',
          padding: '10px 28px',
          borderRadius: 8,
          fontSize: 13,
          cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
          letterSpacing: '0.05em',
        }}
      >
        Refresh Status
      </button>

      <p
        style={{
          color: 'rgba(245,240,232,0.2)',
          fontSize: 11,
          marginTop: 16,
          textAlign: 'center',
        }}
      >
        Auto-refreshes every {POLL_MS / 1000}s
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Join screen ─────────────────────────────────────────────────────────────
function JoinScreen({ shopId, queueStats, loading, onJoin }) {
  const [name, setName] = useState('');
  const [joining, setJoining] = useState(false);
  const [err, setErr] = useState('');

  const handleJoin = async () => {
    if (!name.trim()) { setErr('Please enter your name'); return; }
    setJoining(true);
    setErr('');
    try {
      await onJoin(name.trim());
    } catch (e) {
      setErr(e?.response?.data?.message || 'Could not join queue. Try again.');
      setJoining(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0D0D0D',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'DM Sans', sans-serif",
        color: '#F5F0E8',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Gold accent bar top */}
      <div style={{ height: 3, background: 'linear-gradient(90deg,#D4AF37,#C8973A,#D4AF37)' }} />

      {/* Header */}
      <div
        style={{
          padding: '24px 24px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span style={{ fontSize: 28 }}>✂</span>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700 }}>
          CutBook
        </span>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 20px',
          gap: 24,
        }}
      >
        {/* Hero text */}
        <div style={{ textAlign: 'center', maxWidth: 360 }}>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(28px,7vw,40px)',
              fontWeight: 900,
              margin: 0,
              lineHeight: 1.15,
            }}
          >
            Join the Queue
          </h1>
          <p style={{ color: 'rgba(245,240,232,0.45)', fontSize: 14, marginTop: 8 }}>
            Get a token, wait comfortably. We'll call you.
          </p>
        </div>

        {/* Live stats */}
        {loading ? (
          <Spinner />
        ) : (
          <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 420 }}>
            <StatCard
              label="Currently serving"
              value={queueStats.serving ? `#${queueStats.serving.tokenNumber}` : '—'}
              accent
            />
            <StatCard label="Waiting" value={queueStats.waitingCount ?? 0} />
            <StatCard
              label="Est. wait"
              value={`${queueStats.estimatedWait ?? 0} min`}
            />
          </div>
        )}

        {/* Serving now banner */}
        {queueStats.serving && (
          <div
            style={{
              width: '100%',
              maxWidth: 420,
              background: 'rgba(212,175,55,0.08)',
              border: '1px solid rgba(212,175,55,0.25)',
              borderRadius: 14,
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#4ADE80',
                flexShrink: 0,
                boxShadow: '0 0 8px #4ADE80',
              }}
            />
            <div>
              <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.4)' }}>
                Now Serving
              </div>
              <div style={{ fontWeight: 600, fontSize: 15, color: '#F5F0E8' }}>
                #{queueStats.serving.tokenNumber} — {queueStats.serving.customerName}
              </div>
            </div>
          </div>
        )}

        {/* Waiting list preview */}
        {queueStats.waiting?.length > 0 && (
          <div
            style={{
              width: '100%',
              maxWidth: 420,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '12px 20px',
                fontSize: 11,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'rgba(245,240,232,0.35)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              People Waiting ({queueStats.waitingCount})
            </div>
            {queueStats.waiting.slice(0, 5).map((c, i) => (
              <div
                key={c.id}
                style={{
                  padding: '11px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  fontSize: 13,
                  color: 'rgba(245,240,232,0.6)',
                }}
              >
                <span>#{c.tokenNumber} {c.customerName}</span>
                <span style={{ color: 'rgba(245,240,232,0.3)' }}>~{(i + 1) * (queueStats.avgServiceTime ?? 15)} min</span>
              </div>
            ))}
            {queueStats.waitingCount > 5 && (
              <div
                style={{
                  padding: '10px 20px',
                  fontSize: 12,
                  color: 'rgba(245,240,232,0.3)',
                  textAlign: 'center',
                }}
              >
                +{queueStats.waitingCount - 5} more waiting
              </div>
            )}
          </div>
        )}

        {/* Join form */}
        <div style={{ width: '100%', maxWidth: 420 }}>
          {err && (
            <div
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#FCA5A5',
                padding: '10px 16px',
                borderRadius: 10,
                fontSize: 13,
                marginBottom: 12,
                textAlign: 'center',
              }}
            >
              {err}
            </div>
          )}
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(212,175,55,0.25)',
              borderRadius: 12,
              padding: '15px 18px',
              fontSize: 15,
              color: '#F5F0E8',
              outline: 'none',
              fontFamily: "'DM Sans', sans-serif",
              boxSizing: 'border-box',
              marginBottom: 12,
            }}
          />
          <button
            onClick={handleJoin}
            disabled={joining}
            style={{
              width: '100%',
              background: joining ? 'rgba(212,175,55,0.4)' : '#D4AF37',
              color: '#0D0D0D',
              border: 'none',
              borderRadius: 12,
              padding: '15px',
              fontSize: 15,
              fontWeight: 700,
              cursor: joining ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'background 0.2s',
            }}
          >
            {joining ? <><Spinner /> Getting token…</> : 'Get My Token →'}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function CustomerPage() {
  const { shopId } = useParams();
  const [token, setToken] = useState(() => {
    const stored = sessionStorage.getItem(tokenStorageKey(shopId));
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch (_) {
      sessionStorage.removeItem(tokenStorageKey(shopId));
      return null;
    }
  });
  const [queueStats, setQueueStats] = useState({
    serving: null,
    waiting: [],
    waitingCount: 0,
    estimatedWait: 0,
    avgServiceTime: 15,
  });
  const [loading, setLoading] = useState(true);

  const fetchQueue = useCallback(async () => {
    try {
      const { data } = await getQueue(shopId);
      const list = Array.isArray(data) ? data : (data?.data || data?.queue || []);

      const serving = list.find((c) => c.status === 'Serving') ?? null;
      const waiting = list.filter((c) => c.status === 'Waiting');
      const avgServiceTime = data?.avgServiceTime ?? 15;
      const estimatedWait = data?.estimatedWait ?? waiting.length * avgServiceTime;

      setQueueStats({ serving, waiting, waitingCount: waiting.length, estimatedWait, avgServiceTime });
    } catch (_) {
      // silently fail — keep showing last known state
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  // initial + polling
  useEffect(() => {
    fetchQueue();
    const id = setInterval(fetchQueue, POLL_MS);
    return () => clearInterval(id);
  }, [fetchQueue]);

  const handleJoin = async (name) => {
    const { data } = await joinQueue(shopId, { CustomerName: name });
    // re-fetch to get updated list
    await fetchQueue();
    sessionStorage.setItem(tokenStorageKey(shopId), JSON.stringify(data));
    setToken(data);
  };

  if (token) {
    return (
      <TokenScreen
        token={token}
        shopId={shopId}
        queueStats={queueStats}
        onRefresh={fetchQueue}
      />
    );
  }

  return (
    <JoinScreen
      shopId={shopId}
      queueStats={queueStats}
      loading={loading}
      onJoin={handleJoin}
    />
  );
}
