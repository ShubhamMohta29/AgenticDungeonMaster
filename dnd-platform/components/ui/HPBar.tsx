interface HPBarProps {
  current: number
  max: number
  showNumbers?: boolean
  height?: string
}

export function HPBar({ current, max, showNumbers = true, height = 'h-2' }: HPBarProps) {
  const pct = Math.max(0, Math.min(100, Math.round((current / max) * 100)))
  const color = pct > 50 ? 'bg-green-500' : pct > 25 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 bg-gray-200 dark:bg-gray-700 rounded-full ${height} overflow-hidden`}>
        <div
          className={`${height} ${color} rounded-full transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showNumbers && (
        <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[48px] text-right">
          {current}/{max}
        </span>
      )}
    </div>
  )
}