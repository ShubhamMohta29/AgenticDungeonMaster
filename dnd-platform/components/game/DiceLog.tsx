'use client'
import { useEffect, useRef } from 'react'
import { useGameStore } from '@/store/gameStore'
import type { Message } from '@/types/message'

function DiceRollItem({ message }: { message: Message }) {
  const metadata = message.metadata as any
  const total = metadata?.total ?? '?'
  const rolls = metadata?.rolls?.[0] ?? '?'
  const modifier = metadata?.modifier ?? 0
  const dc = metadata?.dc
  const success = metadata?.success
  const purpose = metadata?.purpose || 'Roll'

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-3 rounded-xl mb-3 animate-fadeIn transition-all hover:bg-white/10 group">
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[9px] uppercase tracking-wider text-amber-highlight/70 font-bold">{purpose}</span>
          {success !== undefined && (
            <span className={`text-[8px] px-1.5 py-0.5 rounded-full uppercase font-bold tracking-tighter ${
              success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {success ? 'Success' : 'Failure'}
            </span>
          )}
        </div>
        
        <div className="flex items-end justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-white group-hover:text-amber-highlight transition-colors leading-none">{total}</span>
            <span className="text-[10px] text-white/40 font-mono">({rolls} + {modifier})</span>
          </div>
          {dc && (
            <div className="text-right">
              <span className="text-[8px] text-white/30 uppercase block leading-none">Target DC</span>
              <span className="text-xs font-bold text-white/60">{dc}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function DiceLog() {
  const { messages } = useGameStore()
  const diceRolls = messages.filter(m => m.type === 'dice_roll')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [diceRolls])

  return (
    <div className="w-64 h-full glass border-r border-white/10 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-white/10 bg-black/20">
        <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white/70 flex items-center gap-2">
          <span className="text-amber-highlight">🎲</span> Dice History
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {diceRolls.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-[10px] uppercase tracking-widest text-white/20 text-center font-medium">
              No rolls yet
            </p>
          </div>
        ) : (
          diceRolls.map(roll => (
            <DiceRollItem key={roll.id} message={roll} />
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
