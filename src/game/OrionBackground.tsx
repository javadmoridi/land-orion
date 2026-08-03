import './orion-background.css';

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${(i * 37) % 100}%`,
  size: 2 + (i % 4),
  duration: 8 + (i % 10),
  delay: `${(i * 0.7) % 8}s`,
  color: i % 3 === 0 ? '#ff8c00' : i % 3 === 1 ? '#ffd700' : '#ff4500',
}));

export function OrionBackground() {
  return (
    <div className="orion-bg" aria-hidden="true">
      {/* Distant planet Orion */}
      <div className="orion-planet" />

      {/* Nebula clouds */}
      <div className="orion-nebula orion-nebula-1" />
      <div className="orion-nebula orion-nebula-2" />
      <div className="orion-nebula orion-nebula-3" />

      {/* Twinkling stars */}
      <div className="orion-stars" />

      {/* Distant mountains */}
      <div className="orion-mountains" />

      {/* Volcanic glow */}
      <div className="orion-volcano" />

      {/* Lava rivers */}
      <div className="orion-lava" />

      {/* Ambient fog */}
      <div className="orion-fog" />

      {/* Floating particles (ash / energy) */}
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className="orion-particle"
          style={{
            left: p.left,
            bottom: '-10px',
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            animationDuration: `${p.duration}s`,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
}