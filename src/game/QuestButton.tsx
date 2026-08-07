import { useState } from 'react';
import { QuestPanel } from './QuestPanel';

/**
 * Floating quest button fixed to the left edge of the screen.
 * Clicking it opens the Quest panel (QuestPanel) as a modal.
 */
export function QuestButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open quests"
        title="Quests"
        style={{
          position: 'fixed',
          left: '1rem',
          top: '1rem',
          zIndex: 20,
          width: 56,
          height: 56,
          borderRadius: '50%',
          border: '2px solid rgba(255, 215, 0, 0.4)',
          background: 'rgba(10, 14, 26, 0.85)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 0 20px rgba(255, 215, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.6rem',
          cursor: 'pointer',
        }}
      >
        <span style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}>📜</span>
      </button>

      <QuestPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
