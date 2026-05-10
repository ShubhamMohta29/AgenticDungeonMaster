'use client'
import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { Button } from '@/components/ui/Button'
import type { AbilityScores } from '@/types/character'

interface DiceRollModalProps {
  onRollComplete: (result: number, success: boolean) => void
}

const SKILL_TO_ABILITY: Record<string, keyof AbilityScores> = {
  // Strength
  Athletics: 'str',
  // Dexterity
  Acrobatics: 'dex',
  'Sleight of Hand': 'dex',
  Stealth: 'dex',
  // Intelligence
  Arcana: 'int',
  History: 'int',
  Investigation: 'int',
  Nature: 'int',
  Religion: 'int',
  // Wisdom
  'Animal Handling': 'wis',
  Insight: 'wis',
  Medicine: 'wis',
  Perception: 'wis',
  Survival: 'wis',
  // Charisma
  Deception: 'cha',
  Intimidation: 'cha',
  Performance: 'cha',
  Persuasion: 'cha',
}

export function DiceRollModal({ onRollComplete }: DiceRollModalProps) {
  const { pendingRollRequest, setPendingRollRequest, myCharacter } = useGameStore()
  const [rolling, setRolling] = useState(false)
  const [result, setResult] = useState<{ roll: number; total: number; success: boolean } | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!pendingRollRequest) return null

  function computeModifier(): number {
    if (!myCharacter) return 0
    const scores = myCharacter.ability_scores
    const profBonus = myCharacter.proficiency_bonus

    function abilityMod(ability: string): number {
      const score = scores[ability as keyof typeof scores]
      return score !== undefined ? Math.floor((score - 10) / 2) : 0
    }

    if (pendingRollRequest!.type === 'skill') {
      const skillName = pendingRollRequest!.skill ?? ''
      const ability = SKILL_TO_ABILITY[skillName]
      if (!ability) return 0
      const mod = abilityMod(ability)
      const proficient = myCharacter.skills[skillName] === true
      return mod + (proficient ? profBonus : 0)
    }

    if (pendingRollRequest!.type === 'saving_throw') {
      const ability = pendingRollRequest!.ability ?? ''
      const mod = abilityMod(ability)
      const proficient = myCharacter.saving_throws[ability] === true
      return mod + (proficient ? profBonus : 0)
    }

    // 'ability' or 'attack'
    const ability = pendingRollRequest!.ability ?? ''
    return abilityMod(ability)
  }

  async function handleRoll() {
    setRolling(true)
    setError(null)
    try {
      const response = await fetch('/api/dice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notation: '1d20' })
      })
      const data = await response.json()
      const roll = data.rolls[0]
      const modifier = computeModifier()
      const total = roll + modifier
      const success = pendingRollRequest?.dc ? total >= pendingRollRequest.dc : true

      setResult({ roll, total, success })
    } catch {
      setError('Dice roll failed. Please try again.')
    }
    setRolling(false)
  }

  function handleConfirm() {
    if (!result) return
    onRollComplete(result.total, result.success)
    setResult(null)
    setPendingRollRequest(null)
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="glass rounded-2xl p-8 w-full max-w-sm text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
          {pendingRollRequest.type.replace('_', ' ')}
        </p>
        <h2 className="text-xl font-semibold text-white mb-1">
          {pendingRollRequest.skill || pendingRollRequest.ability || 'Roll'}
        </h2>
        {pendingRollRequest.dc && (
          <p className="text-sm text-gray-400 mb-6">DC {pendingRollRequest.dc}</p>
        )}

        {error ? (
          <div className="space-y-4">
            <p className="text-sm text-red-400">{error}</p>
            <Button onClick={handleRoll} variant="primary" className="w-full">
              Retry
            </Button>
          </div>
        ) : !result ? (
          <button
            onClick={handleRoll}
            disabled={rolling}
            className="w-24 h-24 rounded-2xl bg-amber-main/20 text-amber-highlight text-4xl mx-auto flex items-center justify-center hover:bg-amber-main/30 transition-colors disabled:animate-pulse border border-amber-main/30"
          >
            🎲
          </button>
        ) : (
          <div className="space-y-4">
            <div className={`w-24 h-24 rounded-2xl mx-auto flex items-center justify-center text-4xl font-bold ${
              result.success
                ? 'bg-green-500/20 text-green-300'
                : 'bg-red-500/20 text-red-300'
            }`}>
              {result.roll}
            </div>
            <p className="text-sm text-gray-300">
              Roll {result.roll} + modifier = <strong className="text-white">{result.total}</strong>
              {pendingRollRequest.dc && ` vs DC ${pendingRollRequest.dc}`}
            </p>
            <p className={`text-lg font-bold ${result.success ? 'text-green-600' : 'text-red-600'}`}>
              {result.success ? 'Success!' : 'Failure'}
            </p>
            <Button onClick={handleConfirm} variant="primary" className="w-full">
              Continue
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}