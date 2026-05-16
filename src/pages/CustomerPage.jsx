import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { getRememberedShop } from '../services/customerDiscoveryService';
import { createHaircutRequest, getMyRequest } from '../services/queueService';
import { getApiErrorMessage } from '../utils/apiError';

const POLL_MS = 8000;

function InfoBox({ children, tone = 'default' }) {
  const classes =
    tone === 'error'
      ? 'border-red-400/30 bg-red-400/10 text-red-100'
      : tone === 'success'
        ? 'border-green-400/30 bg-green-400/10 text-green-100'
        : 'border-white/10 bg-white/[0.04] text-cream/70';

  return <div className={`rounded-lg border px-4 py-3 text-sm ${classes}`}>{children}</div>;
}

function StatusBadge({ status }) {
  const normalized = String(status || 'Pending');
  const tone =
    normalized === 'Accepted'
      ? 'border-green-400/30 bg-green-400/10 text-green-300'
      : normalized === 'Rejected'
        ? 'border-red-400/30 bg-red-400/10 text-red-300'
        : normalized === 'Completed'
          ? 'border-white/10 bg-white/10 text-cream/60'
          : 'border-gold/30 bg-gold/10 text-gold';

  return <span className={`rounded-md border px-2.5 py-1 text-xs font-bold ${tone}`}>{normalized}</span>;
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
      current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId]
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
          <p className="mt-2 text-sm text-cream/50">
            Customer login is required because requests and live token updates are linked to your account.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link className="rounded-lg bg-gold px-4 py-3 text-sm font-bold text-ink" to="/customer/login">
              Login
            </Link>
            <Link className="rounded-lg border border-gold/30 px-4 py-3 text-sm font-bold text-gold" to="/customer/register">
              Create account
            </Link>
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
            <Link to="/customer/" className="text-sm font-semibold text-gold">
              Back to nearby shops
            </Link>
            <h1 className="mt-3 font-playfair text-4xl font-black leading-tight">
              {shop?.name || `Shop #${shopId}`}
            </h1>
            <p className="mt-2 text-sm text-cream/45">
              {shop?.address || 'Select this shop from nearby search to see full details.'}
            </p>
          </div>
          {shop && <StatusBadge status={shop.isLive ? 'Live' : 'Offline'} />}
        </header>

        {message && <div className="mb-5"><InfoBox tone="error">{message}</InfoBox></div>}

        {loadingRequest ? (
          <InfoBox>Loading your active request...</InfoBox>
        ) : activeRequest ? (
          <section className="rounded-xl border border-gold/20 bg-gold/10 p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Your request</p>
                <h2 className="mt-2 font-playfair text-3xl font-bold">
                  {activeRequest.tokenNumber ? `Token #${activeRequest.tokenNumber}` : 'Waiting for approval'}
                </h2>
                <p className="mt-2 text-sm text-cream/60">
                  {(activeRequest.requestedServiceNames || []).join(', ') || 'Selected services will appear here.'}
                </p>
              </div>
              <StatusBadge status={activeRequest.status} />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                <div className="text-2xl font-bold text-cream">{activeRequest.totalEstimatedMinutes || 0} min</div>
                <div className="text-xs uppercase tracking-[0.14em] text-cream/35">Estimated time</div>
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
            <p className="mt-4 text-xs text-cream/35">Status refreshes every {POLL_MS / 1000} seconds.</p>
          </section>
        ) : (
          <form onSubmit={submitRequest} className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <h2 className="font-playfair text-2xl font-bold">Select services</h2>
              <p className="mt-1 text-sm text-cream/45">Choose what you need so the shop can estimate your slot.</p>

              <div className="mt-5 grid gap-3">
                {services.length > 0 ? (
                  services.map((service) => {
                    const selected = selectedServices.includes(service.id);
                    return (
                      <button
                        type="button"
                        key={service.id}
                        onClick={() => toggleService(service.id)}
                        className={`rounded-lg border p-4 text-left transition ${
                          selected
                            ? 'border-gold/50 bg-gold/15'
                            : 'border-white/10 bg-white/[0.03] hover:border-gold/25'
                        }`}
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
                  })
                ) : (
                  <InfoBox>
                    Service details are not available for this shop. Go back to nearby search and open the shop again.
                  </InfoBox>
                )}
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
                  className="rounded-lg bg-gold px-5 py-3 text-sm font-bold text-ink transition hover:bg-gold-light disabled:cursor-not-allowed disabled:bg-gold/50"
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
