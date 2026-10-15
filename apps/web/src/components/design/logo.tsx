type LogoProps = { top: string; bottom: string; text: string; size?: number; showWordmark?: boolean };

/** "S" partida en dos mitades que encajan: una cuenta que se divide y vuelve a cuadrar. */
export function SplitlyLogo({ top, bottom, text, size = 40, showWordmark = true }: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="Splitly">
        <path d="M34 10H19a8 8 0 0 0 0 16h3" fill="none" stroke={top} strokeWidth="6" strokeLinecap="round" />
        <path d="M26 22h3a8 8 0 0 1 0 16H14" fill="none" stroke={bottom} strokeWidth="6" strokeLinecap="round" />
      </svg>
      {showWordmark && (
        <span aria-hidden className="text-[20px] font-semibold tracking-tight" style={{ color: text }}>splitly</span>
      )}
    </div>
  );
}
