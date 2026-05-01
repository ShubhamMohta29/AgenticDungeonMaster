'use client'

import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-900 bg-[url('/background.png')] bg-cover bg-center text-center text-white">
      <div className="rounded-xl border border-emerald-500/30 bg-gray-900/80 p-8 shadow-2xl backdrop-blur-md max-w-md w-full">
        <h2 className="mb-4 text-4xl font-bold text-emerald-500 shadow-black drop-shadow-md">404 - Lost in the Woods</h2>
        <p className="mb-8 text-gray-300">
          You step into the clearing, but the path you seek does not exist. Your map must be outdated.
        </p>
        <Button
          onClick={() => window.location.href = '/dashboard'}
          variant="primary"
        >
          Return to Tavern
        </Button>
      </div>
    </div>
  )
}
