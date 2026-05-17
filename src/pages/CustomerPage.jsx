import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../store/AuthContext';
import { getRememberedShop } from '../services/customerDiscoveryService';
import { createHaircutRequest, getMyRequest } from '../services/queueService';
import { getApiErrorMessage } from '../utils/apiError';

// Leaflet standard stylesheet layout import
import 'leaflet/dist/leaflet.css';

// 🎨 STATUS BADGE DESIGN ENGINE (Fixed Reference Error)
function StatusBadge({ status }) {
  const normalized = String(status || 'Pending');
  const tone =
    normalized === 'Accepted' || normalized === 'Live'
      ? 'border-green-400/30 bg-green-400/10 text-green-300'
      : normalized === 'Rejected' || normalized === 'Offline'
        ? 'border-red-400/30 bg-red-400/10 text-red-300'
        : normalized === 'Completed'
          ? 'border-white/10 bg-white/10 text-cream/60'
          : 'border-gold/30 bg-gold/10 text-gold';

  return <span className={`rounded-md border px-2.5 py-1 text-xs font-bold ${tone}`}>{normalized}</span>;
}

// ⚠️ INFO BOX ALERTS SYSTEM (Fixed Reference Error)
function InfoBox({ children, tone = 'default' }) {
  const classes =
    tone === 'error'
      ? 'border-red-400/30 bg-red-400/10 text-red-100'
      : tone === 'success'
        ? 'border-green-400/30 bg-green-400/10 text-green-300'
        : 'border-white/10 bg-white/[0.04] text-cream/70';

  return <div className={`rounded-lg border px-4 py-3 text-sm ${classes}`}>{children}</div>;
}

// 💎 ULTRA-MODERN LUXURY MARKERS ENGINE
const createCustomMarker = (htmlGlowColor, centerEmoji) => L.divIcon({
  className: 'custom-gps-marker',
  html: `
    <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
      <!-- Glowing Pulse Aura Ring -->
      <div style="
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: ${htmlGlowColor};
        opacity: 0.25;
        animation: marker-pulse 1.8s infinite ease-in-out;
      "></div>
      <!-- Core Glassmorphism Pointer Base -->
      <div style="
        position: absolute;
        top: 6px;
        left: 6px;
        width: 28px;
        height: 28px;
        background: #111116;
        border: 2px solid ${htmlGlowColor};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 15px rgba(0,0,0,0.6);
        font-size: 14px;
      ">
        ${centerEmoji}
      </div>
    </div>
    <style>
      @keyframes marker-pulse {
        0% { transform: scale(0.6); opacity: 0.8; }
        100% { transform: scale(1.6); opacity: 0; }
      }
    </style>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

const userLiveIcon = createCustomMarker('#D4AF37', '💎'); // Gold Crown for Customer Node
const salonVenueIcon = createCustomMarker('#ffffff', '💈'); // Sharp White for Barber Salon Shop

const POLL_MS = 8000;

// Dynamic Bounds Autofit Control hook
function ChangeMapView({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds[0] && bounds[1]) {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    }
  }, [bounds, map]);
  return null;
}

// 🗺️ NEXT-GEN INTERACTIVE HUD MAP PANEL (Bina Kisi Key Ke)
function LuxuryVisualTracker({ shopLat, shopLng }) {
  const [userLocation, setUserLocation] = useState(null);
  const shopCoords = [Number(shopLat), Number(shopLng)];

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      (err) => console.error("High-Precision GPS telemetry missing:", err),
      { enableHighAccuracy: true, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Elite Curved Route Path Interpolation Mathematics
  const arcPathWay = useMemo(() => {
    if (!userLocation) return [];
    
    const p1 = userLocation;
    const p2 = shopCoords;
    
    // Curved trajectory control coordinates matrix
    const midLat = (p1[0] + p2[0]) / 2 + (p2[1] - p1[1]) * 0.15;
    const midLng = (p1[1] + p2[1]) / 2 + (p1[0] - p2[0]) * 0.15;
    
    const points = [];
    for (let i = 0; i <= 30; i++) {
      const t = i / 30;
      const lat = (1 - t) * (1 - t) * p1[0] + 2 * (1 - t) * t * midLat + t * t * p2[0];
      const lng = (1 - t) * (1 - t) * p1[1] + 2 * (1 - t) * t * midLng + t * t * p2[1];
      points.push([lat, lng]);
    }
    return points;
  }, [userLocation]);

  const mapBounds = userLocation ? [userLocation, shopCoords] : [shopCoords, shopCoords];

  return (
    <div className="mt-5 overflow-hidden border border-white/[0.06] rounded-2xl shadow-2xl relative" style={{ height: '360px', width: '100%' }}>
      {/* Premium Vignette Overlay for Depth */}
      <div className="absolute inset-0 pointer-events-none z-[1000] border border-white/5 rounded-2xl shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]"></div>
      
      <MapContainer
        center={shopCoords}
        zoom={15}
        zoomControl={false}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', background: '#0b0b0f' }}
      >
        {/* Dark Fluid Basemap Style Mapping */}
        <TileLayer
          attribution='&copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Salon Core Target Node */}
        <Marker position={shopCoords} icon={salonVenueIcon} />

        {/* User Dynamic Vector Matrix */}
        {userLocation && (
          <>
            <Marker position={userLocation} icon={userLiveIcon} />
            {/* Smooth gold dashed curved path layout line */}
            <Polyline 
              positions={arcPathWay} 
              pathOptions={{
                color: '#D4AF37', 
                weight: 3, 
                opacity: 0.85,
                dashArray: '8, 8',
                lineCap: 'round'
              }} 
            />
          </>
        )}

        <ChangeMapView bounds={mapBounds} />
      </MapContainer>
    </div>
  );
}

export default function CustomerPage() {
  const { shopId } = useParams();
  const { user } = useAuth();
  const [shop] = useState(() => getRememberedShop(shopId));
  const [selectedServices, setSelectedServices] = useState([]);
  const [hairStyle, setHairStyle] = useState('');
  const [notes, setNotes] = useState('');
  const [activeRequest, setActiveRequest] = useState(null);
  const [loadingRequest, setLoadingRequest] = useState(Boolean(user));
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const services = useMemo(() => shop?.services || [], [shop]);
  const isCustomer = user?.role === 'Customer';
  const hasCoordinates = Boolean(shop?.latitude && shop?.longitude);

  const loadMyRequest = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await getMyRequest();
      setActiveRequest(data || null);
    } catch (error) {
      if (error.response?.status !== 404) {
        setMessage(getApiErrorMessage(error, 'Could not load your request.'));
      }
    } finally {
      setLoadingRequest(false);
    }
  }, [user]);

  useEffect(() => {
    loadMyRequest();
    if (!user) return undefined;
    const intervalId = setInterval(loadMyRequest, POLL_MS);
    return () => clearInterval(intervalId);
  }, [loadMyRequest, user]);

  const toggleService = (serviceId) => {
    setSelectedServices((current) =>
      current.includes(serviceId) ? current.filter((id) => id !== serviceId) : [...current, serviceId]
    );
  };

  const submitRequest = async (event) => {
    event.preventDefault();
    setMessage('');
    if (!selectedServices.length) {
      setMessage('Please select at least one service.');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await createHaircutRequest({
        shopId,
        serviceIds: selectedServices,
        hairStyle,
        notes,
      });
      setActiveRequest(data);
      setHairStyle('');
      setNotes('');
    } catch (error) {
      setMessage(getApiErrorMessage(error, 'Could not send request.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink px-5 text-cream">
        <section className="w-full max-w-md rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center">
          <h1 className="font-playfair text-3xl font-bold">Login to request a service</h1>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link className="rounded-lg bg-gold px-4 py-3 text-sm font-bold text-ink" to="/customer/login">Login</Link>
            <Link className="rounded-lg border border-gold/30 px-4 py-3 text-sm font-bold text-gold" to="/customer/register">Create account</Link>
          </div>
        </section>
      </main>
    );
  }

  if (!isCustomer) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink px-5 text-cream">
        <InfoBox tone="error">Please use a customer account to send salon requests.</InfoBox>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ink px-5 py-6 text-cream">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex flex-col justify-between gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center">
          <div>
            <Link to="/customer/" className="text-sm font-semibold text-gold">&larr; Back to nearby shops</Link>
            <h1 className="mt-3 font-playfair text-4xl font-black leading-tight">{shop?.name || `Shop #${shopId}`}</h1>
            <p className="mt-2 text-sm text-cream/45">{shop?.address || 'Shop details loading.'}</p>
          </div>
          {shop && <StatusBadge status={shop.isLive ? 'Live' : 'Offline'} />}
        </header>

        {message && <div className="mb-5"><InfoBox tone="error">{message}</InfoBox></div>}

        {loadingRequest ? (
          <InfoBox>Loading your active request...</InfoBox>
        ) : activeRequest ? (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-start">
            
            {/* Active Request Stats Dashboard Panel */}
            <section className="rounded-xl border border-gold/20 bg-gold/10 p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Your Appointment Status</p>
                  <h2 className="mt-2 font-playfair text-3xl font-bold">
                    {activeRequest.tokenNumber ? `Token #${activeRequest.tokenNumber}` : 'Waiting for approval'}
                  </h2>
                  <p className="mt-2 text-sm text-cream/60">{(activeRequest.requestedServiceNames || []).join(', ')}</p>
                </div>
                <StatusBadge status={activeRequest.status} />
              </div>
              
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                  <div className="text-2xl font-bold text-cream">{activeRequest.totalEstimatedMinutes || 0} min</div>
                  <div className="text-xs uppercase tracking-[0.14em] text-cream/35">Est. wait</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                  <div className="text-2xl font-bold text-cream">{activeRequest.status || 'Pending'}</div>
                  <div className="text-xs uppercase tracking-[0.14em] text-cream/35">Status</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                  <div className="text-2xl font-bold text-cream">{activeRequest.tokenNumber || '-'}</div>
                  <div className="text-xs uppercase tracking-[0.14em] text-cream/35">Token</div>
                </div>
              </div>
            </section>

            {/* 🗺️ PREMIUM VISUAL LIVE HUD TRACKER PANEL */}
            {hasCoordinates && (
              <section className="rounded-xl border border-white/5 bg-white/[0.02] p-5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gold">Live Telemetry Map</h3>
                    <p className="text-xs text-cream/40 mt-0.5">Real-time vector synchronization</p>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-gold animate-ping"></span>
                </div>
                <LuxuryVisualTracker shopLat={shop.latitude} shopLng={shop.longitude} />
              </section>
            )}
          </div>
        ) : (
          <form onSubmit={submitRequest} className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <h2 className="font-playfair text-2xl font-bold">Select services</h2>
              <div className="mt-5 grid gap-3">
                {services.map((service) => {
                  const selected = selectedServices.includes(service.id);
                  return (
                    <button
                      type="button"
                      key={service.id}
                      onClick={() => toggleService(service.id)}
                      className={`rounded-lg border p-4 text-left transition ${selected ? 'border-gold/50 bg-gold/15' : 'border-white/10 bg-white/[0.03]'}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-semibold">{service.serviceName}</div>
                          <div className="mt-1 text-xs text-cream/40">{service.category || 'Service'}</div>
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-bold text-gold">Rs. {service.price ?? 0}</div>
                          <div className="text-xs text-cream/40">{service.estimatedMinutes ?? 0} min</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <h2 className="font-playfair text-2xl font-bold">Request details</h2>
              <div className="mt-5 grid gap-4">
                <label className="grid gap-2 text-sm font-semibold">
                  Preferred style
                  <input
                    className="rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-cream outline-none focus:border-gold/40"
                    value={hairStyle}
                    onChange={(event) => setHairStyle(event.target.value)}
                    placeholder="Side fade with texture"
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold">
                  Notes
                  <textarea
                    className="min-h-28 rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-cream outline-none focus:border-gold/40"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Any special instructions"
                  />
                </label>
                <button
                  type="submit"
                  disabled={submitting || services.length === 0}
                  className="rounded-lg bg-gold px-5 py-3 text-sm font-bold text-ink transition hover:bg-gold-light"
                >
                  {submitting ? 'Sending request...' : 'Send request'}
                </button>
              </div>
            </section>
          </form>
        )}
      </div>
    </main>
  );
}