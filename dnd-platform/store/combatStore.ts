// combatStore: owns encounter state only.
// None of the narrative UI needs to re-render when turn order ticks.

import { create } from 'zustand'
import type { CombatEncounter } from '@/types/combat'

interface CombatState {
  encounter: CombatEncounter | null
  setEncounter: (encounter: CombatEncounter | null) => void
}

export const useCombatStore = create<CombatState>((set) => ({
  encounter:    null,
  setEncounter: (encounter) => set({ encounter })
}))
