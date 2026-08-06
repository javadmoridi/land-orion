// Main background image – replace this file to change the game world background:
// public/assets/orion-background.jpg
const ORION_BG_IMAGE = '/assets/orion-background.jpg';

export function OrionBackground() {
  return (
    <img
      src={ORION_BG_IMAGE}
      alt=""
      aria-hidden="true"
      draggable={false}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}