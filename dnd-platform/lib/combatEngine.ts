import { rollDice } from './dice'
import { getModifier, getSavingThrowModifier } from './dnd5e/abilities'
import { getConditionEffects, addCondition, removeCondition } from './dnd5e/conditions'
import { getMonster } from './dnd5e/monsters'
import type { Combatant, Monster, ActionResult, TurnAction, Condition, DamageType } from '@/types/combat'
import type { Character } from '@/types/character'

export function buildCombatants(
  characters: Character[],
  monsterNames: string[]
): Combatant[] {
  const combatants: Combatant[] = []

  // Add player characters
  for (const char of characters) {
    const initRoll = rollDice('1d20')
    const dexMod = getModifier(char.ability_scores.dex)
    combatants.push({
      id: char.id,
      name: char.name,
      type: 'player',
      initiative: initRoll.total + dexMod,
      hp: char.hp,
      max_hp: char.max_hp,
      ac: char.ac,
      speed: char.speed,
      conditions: char.conditions as Condition[],
      character_id: char.id,
      has_acted: false,
      has_bonus_action: false,
      has_reaction: true
    })
  }

  // Add monsters
  for (const name of monsterNames) {
    const monster = getMonster(name)
    if (!monster) continue
    const initRoll = rollDice('1d20')
    const dexMod = getModifier(monster.ability_scores.dex)
    combatants.push({
      id: `monster_${name}_${Date.now()}_${Math.random()}`,
      name: monster.name,
      type: 'monster',
      initiative: initRoll.total + dexMod,
      hp: monster.hp,
      max_hp: monster.max_hp,
      ac: monster.ac,
      speed: monster.speed,
      conditions: [],
      has_acted: false,
      has_bonus_action: false,
      has_reaction: true
    })
  }

  // Sort by initiative descending (ties are not further broken)
  return combatants.sort((a, b) => b.initiative - a.initiative)
}

export function resolveAttack(
  attacker: Combatant,
  target: Combatant,
  attackBonus: number,
  damageDice: string,
): ActionResult {
  const attackerEffects = getConditionEffects(attacker.conditions)
  const targetEffects = getConditionEffects(target.conditions)

  let rollResult: number
  const d20a = Math.floor(Math.random() * 20) + 1
  const d20b = Math.floor(Math.random() * 20) + 1

  if (attackerEffects.attackRollDisadvantage && !attackerEffects.attackRollAdvantage) {
    rollResult = Math.min(d20a, d20b)
  } else if (attackerEffects.attackRollAdvantage || targetEffects.attacksAgainstAdvantage) {
    rollResult = Math.max(d20a, d20b)
  } else {
    rollResult = d20a
  }

  const isCrit = rollResult === 20
  const total = rollResult + attackBonus

  if (rollResult === 1) {
    return { success: false, description: `${attacker.name} critically misses!`, roll: rollResult, events: [] }
  }

  if (isCrit || total >= target.ac) {
    const damageRoll = rollDice(damageDice)
    const diceOnly = damageRoll.rolls.reduce((a, b) => a + b, 0)
    const damage = isCrit
      ? diceOnly + rollDice(damageDice).total
      : damageRoll.total

    return {
      success: true,
      description: isCrit
        ? `${attacker.name} critically hits ${target.name} for ${damage} damage!`
        : `${attacker.name} hits ${target.name} for ${damage} damage. (Roll: ${total} vs AC ${target.ac})`,
      damage,
      roll: rollResult,
      events: [`${target.name} takes ${damage} damage`]
    }
  }

  return {
    success: false,
    description: `${attacker.name} misses ${target.name}. (Roll: ${total} vs AC ${target.ac})`,
    roll: rollResult,
    events: []
  }
}

export function applyDamage(
  target: Combatant,
  amount: number,
  monsters: Monster[],
  damageType?: DamageType
): { updatedTarget: Combatant; isDead: boolean } {
  const monster = monsters.find(m => m.name === target.name)

  // Check immunities for the specific damage type
  let finalDamage = amount
  if (damageType && monster?.damage_immunities?.includes(damageType)) {
    finalDamage = 0
  }

  const newHp = Math.max(0, target.hp - finalDamage)
  const isDead = newHp === 0

  const updatedTarget: Combatant = {
    ...target,
    hp: newHp,
    conditions: isDead && target.type === 'monster'
      ? [...target.conditions]
      : isDead
        ? addCondition(target.conditions, 'unconscious')
        : target.conditions
  }

  return { updatedTarget, isDead }
}

export function applyHealing(target: Combatant, amount: number): Combatant {
  return {
    ...target,
    hp: Math.min(target.max_hp, target.hp + amount),
    conditions: removeCondition(target.conditions, 'unconscious')
  }
}

export function advanceTurn(
  turnOrder: Combatant[],
  currentIndex: number
): { nextIndex: number; newRound: boolean; updatedTurnOrder: Combatant[] } {
  const nextIndex = (currentIndex + 1) % turnOrder.length
  const newRound = nextIndex === 0

  // Reset actions for the next combatant (immutable)
  const updatedTurnOrder = [...turnOrder]
  updatedTurnOrder[nextIndex] = {
    ...updatedTurnOrder[nextIndex],
    has_acted: false,
    has_bonus_action: false,
    has_reaction: true
  }

  return { nextIndex, newRound, updatedTurnOrder }
}

export function checkCombatEnd(turnOrder: Combatant[]): {
  ended: boolean
  winner: 'players' | 'monsters' | null
} {
  const alivePlayers  = turnOrder.filter(c => c.type === 'player'  && c.hp > 0)
  const aliveMonsters = turnOrder.filter(c => c.type === 'monster' && c.hp > 0)

  if (aliveMonsters.length === 0) return { ended: true,  winner: 'players'  }
  if (alivePlayers.length  === 0) return { ended: true,  winner: 'monsters' }
  return { ended: false, winner: null }
}

export function getCurrentCombatant(
  turnOrder: Combatant[],
  index: number
): Combatant | null {
  return turnOrder[index] || null
}

export function isPlayerTurn(
  turnOrder: Combatant[],
  index: number,
  characterId: string
): boolean {
  const current = turnOrder[index]
  return current?.type === 'player' && current?.character_id === characterId
}