/**
 * Orion Token icon — a stylized dragon head.
 *
 * Replaces the generic gem/coin icon for the Orion Token so it has its own
 * distinct identity (Gems use a 💎 glyph, Tokens use this dragon head).
 */

interface OrionTokenIconProps {
  size?: number;
}

export function OrionTokenIcon({ size = 18 }: OrionTokenIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <title>Orion Token</title>

      {/* Back horns */}
      <path
        d="M8.5 4 L6.2 1.4 L9.8 2.6 Z"
        fill="#b8860b"
        opacity="0.85"
      />
      <path
        d="M15.5 4 L17.8 1.4 L14.2 2.6 Z"
        fill="#b8860b"
        opacity="0.85"
      />

      {/* Head */}
      <path
        d="M12 3 C7 3 4 6 4 10 C4 13 6 15 5.8 18 L7 18.6
           C7.6 16.7 8.8 16 10 16.6 L10 20 L14 20 L14 16.6
           C15.2 16 16.4 16.7 17 18.6 L18.2 18
           C18 15 20 13 20 10 C20 6 17 3 12 3 Z"
        fill="url(#orionTokenHead)"
        stroke="#e6c564"
        strokeWidth="0.8"
      />

      {/* Scales on top of head */}
      <path d="M9 6.5 L12 5 L15 6.5 L15 8.5 L9 8.5 Z" fill="#7f5b00" opacity="0.55" />

      {/* Eye sockets */}
      <ellipse cx="8.6" cy="10" rx="1.8" ry="1.9" fill="#0b1220" />
      <ellipse cx="15.4" cy="10" rx="1.8" ry="1.9" fill="#0b1220" />

      {/* Eyes */}
      <circle cx="8.8" cy="9.8" r="0.9" fill="#ffd700" />
      <circle cx="15.2" cy="9.8" r="0.9" fill="#ffd700" />
      <circle cx="9.1" cy="9.5" r="0.35" fill="#fff" />
      <circle cx="15.5" cy="9.5" r="0.35" fill="#fff" />

      {/* Nostrils */}
      <circle cx="10.2" cy="13" r="0.5" fill="#5a3a00" />
      <circle cx="13.8" cy="13" r="0.5" fill="#5a3a00" />

      {/* Mouth / jaw line */}
      <path d="M8.5 15.2 Q12 16.8 15.5 15.2" stroke="#8a6b1d" strokeWidth="0.7" fill="none" strokeLinecap="round" />

      {/* Teeth */}
      <path d="M9.5 15.2 L9.3 16.4" stroke="#e6e6e6" strokeWidth="0.7" strokeLinecap="round" />
      <path d="M12 15.6 L12 16.8" stroke="#e6e6e6" strokeWidth="0.7" strokeLinecap="round" />
      <path d="M14.5 15.2 L14.7 16.4" stroke="#e6e6e6" strokeWidth="0.7" strokeLinecap="round" />

      <defs>
        <linearGradient id="orionTokenHead" x1="6" y1="3" x2="18" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4f7cff" />
          <stop offset="0.5" stopColor="#8a5cf5" />
          <stop offset="1" stopColor="#ffd700" />
        </linearGradient>
      </defs>
    </svg>
  );
}
