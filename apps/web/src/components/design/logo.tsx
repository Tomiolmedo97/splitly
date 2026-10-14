type LogoProps = { primary: string; accent: string; text: string; size?: number; showWordmark?: boolean };

/** "S" partida en dos mitades que encajan: una cuenta que se divide y vuelve a cuadrar. */
export function SplitlyLogo({ primary, accent, text, size = 48, showWordmark = true }: LogoProps) {
  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="Logo de Splitly">
        <path d="M34 10H19a8 8 0 0 0 0 16h3" fill="none" stroke={primary} strokeWidth="6" strokeLinecap="round" />
        <path d="M26 22h3a8 8 0 0 1 0 16H14" fill="none" stroke={accent} strokeWidth="6" strokeLinecap="round" />
      </svg>
      {showWordmark && (
        <span className="text-2xl font-extrabold tracking-tight" style={{ color: text }}>splitly</span>
      )}
    </div>
  );
}
