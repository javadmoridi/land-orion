import { create } from 'zustand';

// ===========================================================================
// Orion Incubator store.
//
// Level 1 for now: a single egg slot. Structured so we can later add:
//   * more levels            -> level increases,
//   * more egg slots         -> slots grows,
//   * hatch timers           -> each slot gets an startedAt / hatchDuration,
//   * Orion hatch system     -> a hatch() action.
// ===========================================================================

export interface IncubatorSlot {
  id: number;
  /** Egg inventory id currently placed in this slot (empty string = free). */
  eggId: string;
  /** When the egg was placed (ISO) — reserved for the timer system. */
  placedAt: string | null;
}

export const INCUBATOR_LEVEL_1_SLOTS = 1;

interface IncubatorStoreState {
  /** Incubator level (starts at 1). */
  level: number;
  slots: IncubatorSlot[];

  // Actions
  /** Place an egg (by inventory id) into the given slot. */
  placeEgg: (slotId: number, eggId: string) => boolean;
  /** Remove / take out the egg from a slot. */
  removeEgg: (slotId: number) => void;
  /** Reset to a fresh Level 1 machine. */
  reset: () => void;
}

function createSlots(count: number): IncubatorSlot[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    eggId: '',
    placedAt: null,
  }));
}

export const useIncubatorStore = create<IncubatorStoreState>((set, get) => ({
  level: 1,
  slots: createSlots(INCUBATOR_LEVEL_1_SLOTS),

  placeEgg: (slotId, eggId) => {
    if (!eggId) return false;
    const { slots } = get();
    const slot = slots.find((s) => s.id === slotId);
    if (!slot || slot.eggId) return false; // slot must exist and be free

    set({
      slots: slots.map((s) =>
        s.id === slotId ? { ...s, eggId, placedAt: new Date().toISOString() } : s,
      ),
    });
    return true;
  },

  removeEgg: (slotId) => {
    set({
      slots: get().slots.map((s) =>
        s.id === slotId ? { ...s, eggId: '', placedAt: null } : s,
      ),
    });
  },

  reset: () => {
    set({ level: 1, slots: createSlots(INCUBATOR_LEVEL_1_SLOTS) });
  },
}));
