import Sidebar from './Sidebar';

export default function DashboardShell({ title, subtitle, actions, children }) {
  return (
    <div className="min-h-screen bg-ink text-cream">
      <Sidebar />
      <main className="min-h-screen md:ml-64">
        <div className="mx-auto max-w-7xl px-5 pb-24 pt-8 md:px-10 md:pb-8">
          <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <h1 className="font-playfair text-3xl font-bold leading-tight md:text-4xl">
                {title}
              </h1>
              {subtitle && <p className="mt-2 text-sm text-cream/45">{subtitle}</p>}
            </div>
            {actions && <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>}
          </header>

          {children}
        </div>
      </main>
    </div>
  );
}
