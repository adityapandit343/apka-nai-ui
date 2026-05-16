import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DEFAULT_SEARCH_RADIUS_KM,
  getNearbyShops,
  rememberSelectedShop,
} from '../services/customerDiscoveryService';
import { useCustomerLocation } from '../hooks/useCustomerLocation';

function StatusPill({ open }) {
  return (
    <span
      className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${
        open
          ? 'border-green-400/30 bg-green-400/10 text-green-300'
          : 'border-white/10 bg-white/5 text-cream/45'
      }`}
    >
      {open ? 'Open' : 'Closed'}
    </span>
  );
}

function ShopResult({ shop }) {
  return (
    <article className="border-b border-white/10 px-5 py-5 last:border-b-0 md:flex md:items-center md:justify-between md:gap-6">
      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h2 className="font-playfair text-2xl font-bold leading-tight text-cream">
            {shop.name}
          </h2>
          <StatusPill open={shop.isOpen} />
        </div>

        <p className="line-clamp-2 text-sm text-cream/45">
          {shop.address || 'Address not available'}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <Metric label="Distance" value={`${shop.distanceKm.toFixed(1)} km`} />
          <Metric label="Waiting" value={shop.waitingCount} />
          <Metric label="Est. wait" value={`${shop.estimatedWait} min`} />
          <Metric label="Serving" value={shop.servingToken ? `#${shop.servingToken}` : '-'} />
        </div>
      </div>

      <Link
        to={`/customer/${shop.id}`}
        onClick={() => rememberSelectedShop(shop)}
        className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-gold px-5 py-3 text-sm font-bold text-ink transition hover:bg-gold-light md:mt-0 md:w-auto md:shrink-0"
      >
        Request service
      </Link>
    </article>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
      <div className="text-base font-bold text-cream">{value}</div>
      <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-cream/35">
        {label}
      </div>
    </div>
  );
}

function EmptyState({ hasSearched }) {
  return (
    <div className="px-5 py-12 text-center">
      <p className="font-playfair text-2xl font-bold text-cream">
        {hasSearched ? 'No shops found nearby' : 'Find salons near you'}
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm text-cream/45">
        {hasSearched
          ? 'Try again from a nearby market area or increase the search radius later.'
          : 'Allow location access and CutBook will show live shops near you.'}
      </p>
    </div>
  );
}

export default function NearbyShopsPage() {
  const { loading: locating, error: locationError, requestLocation } = useCustomerLocation();
  const [shops, setShops] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const searchNearby = useCallback(async () => {
    setSearching(true);
    setSearchError('');

    try {
      const coords = await requestLocation();
      const results = await getNearbyShops({
        latitude: coords.latitude,
        longitude: coords.longitude,
        radiusKm: DEFAULT_SEARCH_RADIUS_KM,
      });

      setShops(results);
      setHasSearched(true);
    } catch (error) {
      setSearchError(error?.response?.data?.message || error.message || 'Could not find nearby shops.');
    } finally {
      setSearching(false);
    }
  }, [requestLocation]);

  const busy = locating || searching;
  const error = locationError || searchError;

  return (
    <div className="min-h-screen bg-ink text-cream">
      <header className="border-b border-gold/20 px-5 py-5">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <Link to="/" className="font-playfair text-2xl font-bold text-cream">
            CutBook
          </Link>
          <Link to="/login" className="rounded-md border border-gold/35 px-4 py-2 text-sm font-semibold text-gold">
            Shop login
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8">
        <section className="mb-6 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
              Nearby search
            </p>
            <h1 className="mt-2 font-playfair text-4xl font-black leading-tight md:text-5xl">
              Choose a salon near you
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-cream/50">
              See distance, available services, and active queue size before sending a request.
            </p>
          </div>

          <button
            onClick={searchNearby}
            disabled={busy}
            className="rounded-lg bg-gold px-6 py-3 text-sm font-bold text-ink transition hover:bg-gold-light disabled:cursor-not-allowed disabled:bg-gold/50"
          >
            {busy ? 'Searching...' : 'Use my location'}
          </button>
        </section>

        {error && (
          <div className="mb-5 rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          {shops.length > 0 ? (
            shops.map((shop) => <ShopResult key={shop.id} shop={shop} />)
          ) : (
            <EmptyState hasSearched={hasSearched} />
          )}
        </section>
      </main>
    </div>
  );
}
