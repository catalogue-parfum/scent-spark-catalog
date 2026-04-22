const Logo = () => (
  <div className="flex flex-col items-center py-6">
    <svg viewBox="0 0 100 100" className="h-24 w-24 mb-2" aria-hidden="true">
      <path d="M50 10 L60 10 L60 20 L40 20 L40 10 Z" fill="none" stroke="hsl(var(--gold))" strokeWidth="2" />
      <path d="M40 20 L60 20 L65 35 L35 35 Z" fill="none" stroke="hsl(var(--gold))" strokeWidth="2" />
      <path d="M35 35 L25 50 L40 65 L60 65 L75 50 L65 35" fill="none" stroke="hsl(var(--gold))" strokeWidth="2" />
      <path d="M40 75 L30 85 L50 95 L70 85 L60 75 Z" fill="none" stroke="hsl(var(--gold))" strokeWidth="2" />
      <text x="50" y="55" textAnchor="middle" fill="hsl(var(--gold))" fontSize="10" fontStyle="italic" fontFamily="serif">
        WinWin
      </text>
    </svg>
    <h1 className="text-gold text-2xl font-bold tracking-[0.3em]">WIN WIN</h1>
    <p className="text-gold text-xs tracking-[0.5em] uppercase opacity-80">Parfume</p>
  </div>
);

export default Logo;
