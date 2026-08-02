# Land-Orion — Web3 TON Game

A real TON-native Web3 login system using **TON Connect** official UI and **Supabase** as the backend.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

## 🔑 Environment Variables

Create a `.env` file (copy from `.env.example`):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

> ⚠️ Until real Supabase credentials are provided, the app falls back to `localStorage` ONLY for local development. Once `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set to real values, every player must be persisted in Supabase.

## 🗄️ Supabase Setup

1. Create a new Supabase project.
2. Open **SQL Editor** and run the contents of [`supabase/schema.sql`](supabase/schema.sql).
   This creates:
   - `players` table — keyed by TON `wallet_address`
   - `saves` table — full game snapshots (player_data jsonb)
   - RLS policies that allow a player to read/write **only their own row** (matched via `wallet_address` = custom header `x-wallet-address`).

> The RLS policies in `schema.sql` are the recommended security baseline. For production, consider enabling real TON Connect `ton_proof` verification on your backend before trusting the `wallet_address` claim.

## 💳 TON Connect

- Uses the official [`@tonconnect/ui-react`](https://www.npmjs.com/package/@tonconnect/ui-react) package.
- Only TON wallets (Tonkeeper, Tonhub, etc.) are supported.
- No EVM / Ethereum / MetaMask / Wagmi code remains.
- Manifest lives at `public/tonconnect-manifest.json`.

## 🎮 Login Flow

1. User opens the app → sees only the **Wallet Connection Screen**.
2. User clicks **Connect TON Wallet** → official TON Connect modal opens.
3. User connects Tonkeeper (or any TON wallet) → real wallet address returned.
4. App checks Supabase `players` table by `wallet_address`:
   - **Existing player** → loads level, experience, resources, inventory, land, buildings, game progress, and stats.
   - **New wallet** → creates a fresh player profile, saves it, and enters the game.
5. Player enters the game world.

## 💾 Save System

- **Manual Save button** in the game world.
- **Auto Save every 3 seconds**.
- Persists to Supabase:
  - `players` table → player profile (`level`, `experience`, `inventory`, `land`, `game_state`, etc.)
  - `saves` table → full `player_data` snapshot (upserted by `player_id`)

## 📂 Project Structure

```
├── .env.example          # Environment template
├── public/
│   └── tonconnect-manifest.json
├── src/
│   ├── backend/
│   │   ├── supabaseClient.ts    # Supabase client + types
│   │   └── supabaseService.ts   # Real CRUD against Supabase
│   ├── blockchain/
│   │   └── tonService.ts
│   ├── wallet/
│   │   ├── WalletConnectionScreen.tsx  # TON Connect UI only (no manual address)
│   │   └── walletService.ts
│   ├── game/
│   │   ├── GameWorld.tsx        # Auto-save every 3s + manual Save button
│   │   └── useGameStore.ts      # Zustand store (connect/load/save/disconnect)
│   ├── player/
│   │   ├── PlayerDashboard.tsx
│   │   └── playerService.ts
│   └── ...
└── supabase/
    └── schema.sql               # Tables + RLS policies