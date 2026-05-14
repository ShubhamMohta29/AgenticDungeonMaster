'use client'
import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'

interface Props {
  onRollComplete: (result: number, success: boolean) => void
}

export function DiceRollModal({ onRollComplete }: Props) {
  const { pendingRollRequest, setPendingRollRequest } = useGameStore()
  const [rolled, setRolled] = useState<number | null>(null)

  if (!pendingRollRequest) return null

  const rollLabel =
    pendingRollRequest.skill ||
    pendingRollRequest.ability ||
    pendingRollRequest.type

  function handleRoll() {
    const result = Math.floor(Math.random() * 20) + 1
    setRolled(result)
  }

  function handleConfirm() {
    if (rolled === null) return
    const success = pendingRollRequest!.dc ? rolled >= pendingRollRequest!.dc : true
    setPendingRollRequest(null)
    setRolled(null)
    onRollComplete(rolled, success)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="glass rounded-2xl p-8 w-80 text-center">
        <p className="text-xs text-foreground/50 uppercase tracking-widest mb-1">Roll Required</p>
        <p className="text-lg font-bold text-amber-highlight capitalize mb-1">{rollLabel}</p>
        {pendingRollRequest.dc && (
          <p className="text-sm text-foreground/60 mb-4">DC {pendingRollRequest.dc}</p>
        )}

        {rolled !== null ? (
          <>
            <div className="text-6xl font-bold text-amber-highlight my-6">{rolled}</div>
            <button onClick={handleConfirm} className="btn-amber w-full rounded-xl py-2 font-semibold">
              Confirm
            </button>
          </>
        ) : (
          <button onClick={handleRoll} className="btn-amber w-full rounded-xl py-3 text-lg font-semibold mt-4">
            Roll d20
          </button>
        )}
      </div>
    </div>
  )
}
