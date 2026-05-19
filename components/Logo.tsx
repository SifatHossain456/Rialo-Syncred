import Link from "next/link";

interface LogoMarkProps {
  size?: number;
  className?: string;
}

export function LogoMark({ size = 36, className = "" }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Container */}
      <rect width="36" height="36" rx="9" fill="#818cf8" fillOpacity="0.10" />
      <rect x="0.5" y="0.5" width="35" height="35" rx="8.5" stroke="#818cf8" strokeOpacity="0.22" />

      {/* Active arc — solid indigo, going clockwise over the top */}
      <path
        d="M8 18 C8 12 12 8 18 8 C24 8 28 12 28 18"
        stroke="#818cf8"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Arrowhead at the right end of the active arc */}
      <path
        d="M24.5 14.5 L28 18 L24.5 21.5"
        stroke="#818cf8"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Async arc — dashed purple, going under (paused state) */}
      <path
        d="M28 18 C28 24 24 28 18 28 C12 28 8 24 8 18"
        stroke="#c084fc"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="3.5 3"
        strokeOpacity="0.65"
        fill="none"
      />
      {/* Arrowhead at the left end of the async arc */}
      <path
        d="M11.5 21.5 L8 18 L11.5 14.5"
        stroke="#c084fc"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.65"
        fill="none"
      />
    </svg>
  );
}

interface LogoFullProps {
  size?: number;
  className?: string;
  href?: string;
}

export function LogoFull({ size = 36, className = "", href = "/" }: LogoFullProps) {
  const inner = (
    <span className={`flex items-center gap-2.5 group ${className}`}>
      <LogoMark size={size} />
      <span className="font-bold text-white tracking-tight" style={{ fontSize: size * 0.47 }}>
        Sync<span className="text-indigo-400">red</span>
      </span>
    </span>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}

/* Large hero / splash variant */
export function LogoHero() {
  return (
    <div className="flex flex-col items-center gap-4">
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="80" height="80" rx="22" fill="#818cf8" fillOpacity="0.10" />
        <rect x="1" y="1" width="78" height="78" rx="21" stroke="#818cf8" strokeOpacity="0.22" />

        {/* Outer glow ring */}
        <circle cx="40" cy="40" r="26" stroke="#818cf8" strokeOpacity="0.06" strokeWidth="1" />

        {/* Active arc */}
        <path
          d="M18 40 C18 27 27 18 40 18 C53 18 62 27 62 40"
          stroke="#818cf8"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Arrowhead right */}
        <path
          d="M55 30 L62 40 L55 50"
          stroke="#818cf8"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Async arc */}
        <path
          d="M62 40 C62 53 53 62 40 62 C27 62 18 53 18 40"
          stroke="#c084fc"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="7 6"
          strokeOpacity="0.60"
          fill="none"
        />
        {/* Arrowhead left */}
        <path
          d="M25 50 L18 40 L25 30"
          stroke="#c084fc"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.60"
          fill="none"
        />

        {/* Center dot — the async "pause" moment */}
        <circle cx="40" cy="40" r="4" fill="#818cf8" fillOpacity="0.9" />
        <circle cx="40" cy="40" r="7" stroke="#818cf8" strokeOpacity="0.20" strokeWidth="1" />
      </svg>

      <div className="text-center">
        <div className="text-4xl font-bold text-white tracking-tight">
          Sync<span className="text-indigo-400">red</span>
        </div>
        <div className="text-slate-500 text-sm mt-1 font-mono tracking-widest uppercase">
          Async Lending Protocol
        </div>
      </div>
    </div>
  );
}
