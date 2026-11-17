import { cn } from "@/lib/utils";

/**
 * Marca Solutec. O símbolo é um anel com uma fenda à esquerda (sinal NFC
 * entrando) e um núcleo sólido. Usa `currentColor`, então herda a cor do pai.
 */
export function SolutecMark({
  className,
  size = 32,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <defs>
        <mask id="solutec-slot">
          <rect width="100" height="100" fill="#fff" />
          <rect x="-2" y="42" width="56" height="16" rx="2" fill="#000" />
        </mask>
      </defs>
      <g fill="currentColor">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          mask="url(#solutec-slot)"
          d="M50 4a46 46 0 1 1 0 92 46 46 0 0 1 0-92Zm0 23a23 23 0 1 0 0 46 23 23 0 0 0 0-46Z"
        />
        <circle cx="50" cy="50" r="13.5" />
      </g>
    </svg>
  );
}

export function SolutecLogo({
  className,
  size = 30,
  showWordmark = true,
  tagline,
}: {
  className?: string;
  size?: number;
  showWordmark?: boolean;
  tagline?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <SolutecMark size={size} />
      {showWordmark ? (
        <div className="leading-none">
          <span
            className="block font-black tracking-[0.14em]"
            style={{ fontSize: size * 0.62 }}
          >
            SOLUTEC
          </span>
          {tagline ? (
            <span
              className="mt-1 block font-semibold uppercase tracking-[0.22em] opacity-60"
              style={{ fontSize: size * 0.27 }}
            >
              {tagline}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
