import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ink text-cream">
      <nav className="flex items-center justify-between border-b border-gold/20 p-6">
        <div className="flex items-center gap-2">
          <span className="font-playfair text-2xl font-bold">CutBook</span>
        </div>
        <div className="flex flex-wrap justify-end gap-3">
          <Link to="/customer/" className="rounded-md border border-gold/40 px-5 py-2 text-gold">
            Find Salon
          </Link>
          <Link to="/login" className="rounded-md border border-gold/40 px-5 py-2 text-gold">
            Login
          </Link>
          <Link to="/register" className="rounded-md bg-gold px-5 py-2 font-semibold text-ink">
            Free Shuru Karo
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="font-playfair text-5xl font-bold leading-tight md:text-7xl">
          Barber shop ka <br />
          <span className="text-gold">wait khatam.</span>
          <br />
          Paisa shuru.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
          Customer ghar se token lo. Barber ek button se next bulao.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/customer/" className="inline-block rounded-lg bg-cream px-8 py-3 font-bold text-ink">
            Nearby Salon Dhundo
          </Link>
          <Link to="/register" className="inline-block rounded-lg bg-gold px-8 py-3 font-bold text-ink">
            Abhi Shuru Karo - Free
          </Link>
        </div>
      </main>
    </div>
  );
}
