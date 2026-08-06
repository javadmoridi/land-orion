// Orion character sprite
const ORION_CHARACTER_IMAGE = '/assets/orion-character.png';

interface OrionCharacterProps {
  // Position within the owning land tile (percent)
  leftPercent?: number;
  topPercent?: number;
  sizePercent?: number;
}

/**
 * Orion character placed beside Orion House on the first land tile.
 * Has a smooth idle float animation (small up/down loop every 2.5s).
 */
export function OrionCharacter({
  leftPercent = 70,
  topPercent = 35,
  sizePercent = 30,
}: OrionCharacterProps) {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
        width: `${sizePercent}%`,
        height: `${sizePercent}%`,
        pointerEvents: 'none',
        zIndex: 4,
      }}
    >
      <style>{`
        @keyframes orion-character-idle {
          0% { transform: translateY(0); }
          50% { transform: translateY(-6%); }
          100% { transform: translateY(0); }
        }
      `}</style>
      <img
        src={ORION_CHARACTER_IMAGE}
        alt="Orion"
        draggable={false}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          objectPosition: 'center',
          imageRendering: 'pixelated',
          animation: 'orion-character-idle 2.5s ease-in-out infinite',
          display: 'block',
        }}
      />
    </div>
  );
}