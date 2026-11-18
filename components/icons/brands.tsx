/**
 * Ícones de redes sociais em traço geométrico, no mesmo estilo do lucide
 * (24x24, stroke, cantos arredondados). Ficam aqui porque o lucide-react
 * deixou de distribuir ícones de marcas.
 */

export type IconProps = {
  className?: string;
  strokeWidth?: number | string;
  size?: number | string;
};

function Svg({
  className,
  strokeWidth = 2,
  size,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </Svg>
  );
}

export function LinkedinIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </Svg>
  );
}

export function YoutubeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2.5 17a24 24 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49 49 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24 24 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49 49 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </Svg>
  );
}

export function TiktokIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </Svg>
  );
}

/**
 * WhatsApp, desenhado cheio e não em traço.
 *
 * A marca do WhatsApp é um balão sólido com o fone vazado dentro. Em traço
 * ela simplesmente não se reconhece: vira um círculo com um risco. Aqui o
 * balão é preenchido e o fone é recortado dele (`evenodd`), que é o que faz
 * o ícone ser lido como WhatsApp mesmo em 20px.
 *
 * Por ser cheio, ele ignora o `stroke` do grupo e usa `currentColor` como
 * preenchimento — assim continua herdando a cor de onde está.
 */
export function WhatsappIcon({ className, size }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.04 2.4c-5.3 0-9.6 4.3-9.6 9.6 0 1.7.45 3.34 1.3 4.8L2.4 21.6l4.94-1.3a9.56 9.56 0 0 0 4.7 1.2h.01c5.3 0 9.6-4.3 9.6-9.6 0-2.56-1-4.97-2.81-6.78a9.53 9.53 0 0 0-6.8-2.82Zm5.63 13.72c-.24.67-1.39 1.28-1.94 1.36-.5.08-1.12.1-1.81-.11-.42-.14-.95-.31-1.64-.61-2.88-1.25-4.76-4.15-4.9-4.34-.14-.19-1.17-1.56-1.17-2.97 0-1.42.74-2.11 1-2.4.26-.29.57-.36.76-.36l.54.01c.18.01.41-.6.63.48.23.55.78 1.9.85 2.04.07.14.11.3.02.49-.9.19-.14.3-.28.47-.14.16-.29.36-.41.49-.14.14-.28.29-.12.57.16.28.71 1.17 1.52 1.9 1.04.93 1.92 1.22 2.2 1.36.27.14.43.12.59-.7.16-.19.68-.8.86-1.07.18-.28.36-.23.61-.14.25.9.16 1.46 1.83 1.72 2.16.26.7.26 1.3.02 1.96Z"
      />
    </svg>
  );
}
