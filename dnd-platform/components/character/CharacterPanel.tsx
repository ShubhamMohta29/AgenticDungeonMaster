'use client'
import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { HPBar } from '@/components/ui/HPBar'
import { Badge } from '@/components/ui/Badge'
import { CharacterSheet } from './CharacterSheet'

export function CharacterPanel() {
  const { myCharacter, lastRollResult } = useGameStore()
  const [showSheet, setShowSheet] = useState(false)
  const [isOpenMobile, setIsOpenMobile] = useState(false)

  if (!myCharacter) return null

  const conditionColors: Record<string, 'red' | 'amber' | 'purple' | 'gray'> = {
    poisoned: 'red', unconscious: 'red', paralyzed: 'red',
    frightened: 'amber', stunned: 'amber', restrained: 'amber',
    invisible: 'purple', charmed: 'purple',
  }

  const PanelContent = () => (
    <div className="flex flex-col gap-4">
      {/* Character header */}
      <div>
        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-lg mb-2">
          {myCharacter.name.charAt(0)}
        </div>
        <p className="font-medium text-gray-900 dark:text-gray-100">{myCharacter.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {myCharacter.race} {myCharacter.class} · Level {myCharacter.level}
        </p>
      </div>

      {/* HP */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>Hit Points</span>
          <span>{myCharacter.hp}/{myCharacter.max_hp}</span>
        </div>
        <HPBar current={myCharacter.hp} max={myCharacter.max_hp} showNumbers={false} height="h-3" />
        {myCharacter.temp_hp > 0 && (
          <p className="text-xs text-blue-500 mt-1">+{myCharacter.temp_hp} temp HP</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'AC',    value: myCharacter.ac },
          { label: 'Speed', value: `${myCharacter.speed}ft` },
          { label: 'Prof',  value: `+${myCharacter.proficiency_bonus}` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
            <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{value}</p>
          </div>
        ))}
      </div>

      {/* XP */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>XP</span>
          <span>{myCharacter.xp}</span>
        </div>
      </div>

      {/* Conditions */}
      {myCharacter.conditions.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Conditions</p>
          <div className="flex flex-wrap gap-1">
            {myCharacter.conditions.map(condition => (
              <Badge
                key={condition}
                color={conditionColors[condition] || 'gray'}
              >
                {condition}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Ability scores */}
      <div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Ability Scores</p>
        <div className="grid grid-cols-3 gap-1.5">
          {Object.entries(myCharacter.ability_scores).map(([ability, score]) => {
            const mod = Math.floor((score - 10) / 2)
            return (
              <div key={ability} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-1.5 text-center">
                <p className="text-xs text-gray-400 uppercase">{ability}</p>
                <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{score}</p>
                <p className="text-xs text-gray-500">{mod >= 0 ? '+' : ''}{mod}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Inline Dice Result */}
      {lastRollResult && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-3 animate-fadeIn">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-2 uppercase tracking-wider">{lastRollResult.type} Roll</p>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold shadow-sm ${lastRollResult.success ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 border border-red-200 dark:border-red-800'}`}>
              {lastRollResult.roll}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900 dark:text-gray-100 flex items-baseline gap-1">
                Total: <strong className="text-lg">{lastRollResult.total}</strong>
              </p>
              {lastRollResult.dc && <p className="text-xs text-gray-500 dark:text-gray-400">vs DC {lastRollResult.dc}</p>}
              <p className={`text-sm font-bold mt-0.5 ${lastRollResult.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                {lastRollResult.success ? 'Success!' : 'Failure'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Full sheet button */}
      <button
        onClick={() => setShowSheet(true)}
        className="text-sm py-2 px-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 rounded-lg text-center font-medium mt-2"
      >
        View full character sheet →
      </button>
    </div>
  )

  return (
    <>
      <button 
        className="md:hidden fixed bottom-24 right-4 w-12 h-12 bg-emerald-600 rounded-full text-white shadow-lg shadow-emerald-600/30 z-40 flex items-center justify-center text-xl"
        onClick={() => setIsOpenMobile(true)}
      >
        <span>👤</span>
      </button>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 flex flex-col justify-end backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 w-full max-h-[85vh] rounded-t-3xl flex flex-col p-6 overflow-y-auto relative shadow-2xl">
            <button onClick={() => setIsOpenMobile(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">
              ✕
            </button>
            <PanelContent /> 
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex w-72 border-l border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm p-5 flex-col overflow-y-auto">
        <PanelContent />
      </div>

      {showSheet && (
        <CharacterSheet
          character={myCharacter}
          onClose={() => setShowSheet(false)}
        />
      )}
    </>
  )
}