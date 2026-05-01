'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-900 bg-[url('/background.png')] bg-cover bg-center text-center text-white">
      <div className="rounded-xl border border-red-500/30 bg-gray-900/80 p-8 shadow-2xl backdrop-blur-md max-w-md w-full">
        <h2 className="mb-4 text-3xl font-bold text-red-500 shadow-black drop-shadow-md">A Critical Failure!</h2>
        <p className="mb-8 text-gray-300">
          Something went wrong behind the DM screen. Don't worry, even gods make mistakes.
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => reset()}
            variant="primary"
          >
            Try Again
          </Button>
          <Button
            onClick={() => window.location.href = '/dashboard'}
            variant="secondary"
          >
            Return to Tavern
          </Button>
        </div>
      </div>
    </div>
  )
}
