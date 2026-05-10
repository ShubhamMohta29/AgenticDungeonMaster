'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all group relative overflow-hidden"
      aria-label="Toggle Theme"
    >
      <div className="flex items-center gap-2">
        {theme === 'dark' ? (
          <>
            <span className="text-amber-highlight text-lg">☀️</span>
            <span className="text-[10px] uppercase tracking-widest text-white/50 font-bold group-hover:text-white transition-colors">Light Mode</span>
          </>
        ) : (
          <>
            <span className="text-amber-highlight text-lg">🌙</span>
            <span className="text-[10px] uppercase tracking-widest text-black/50 font-bold group-hover:text-black transition-colors">Dark Mode</span>
          </>
        )}
      </div>
      
      {/* Glossy effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </button>
  )
}
