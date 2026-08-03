// Main background image – replace this file to change the game world background:
// public/assets/orion-background.jpg
const ORION_BG_IMAGE = '/assets/orion-background.jpg';

export function OrionBackground() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: `url(${ORION_BG_IMAGE})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        zIndex: 0,
      }}
      aria-hidden="true"
    />
  );
}