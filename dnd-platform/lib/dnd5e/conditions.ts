import type { Condition } from '@/types/combat'

export interface ConditionEffect {
  attackRollDisadvantage?: boolean
  attackRollAdvantage?: boolean
  attacksAgainstAdvantage?: boolean
  attacksAgainstDisadvantage?: boolean
  speedZero?: boolean
  cannotAct?: boolean
  autoFailStrDex?: boolean
  criticalHitWithin5ft?: boolean
  description: string
}

export const CONDITION_EFFECTS: Record<Condition, ConditionEffect> = {
  blinded: {
    attackRollDisadvantage: true,
    attacksAgainstAdvantage: true,
    description: 'Cannot see. Attack rolls have disadvantage, attacks against have advantage.'
  },
  charmed: {
    description: 'Cannot attack the charmer. Charmer has advantage on social checks.'
  },
  deafened: {
    description: 'Cannot hear. Auto-fails hearing-based checks.'
  },
  exhaustion: {
    description: 'Cumulative penalties. 6 levels = death.'
  },
  frightened: {
    attackRollDisadvantage: true,
    description: 'Disadvantage on checks while source is visible. Cannot move toward source.'
  },
  grappled: {
    speedZero: true,
    description: 'Speed becomes 0.'
  },
  incapacitated: {
    cannotAct: true,
    description: 'Cannot take actions or reactions.'
  },
  invisible: {
    attackRollAdvantage: true,
    attacksAgainstDisadvantage: true,
    description: 'Cannot be seen. Attack rolls have advantage, attacks against have disadvantage.'
  },
  paralyzed: {
    cannotAct: true,
    autoFailStrDex: true,
    attacksAgainstAdvantage: true,
    criticalHitWithin5ft: true,
    description: 'Incapacitated. Auto-fail STR/DEX saves. Attacks within 5ft are critical hits.'
  },
  petrified: {
    cannotAct: true,
    autoFailStrDex: true,
    description: 'Incapacitated. Resistance to all damage. Immune to poison and disease.'
  },
  poisoned: {
    attackRollDisadvantage: true,
    description: 'Disadvantage on attack rolls and ability checks.'
  },
  prone: {
    attackRollDisadvantage: true,
    description: 'Disadvantage on attacks. Attacks within 5ft have advantage. Half movement to stand.'
  },
  restrained: {
    speedZero: true,
    attackRollDisadvantage: true,
    attacksAgainstAdvantage: true,
    description: 'Speed 0. Disadvantage on attacks. Attacks against have advantage.'
  },
  stunned: {
    cannotAct: true,
    autoFailStrDex: true,
    attacksAgainstAdvantage: true,
    description: 'Incapacitated. Auto-fail STR/DEX saves. Attacks against have advantage.'
  },
  unconscious: {
    cannotAct: true,
    autoFailStrDex: true,
    attacksAgainstAdvantage: true,
    criticalHitWithin5ft: true,
    speedZero: true,
    description: 'Incapacitated and prone. Auto-fail STR/DEX saves. Attacks within 5ft are crits.'
  }
}

export function hasCondition(conditions: Condition[], condition: Condition): boolean {
  return conditions.includes(condition)
}

export function addCondition(conditions: Condition[], condition: Condition): Condition[] {
  if (hasCondition(conditions, condition)) return conditions
  return [...conditions, condition]
}

export function removeCondition(conditions: Condition[], condition: Condition): Condition[] {
  return conditions.filter(c => c !== condition)
}

export function getConditionEffects(conditions: Condition[]): ConditionEffect {
  const combined: ConditionEffect = { description: '' }
  for (const condition of conditions) {
    const effect = CONDITION_EFFECTS[condition]
    if (effect.attackRollDisadvantage) combined.attackRollDisadvantage = true
    if (effect.attackRollAdvantage)    combined.attackRollAdvantage = true
    if (effect.attacksAgainstAdvantage) combined.attacksAgainstAdvantage = true
    if (effect.speedZero)              combined.speedZero = true
    if (effect.cannotAct)              combined.cannotAct = true
    if (effect.autoFailStrDex)         combined.autoFailStrDex = true
    if (effect.criticalHitWithin5ft)   combined.criticalHitWithin5ft = true
  }
  return combined
}