import type { Character } from '@/types/character'

export function getModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

export function getProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1
}

export const SKILL_ABILITY_MAP: Record<string, keyof Character['ability_scores']> = {
  acrobatics:      'dex',
  animal_handling: 'wis',
  arcana:          'int',
  athletics:       'str',
  deception:       'cha',
  history:         'int',
  insight:         'wis',
  intimidation:    'cha',
  investigation:   'int',
  medicine:        'wis',
  nature:          'int',
  perception:      'wis',
  performance:     'cha',
  persuasion:      'cha',
  religion:        'int',
  sleight_of_hand: 'dex',
  stealth:         'dex',
  survival:        'wis',
}

export function getSkillModifier(character: Character, skill: string): number {
  const ability = SKILL_ABILITY_MAP[skill]
  if (!ability) return 0
  const base = getModifier(character.ability_scores[ability])
  const proficient = character.skills[skill]
  const expert = character.skills[`${skill}_expertise`]
  if (expert)     return base + character.proficiency_bonus * 2
  if (proficient) return base + character.proficiency_bonus
  return base
}

export function getSavingThrowModifier(character: Character, ability: string): number {
  const base = getModifier(character.ability_scores[ability as keyof Character['ability_scores']])
  const proficient = character.saving_throws[ability]
  return proficient ? base + character.proficiency_bonus : base
}

export function getPassivePerception(character: Character): number {
  return 10 + getSkillModifier(character, 'perception')
}

export function getInitiativeBonus(character: Character): number {
  return getModifier(character.ability_scores.dex)
}