import { CLASSES } from './classes'
import { getModifier } from './abilities'
import type { Character } from '@/types/character'

export const XP_THRESHOLDS = [
  0, 300, 900, 2700, 6500, 14000,
  23000, 34000, 48000, 64000, 85000,
  100000, 120000, 140000, 165000, 195000,
  225000, 265000, 305000, 355000
]

export function getLevelFromXP(xp: number): number {
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]) return i + 1
  }
  return 1
}

export function xpForNextLevel(level: number): number | null {
  if (level >= 20) return null
  return XP_THRESHOLDS[level]
}

export function calculateMaxHp(cls: string, level: number, conScore: number): number {
  const classDef = CLASSES[cls]
  if (!classDef) return 8
  const conMod = getModifier(conScore)
  const firstLevel = classDef.hitDie + conMod
  const avgPerLevel = Math.floor(classDef.hitDie / 2) + 1 + conMod
  return firstLevel + (avgPerLevel * (level - 1))
}

export function checkLevelUp(character: Character): number | null {
  const newLevel = getLevelFromXP(character.xp)
  if (newLevel > character.level) return newLevel
  return null
}

export function getSpellSlots(cls: string, level: number): Record<string, number> {
  const fullCasters = ['Wizard', 'Cleric', 'Druid', 'Bard', 'Sorcerer']
  const halfCasters = ['Paladin', 'Ranger']

  if (fullCasters.includes(cls)) {
    const table: Record<number, number[]> = {
      1:  [2,0,0,0,0,0,0,0,0],
      2:  [3,0,0,0,0,0,0,0,0],
      3:  [4,2,0,0,0,0,0,0,0],
      4:  [4,3,0,0,0,0,0,0,0],
      5:  [4,3,2,0,0,0,0,0,0],
    }
    const slots = table[Math.min(level, 5)] || table[5]
    return Object.fromEntries(slots.map((s, i) => [i + 1, s]).filter(([,v]) => v > 0))
  }

  if (halfCasters.includes(cls)) {
    if (level < 2) return {}
    const halfLevel = Math.floor(level / 2)
    return getSpellSlots('Wizard', halfLevel)
  }

  if (cls === 'Warlock') {
    const warlockSlots: Record<number, number> = { 1:1, 2:2, 3:2, 4:2, 5:3 }
    const slotLevel = level <= 2 ? 1 : level <= 4 ? 2 : 3
    return { [slotLevel]: warlockSlots[Math.min(level, 5)] || 3 }
  }

  return {}
}