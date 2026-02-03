import ExchangeCard from '@/components/ExchangeCard';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(91,140,255,0.18),_transparent_55%)]">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <header className="flex flex-col items-start gap-6">
          <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">
            Manual settlement. Automated experience.
          </span>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            <span className="gradient-text">Sell Crypto.</span> Get Paid Globally.
          </h1>
          <p className="max-w-xl text-white/70">
            Aether Exchange delivers a premium crypto-to-fiat experience with human verification and
            automated status updates. Transparent rates, secure flows, and global payouts.
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-white/60">
            <span className="rounded-full border border-white/10 px-3 py-1">No blockchain APIs</span>
            <span className="rounded-full border border-white/10 px-3 py-1">Manual payout control</span>
            <span className="rounded-full border border-white/10 px-3 py-1">Live status timeline</span>
          </div>
        </header>

        <section className="mt-12 grid gap-10 lg:grid-cols-[1.2fr,0.8fr]">
          <ExchangeCard />
          <div className="glass rounded-2xl p-6 shadow-card">
            <h3 className="text-lg font-semibold">Why teams choose Aether</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li>• Automated order tracking with manual verification for compliance.</li>
              <li>• Premium experience that builds trust while you operate manually.</li>
              <li>• Configurable deposit modes to move from fixed to pooled addresses.</li>
              <li>• Protected admin suite with Supabase Auth.</li>
            </ul>
            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-white/50">Average payout time</p>
              <p className="text-2xl font-semibold text-white">45-90 mins</p>
              <p className="text-xs text-white/40">Based on manual verification flow.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
