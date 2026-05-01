// uiStore: transient UI state (loading flags, dice roll modals).
// Isolating this means a dice roll re-render never cascades to character panels.

import { create } from 'zustand'

interface RollResult {
  roll: number
  total: number
  dc?: number
  success: boolean
  type: string
}

export interface RollRequest {
  character: string
  type: 'skill' | 'saving_throw' | 'attack' | 'ability'
  skill?: string
  ability?: string
  dc?: number
  target?: string
}

interface UIState {
  isLoading: boolean
  isDMThinking: boolean
  pendingRollRequest: RollRequest | null
  isRollModalOpen: boolean
  lastRollResult: RollResult | null

  setLoading:            (loading: boolean) => void
  setDMThinking:         (thinking: boolean) => void
  setPendingRollRequest: (roll: RollRequest | null) => void
  setRollModalOpen:      (open: boolean) => void
  setLastRollResult:     (result: RollResult | null) => void
}

export const useUIStore = create<UIState>((set) => ({
  isLoading:          false,
  isDMThinking:       false,
  pendingRollRequest: null,
  isRollModalOpen:    false,
  lastRollResult:     null,

  setLoading:            (isLoading)          => set({ isLoading }),
  setDMThinking:         (isDMThinking)       => set({ isDMThinking }),
  setPendingRollRequest: (pendingRollRequest) => set({ pendingRollRequest }),
  setRollModalOpen:      (isRollModalOpen)    => set({ isRollModalOpen }),
  setLastRollResult:     (lastRollResult)     => set({ lastRollResult })
}))
