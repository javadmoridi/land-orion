import { useEffect, useCallback, useState } from 'react';

import { useGameStore } from './useGameStore';
import {
  setPlayerName,
  loadGameByName,
  getReferralCodeFromUrl,
  claimLoginRewards,
} from '../economy/playerApi';
import { useGemStore } from '../economy/gemStore';

import { useOrionStore } from './orionStore';
import { OrionBackground } from './OrionBackground';
import { PlayerIsland } from './PlayerIsland';
import { LevelBadge } from './LevelBadge';
import { ResourceBar } from './ResourceBar';

export function GameWorld() {
    const {
    playerProfile,
    gameState,
    movePlayer,
    } = useGameStore();

  const [needsName, setNeedsName] = useState(!playerProfile);
  const [nameInput, setNameInput] = useState('');
  const [naming, setNaming] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const handleSetName = useCallback(async () => {
    const cleaned = nameInput.trim().slice(0, 20);
    if (!cleaned) return;
    setNaming(true);
    setNameError(null);
    try {
      const ok = await setPlayerName(cleaned);
      if (ok) {
        // Update the in-memory profile so the save key uses the name immediately.
        const currentState = useGameStore.getState();
        useGameStore.setState({
          playerProfile: {
            ...currentState.playerProfile,
            username: cleaned,
            id: `name-${cleaned}`,
          },
        });
              // Grant the 100 Gem welcome reward.
        const referralCode = getReferralCodeFromUrl() ?? '';
        const reward = await claimLoginRewards(referralCode);
        if (reward.ok && reward.welcomeGems > 0) {
          useGemStore.getState().addGems(reward.welcomeGems);
        }
        setNeedsName(false);
      } else {
        setNameError('Name could not be saved. Please try again.');
      }
    } catch (e) {
      setNameError('Something went wrong. Please try again.');
    } finally {
      setNaming(false);
    }
  }, [nameInput]);

    // On first render (no profile), prompt for a name once.
  useEffect(() => {
    if (!playerProfile) {
      setNeedsName(true);
    }
  }, [playerProfile]);

  // When the name is set, load any existing game for this name.
  useEffect(() => {
    const profile = useGameStore.getState().playerProfile;
    if (!profile || !profile.username) {
      return;
    }

    const name = profile.username;
    void loadGameByName(name);
  }, [playerProfile?.username, needsName]);

  const tickRuntime = useOrionStore(
    (s) => s.tickRuntime
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      tickRuntime();
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [tickRuntime]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      let dx = 0;
      let dy = 0;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          dy = -1;
          break;

        case 'ArrowDown':
        case 's':
        case 'S':
          dy = 1;
          break;

        case 'ArrowLeft':
        case 'a':
        case 'A':
          dx = -1;
          break;

        case 'ArrowRight':
        case 'd':
        case 'D':
          dx = 1;
          break;

        default:
          return;
      }

      movePlayer(dx, dy);
    },
    [movePlayer]
  );

  useEffect(() => {
    window.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [handleKeyDown]);

    const activePlayer = playerProfile ?? {
    level: 1,
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <OrionBackground />

      {/* Name prompt — shown only when no profile exists yet */}
      {needsName && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.6)',
            zIndex: 100,
          }}
        >
          <div
            style={{
              padding: '2.5rem 2rem',
              borderRadius: 24,
              background: 'rgba(10, 14, 26, 0.9)',
              border: '1px solid rgba(79, 124, 255, 0.3)',
              textAlign: 'center',
              maxWidth: 380,
              width: '100%',
            }}
          >
            <h2 style={{ margin: '0 0 1rem', color: '#fff', fontSize: '1.6rem' }}>
              Welcome to LAND-ORION
            </h2>
            <p style={{ margin: '0 0 1.2rem', color: '#9fb0d0', fontSize: '0.9rem' }}>
              Enter your name to start your journey
            </p>
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. Orion Explorer"
              disabled={naming}
              style={{
                width: '100%',
                padding: '0.7rem 1rem',
                borderRadius: 10,
                border: '1px solid rgba(79,124,255,0.4)',
                background: 'rgba(255,255,255,0.06)',
                color: '#fff',
                fontSize: '1rem',
                boxSizing: 'border-box',
                marginBottom: '0.8rem',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  void handleSetName();
                }
              }}
            />
            <button
              type="button"
              onClick={handleSetName}
              disabled={naming || !nameInput.trim()}
              style={{
                width: '100%',
                padding: '0.8rem',
                border: 'none',
                borderRadius: 12,
                background: naming ? 'rgba(255,255,255,.15)' : '#5b8cff',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: 900,
                cursor: naming ? 'wait' : 'pointer',
              }}
            >
              {naming ? 'SAVING...' : 'START GAME'}
            </button>
            {nameError && (
              <p style={{ color: '#ff6b6b', marginTop: '0.8rem', fontSize: '0.85rem' }}>
                {nameError}
              </p>
            )}
          </div>
        </div>
      )}

      <LevelBadge
        level={activePlayer.level}
        experience={0}
      />

      <ResourceBar />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <PlayerIsland
          level={activePlayer.level}
          resources={
            gameState?.resources ?? {}
          }
          inventory={
            gameState?.inventory?.map(
              (item) => ({
                id: item.id,
                quantity: item.quantity,
              })
            ) ?? []
          }
        />
      </div>
    </div>
  );
}
