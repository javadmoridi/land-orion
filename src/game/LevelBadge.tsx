// XP required to go from `level` to `level + 1`
// formula: xpRequired(level) = 20 * Math.pow(1.2, level - 1)
export function xpRequiredForLevel(level: number): number {
  return Math.round(20 * Math.pow(1.2, level - 1));
}

// Orion character sprite shown inside the HUD circle
const ORION_CHARACTER_IMAGE = '/assets/orion-character.png';

interface LevelBadgeProps {
  level: number;
  experience: number;
}

/**
 * Floating HUD circle on the right side of the screen.
 * Shows the Orion character image inside the circle,
 * current level in the center, XP below, and a progress ring
 * around the circle representing XP progress toward the next level.
 *
 * XP progression:
 * Level 1 = 20 XP
 * Level 2 = 24 XP
 * Level 3 = 29 XP
 * ...
 * formula: xpRequired(level) = 20 * Math.pow(1.2, level - 1)
 */
export function LevelBadge({ level, experience }: LevelBadgeProps) {
  const xpToNext = xpRequiredForLevel(level);
  const progress = Math.min(experience / xpToNext, 1);
  const circumference = 2 * Math.PI * 45; // r=45
  const dashOffset = circumference * (1 - progress);

  return (
    <div
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 10,
        width: 120,
        height: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Progress ring */}
      <svg width="120" height="120" viewBox="0 0 120 120" style={{ position: 'absolute', inset: 0 }}>
        {/* Background ring */}
        <circle
          cx="60"
          cy="60"
          r="45"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
        />
        {/* Progress ring */}
        <circle
          cx="60"
          cy="60"
          r="45"
          fill="none"
          stroke="#ffd700"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>

      {/* Inner circle with Orion character + level info */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          background: 'rgba(10, 14, 26, 0.85)',
          backdropFilter: 'blur(8px)',
          borderRadius: '50%',
          width: 96,
          height: 96,
          border: '2px solid rgba(255, 215, 0, 0.3)',
          boxShadow: '0 0 20px rgba(255, 215, 0, 0.15)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Orion character image – fits inside the circle */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${ORION_CHARACTER_IMAGE})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            imageRendering: 'pixelated',
            opacity: 0.35,
          }}
        />
        {/* Level text on top of character */}
        <span style={{ fontSize: '0.6rem', color: '#8fb5ff', letterSpacing: '0.1em', position: 'relative', zIndex: 1 }}>
          LEVEL
        </span>
        <span style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#fff', lineHeight: 1.1, position: 'relative', zIndex: 1 }}>
          {level}
        </span>
        <span style={{ fontSize: '0.55rem', color: '#ffd700', position: 'relative', zIndex: 1 }}>
          {experience}/{xpToNext} XP
        </span>
      </div>
    </div>
  );
}