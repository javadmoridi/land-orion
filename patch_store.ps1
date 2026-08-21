$f = 'src/game/useGameStore.ts'
$c = [System.IO.File]::ReadAllText($f)

$old = "// ================================================================\n      // DISCONNECT\n      // ================================================================"

$new = @"
      // ================================================================
      // SET PLAYER PROFILE
      // ================================================================

      setPlayerProfile: (profile) => {
        set({
          playerProfile: profile,
        });
      },

      // ================================================================
      // LOAD GAME BY NAME
      // ================================================================

      loadGameByName: async (name) => {
        const trimmed = name.trim();
        if (!trimmed) {
          return false;
        }

        const localSave = loadLocalGameSave("name-" + trimmed);
        if (localSave) {
          set({
            playerProfile: localSave.playerProfile,
            gameState: localSave.gameState,
            playerPosition: localSave.playerPosition ?? {
              x: 5,
              y: 5,
            },
            worldTiles:
              localSave.worldTiles ?? createWorldTiles(),
            saveStatus: 'saved',
            lastSavedAt:
              localSave.savedAt ?? null,
          });
          return true;
        }

        if (typeof window !== 'undefined') {
          const raw = window.localStorage.getItem(
            saveKeyFor("name-" + trimmed)
          );
          if (raw) {
            try {
              const parsed = JSON.parse(raw) as Partial<LocalGameSave>;
              set({
                playerProfile:
                  parsed.playerProfile ?? null,
                gameState:
                  parsed.gameState ?? null,
                playerPosition:
                  parsed.playerPosition ?? {
                    x: 5,
                    y: 5,
                  },
                worldTiles: Array.isArray(parsed.worldTiles)
                  ? parsed.worldTiles
                  : createWorldTiles(),
                saveStatus: 'saved',
                lastSavedAt:
                  typeof parsed.savedAt === 'string'
                    ? parsed.savedAt
                    : null,
              });
              return true;
            } catch {
              return false;
            }
          }
        }
        return false;
      },

|@|
"@

$new = $new -replace '\|@\|', "// ================================================================\n      // DISCONNECT\n      // ================================================================"

if ($c.Contains($old)) {
    [System.IO.File]::WriteAllText($f, $c.Replace($old, $new))
    Write-Host "OK: inserted"
} else {
    Write-Host "NOT FOUND"
}