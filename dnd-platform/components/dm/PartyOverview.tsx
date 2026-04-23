'use client'
import { useGameStore } from '@/store/gameStore'
import { HPBar } from '@/components/ui/HPBar'
import { Badge } from '@/components/ui/Badge'

export function PartyOverview() {
  const { characters } = useGameStore()

  if (characters.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-4">No characters yet.</p>
  }

  return (
    <div className="space-y-3">
      {characters.map(char => (
        <div
          key={char.id}
          className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {char.name}
              </p>
              <p className="text-xs text-gray-400">
                {char.race} {char.class} · Level {char.level}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">AC {char.ac}</p>
              <p className="text-xs text-gray-400">{char.xp} XP</p>
            </div>
          </div>

          <HPBar current={char.hp} max={char.max_hp} height="h-2" />

          {char.conditions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {char.conditions.map(c => (
                <Badge key={c} color="red">{c}</Badge>
              ))}
            </div>
          )}

          {/* Ability scores mini */}
          <div className="grid grid-cols-6 gap-1 mt-2">
            {Object.entries(char.ability_scores).map(([ability, score]) => {
              const mod = Math.floor((score - 10) / 2)
              return (
                <div key={ability} className="text-center">
                  <p className="text-xs text-gray-400 uppercase">{ability}</p>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {mod >= 0 ? '+' : ''}{mod}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}