// Orion character sprite
const ORION_CHARACTER_IMAGE = '/assets/orion-character.png';

interface OrionCharacterProps {
  // Position within the owning land tile (percent)
  leftPercent: number;
  topPercent: number;
  sizePercent: number;
}

/**
 * Orion character placed beside Orion House on the first land tile.
 * Has a smooth idle float animation (small up/down loop every 2.5s).
 */
export function OrionCharacter({ leftPercent, topPercent, sizePercent }: OrionCharacterProps) {
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
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(${ORION_CHARACTER_IMAGE})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
          animation: 'orion-character-idle 2.5s ease-in-out infinite',
        }}
      />
    </div>
  );
}