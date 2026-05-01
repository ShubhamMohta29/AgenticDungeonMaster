/**
 * Backward-compatibility barrel.
 * Existing components importing from '@/store/gameStore' continue to work unchanged.
 * Prefer importing from the specific stores directly in new code:
 *   - '@/store/campaignStore'  — campaign, characters, messages
 *   - '@/store/combatStore'    — encounter state
 *   - '@/store/uiStore'        — loading flags, dice roll UI
 */
export { useCampaignStore } from './campaignStore'
export { useCombatStore }   from './combatStore'
export { useUIStore }       from './uiStore'
export type { RollRequest } from './uiStore'

// Convenience hook that merges all three stores — matches the old useGameStore API.
// Components already using useGameStore() will continue to work.
import { useCampaignStore } from './campaignStore'
import { useCombatStore }   from './combatStore'
import { useUIStore }       from './uiStore'

export function useGameStore() {
  const campaign  = useCampaignStore()
  const combat    = useCombatStore()
  const ui        = useUIStore()
  return { ...campaign, ...combat, ...ui }
}