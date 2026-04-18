import type { CSSProperties } from 'react';

interface Props {
  className?: string;
  style?: CSSProperties;
}

export default function InnGamesLogo({ className, style }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 260 100"
      fill="none"
      className={className}
      style={style}
      aria-label="Inngames"
    >
      <defs>
        <linearGradient id="ingGrad" x1="0" y1="50" x2="260" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#ff1870" />
          <stop offset="38%"  stopColor="#a018f0" />
          <stop offset="72%"  stopColor="#0090ff" />
          <stop offset="100%" stopColor="#00d8ff" />
        </linearGradient>
      </defs>

      {/* Depth shadow */}
      <path
        d="M 8,92 C 8,4 148,4 158,92"
        stroke="rgba(0,0,0,0.28)"
        strokeWidth="30"
        strokeLinecap="round"
      />

      {/* Main arch ribbon */}
      <path
        d="M 8,92 C 8,4 148,4 158,92"
        stroke="url(#ingGrad)"
        strokeWidth="24"
        strokeLinecap="round"
      />

      {/* Streaming lines (upper-right, coming from arch's descending right side) */}
      <line x1="156" y1="52" x2="248" y2="4"  stroke="url(#ingGrad)" strokeWidth="5.5" strokeLinecap="round" />
      <line x1="157" y1="62" x2="248" y2="14" stroke="url(#ingGrad)" strokeWidth="5.5" strokeLinecap="round" />
      <line x1="157" y1="72" x2="248" y2="24" stroke="url(#ingGrad)" strokeWidth="5.5" strokeLinecap="round" />
      <line x1="158" y1="82" x2="248" y2="34" stroke="url(#ingGrad)" strokeWidth="5.5" strokeLinecap="round" />
      <line x1="158" y1="89" x2="241" y2="41" stroke="url(#ingGrad)" strokeWidth="4"   strokeLinecap="round" />
      <line x1="158" y1="93" x2="233" y2="48" stroke="url(#ingGrad)" strokeWidth="3"   strokeLinecap="round" />

      {/* Dots at the end of each line */}
      <circle cx="248" cy="4"  r="7" fill="#00d8ff" />
      <circle cx="248" cy="14" r="7" fill="#00d8ff" />
      <circle cx="248" cy="24" r="7" fill="#00d8ff" />
      <circle cx="248" cy="34" r="7" fill="#00d8ff" />
      <circle cx="241" cy="41" r="6" fill="#00d8ff" />
      <circle cx="233" cy="48" r="5" fill="#00d8ff" />
    </svg>
  );
}
