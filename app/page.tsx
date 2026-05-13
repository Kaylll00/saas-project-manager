const navItems = ["Features", "Integrations", "Pricing"];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F3F4F6] px-4 py-4 text-[#121212] sm:px-6 lg:px-8">
      <section className="relative mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-7xl overflow-hidden rounded-[22px] border border-white/80 bg-[#F8F8F4] shadow-[0_24px_90px_rgba(18,18,18,0.08)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_26%,rgba(245,158,11,0.34),transparent_31%),radial-gradient(circle_at_58%_38%,rgba(245,158,11,0.24),transparent_24%),radial-gradient(circle_at_88%_30%,rgba(251,191,36,0.32),transparent_29%),linear-gradient(135deg,rgba(245,158,11,0.16),transparent_58%)] blur-3xl" />
        <div className="absolute -left-24 top-16 h-72 w-[46rem] rotate-6 rounded-[100%] bg-[#F59E0B]/25 blur-3xl" />
        <div className="absolute left-[28%] top-36 h-44 w-[58rem] rotate-[-14deg] rounded-[100%] bg-[#F59E0B]/20 blur-2xl" />
        <div className="absolute right-[-10%] top-24 h-64 w-[34rem] rounded-[100%] bg-[#FDE68A]/45 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.46),rgba(255,255,255,0.18)_44%,rgba(255,255,255,0.62))]" />

        <div className="relative z-10 flex min-h-full w-full flex-col px-5 py-5 sm:px-10 lg:px-14">
          <header className="flex items-center justify-between gap-6">
            <a href="#" className="flex items-center gap-3" aria-label="Flow project management home">
              <span className="grid h-9 w-9 grid-cols-3 gap-1 rounded-full bg-[#121212] p-2">
                <span className="rounded-full bg-white" />
                <span className="rounded-full bg-white/80" />
                <span className="rounded-full bg-[#F59E0B]" />
                <span className="rounded-full bg-white/70" />
                <span className="rounded-full bg-white" />
                <span className="rounded-full bg-white/60" />
              </span>
              <span className="text-xl font-bold tracking-normal">flow</span>
            </a>

            <nav className="hidden items-center gap-8 text-sm font-medium text-[#121212] md:flex">
              {navItems.map((item) => (
                <a key={item} href="#" className="transition hover:text-[#F59E0B]">
                  {item}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <a
                href="#"
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#F59E0B] bg-white/75 px-4 text-sm font-semibold text-[#F59E0B] shadow-[0_10px_28px_rgba(18,18,18,0.06)] backdrop-blur-xl transition hover:bg-white sm:px-5"
              >
                Log in
              </a>
              <a
                href="#"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#F59E0B] px-4 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(245,158,11,0.34)] transition hover:bg-[#d97706] sm:px-5"
              >
                Sign up
              </a>
            </div>
          </header>

          <div className="grid flex-1 grid-rows-[1fr_auto] pt-16 sm:pt-24 lg:pt-32">
            <div className="self-end">
              <h1 className="max-w-3xl text-5xl font-black leading-[0.98] tracking-normal text-[#121212] sm:text-6xl lg:text-7xl">
                Master Chaos. Deliver on Time.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#6B7280] sm:text-lg">
                The intuitive platform that turns complex projects into a single,
                beautiful flow.
              </p>
            </div>

            <div className="flex justify-end py-10 sm:py-12">
              <a href="#" className="text-sm font-medium text-[#6B7280] transition hover:text-[#121212]">
                Learn More -&gt;
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
