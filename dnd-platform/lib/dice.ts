export interface DiceRoll {
  rolls: number[]
  modifier: number
  total: number
  notation: string
}

export interface CheckResult {
  roll: number
  modifier: number
  total: number
  dc: number
  success: boolean
}

export function rollDice(notation: string): DiceRoll {
  const match = notation.match(/(\d+)d(\d+)([+-]\d+)?/)
  if (!match) throw new Error(`Invalid dice notation: ${notation}`)

  const count = parseInt(match[1])
  const sides = parseInt(match[2])
  const modifier = parseInt(match[3] || '0')

  const rolls = Array.from({ length: count }, () =>
    Math.floor(Math.random() * sides) + 1
  )

  return {
    rolls,
    modifier,
    total: rolls.reduce((a, b) => a + b, 0) + modifier,
    notation
  }
}

export function rollWithAdvantage(): { rolls: [number, number]; result: number } {
  const a = Math.floor(Math.random() * 20) + 1
  const b = Math.floor(Math.random() * 20) + 1
  return { rolls: [a, b], result: Math.max(a, b) }
}

export function rollWithDisadvantage(): { rolls: [number, number]; result: number } {
  const a = Math.floor(Math.random() * 20) + 1
  const b = Math.floor(Math.random() * 20) + 1
  return { rolls: [a, b], result: Math.min(a, b) }
}

export function rollAbilityScores(): number[] {
  // 4d6 drop lowest, 6 times
  return Array.from({ length: 6 }, () => {
    const rolls = Array.from({ length: 4 }, () =>
      Math.floor(Math.random() * 6) + 1
    )
    rolls.sort((a, b) => a - b)
    return rolls.slice(1).reduce((a, b) => a + b, 0)
  })
}

export function rollDeathSave(): {
  roll: number
  result: 'critical_success' | 'success' | 'failure' | 'critical_failure'
} {
  const roll = Math.floor(Math.random() * 20) + 1
  if (roll === 20) return { roll, result: 'critical_success' }
  if (roll === 1)  return { roll, result: 'critical_failure' }
  if (roll >= 10)  return { roll, result: 'success' }
  return { roll, result: 'failure' }
}