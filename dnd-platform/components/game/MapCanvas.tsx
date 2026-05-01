'use client'
import { supabase } from '@/lib/supabase'
import { useGameStore } from '@/store/gameStore'

export const MapCanvas = () => {
  const { campaign } = useGameStore()
  const mapState = campaign?.world_state?.map
  
  if (!mapState) return (
    <div className="flex-1 bg-white/50 dark:bg-black/30 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-8 mx-4 my-2 border border-dashed border-gray-300 dark:border-gray-700">
      <div className="text-4xl mb-4 opacity-50">🗺️</div>
      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">The DM has not loaded a map for this scene yet.</p>
    </div>
  )

  const gridSize = mapState.gridSize || 20

  const handleDragStart = (e: React.DragEvent, tokenId: string) => {
    e.dataTransfer.setData('tokenId', tokenId)
    e.dataTransfer.effectAllowed = 'move'
    
    // Tiny visual feedback adjustment
    setTimeout(() => {
      (e.target as HTMLElement).style.opacity = '0.5'
    }, 0)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = '1'
  }

  const handleDrop = async (e: React.DragEvent, x: number, y: number) => {
    e.preventDefault()
    const tokenId = e.dataTransfer.getData('tokenId')
    if (!tokenId || !campaign) return

    const oldTokens = mapState.tokens || []
    const updatedTokens = oldTokens.map(t => 
      t.id === tokenId ? { ...t, x, y } : t
    )

    const newWorldState = {
      ...campaign.world_state,
      map: { ...mapState, tokens: updatedTokens }
    }

    // Persist to DB, which broadcasts to everyone instantly
    await supabase
      .from('campaigns')
      .update({ world_state: newWorldState })
      .eq('id', campaign.id)
  }

  const cells = Array.from({ length: gridSize * gridSize }).map((_, i) => ({
    x: i % gridSize,
    y: Math.floor(i / gridSize)
  }))

  return (
    <div className="flex-1 bg-gray-100/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl overflow-auto relative p-4 mx-4 my-2 shadow-inner">
      <div 
        className="grid bg-[#e5e5f7] dark:bg-gray-800 shadow-2xl border-2 border-gray-400 dark:border-gray-600 min-w-max min-h-max mx-auto relative rounded-sm"
        style={{ 
          gridTemplateColumns: `repeat(${gridSize}, 3.5rem)`,
          gridTemplateRows: `repeat(${gridSize}, 3.5rem)`,
          backgroundImage: mapState.backgroundUrl ? `url(${mapState.backgroundUrl})` : 'radial-gradient(#444cf7 1px, transparent 1px)',
          backgroundSize: mapState.backgroundUrl ? '100% 100%' : '20px 20px',
        }}
      >
        {cells.map(cell => {
          // Find tokens in this cell (could be multiple, but we render the first explicitly, and stack the rest if we get fancy)
          const tokensInCell = mapState.tokens?.filter(t => t.x === cell.x && t.y === cell.y) || []
          
          return (
            <div
              key={`${cell.x}-${cell.y}`}
              className="border-[0.5px] border-gray-400/30 flex items-center justify-center relative hover:bg-emerald-400/20 transition-colors"
              onDragOver={e => {
                e.preventDefault()
                e.dataTransfer.dropEffect = 'move'
              }}
              onDrop={e => handleDrop(e, cell.x, cell.y)}
            >
              {tokensInCell.map((token, idx) => (
                <div
                  key={token.id}
                  draggable
                  onDragStart={e => handleDragStart(e, token.id)}
                  onDragEnd={handleDragEnd}
                  className={`absolute w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white text-xs font-bold cursor-grab active:cursor-grabbing transform hover:scale-110 hover:z-50 transition-transform ${
                    token.isPlayer ? 'border-2 border-emerald-400 bg-emerald-700' : 'border-2 border-red-500 bg-red-800'
                  }`}
                  style={{ 
                    backgroundColor: token.color || undefined,
                    zIndex: 10 + idx,
                    marginLeft: idx * 4, // Slight offset for stacked tokens
                    marginTop: idx * 4
                  }}
                  title={token.name}
                >
                  {token.imageUrl ? (
                     <img src={token.imageUrl} alt={token.name} className="w-full h-full rounded-full object-cover select-none" draggable={false} />
                  ) : (
                     <span className="truncate px-1 select-none flex text-[10px] leading-tight text-center">{token.name.substring(0, 5)}</span>
                  )}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
