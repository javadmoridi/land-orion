interface LevelBadgeProps {
  level: number;
  experience: number;
  // XP needed to reach the next level (default 1000)
  xpToNext?: number;
}

/**
 * Floating HUD circle on the right side of the screen.
 * Shows current level in the center, XP below, and a progress ring
 * around the circle representing XP progress toward the next level.
 */
export function LevelBadge({ level, experience, xpToNext = 1000 }: LevelBadgeProps) {
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

      {/* Inner content */}
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
        }}
      >
        <span style={{ fontSize: '0.6rem', color: '#8fb5ff', letterSpacing: '0.1em' }}>LEVEL</span>
        <span style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#fff', lineHeight: 1.1 }}>
          {level}
        </span>
        <span style={{ fontSize: '0.55rem', color: '#ffd700' }}>
          {experience}/{xpToNext} XP
        </span>
      </div>
    </div>
  );
}