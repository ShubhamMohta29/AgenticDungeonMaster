'use client'
import { useState } from 'react'
import { MONSTERS } from '@/lib/dnd5e/monsters'
import { supabase } from '@/lib/supabase'
import { useGameStore } from '@/store/gameStore'

type Tool = 'monsters' | 'notes' | 'xp' | 'map'

export interface DMToolboxProps {
  campaignId: string
  characters: { id: string; name: string; xp: number }[]
}

export const DMToolbox = ({ campaignId, characters }: DMToolboxProps) => {
  const [activeTool, setActiveTool] = useState<Tool>('monsters')
  const [monsterSearch, setMonsterSearch] = useState('')
  const [selectedMonster, setSelectedMonster] = useState('')
  const [notes, setNotes] = useState('')
  const [xpAmount, setXpAmount] = useState('')
  const [xpSent, setXpSent] = useState(false)
  const [mapBg, setMapBg] = useState('')

  const { campaign } = useGameStore()
  const mapState = campaign?.world_state?.map

  const filteredMonsters = Object.keys(MONSTERS).filter(name =>
    name.toLowerCase().includes(monsterSearch.toLowerCase())
  )

  async function awardXP() {
    const amount = parseInt(xpAmount)
    if (!amount || isNaN(amount)) return

    await fetch('/api/dm-console/narrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignId,
        content: `⭐ The DM awards ${amount} XP to the party!`
      })
    })

    setXpAmount('')
    setXpSent(true)
    setTimeout(() => setXpSent(false), 2000)
  }
  async function initMap() {
    if (!campaign) return
    const newWorldState = {
      ...campaign.world_state,
      map: { gridSize: 20, tokens: [], backgroundUrl: mapBg || undefined }
    }
    await supabase.from('campaigns').update({ world_state: newWorldState }).eq('id', campaign.id)
  }

  async function updateMapBg() {
    if (!campaign || !mapState) return
    const newWorldState = { ...campaign.world_state, map: { ...mapState, backgroundUrl: mapBg || undefined } }
    await supabase.from('campaigns').update({ world_state: newWorldState }).eq('id', campaign.id)
  }

  async function clearMap() {
    if (!campaign) return
    const newWorldState = { ...campaign.world_state }
    delete newWorldState.map
    await supabase.from('campaigns').update({ world_state: newWorldState }).eq('id', campaign.id)
  }

  async function addToken(id: string, name: string, isPlayer: boolean, color: string) {
    if (!campaign || !mapState) return
    const newTokens = [...(mapState.tokens || []), { id: `${id}-${Date.now()}`, x: 0, y: 0, name, color, isPlayer }]
    const newWorldState = { ...campaign.world_state, map: { ...mapState, tokens: newTokens } }
    await supabase.from('campaigns').update({ world_state: newWorldState }).eq('id', campaign.id)
  }

  const tools: { id: Tool; label: string }[] = [
    { id: 'monsters', label: 'Monsters' },
    { id: 'map',      label: '🗺 Map' },
    { id: 'xp',       label: 'XP' },
    { id: 'notes',    label: 'Notes' },
  ]

  return (
    <div>
      <div className="flex gap-1 mb-3">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`flex-1 text-xs py-1.5 rounded-lg border transition-colors ${
              activeTool === tool.id
                ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {tool.label}
          </button>
        ))}
      </div>

      {activeTool === 'monsters' && (
        <div className="space-y-2">
          <input
            value={monsterSearch}
            onChange={e => setMonsterSearch(e.target.value)}
            placeholder="Search monsters..."
            className="w-full text-sm px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
          />
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {filteredMonsters.map(name => {
              const m = MONSTERS[name]
              return (
                <button
                  key={name}
                  onClick={() => setSelectedMonster(selectedMonster === name ? '' : name)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-900 dark:text-gray-100">{name}</p>
                    <p className="text-xs text-gray-400">CR {m.cr}</p>
                  </div>
                  {selectedMonster === name && (
                    <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                      <p>HP: {m.hp} · AC: {m.ac} · Speed: {m.speed}ft</p>
                      <p>XP: {m.xp}</p>
                      <p>Attacks: {m.attacks.map(a => `${a.name} (+${a.bonus}, ${a.damage})`).join(', ')}</p>
                      {m.special_abilities && (
                        <p>Special: {m.special_abilities.map(a => a.name).join(', ')}</p>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {activeTool === 'xp' && (
        <div className="space-y-3">
          <p className="text-xs text-gray-400">Award XP to the entire party</p>
          <div className="flex gap-2">
            <input
              value={xpAmount}
              onChange={e => setXpAmount(e.target.value)}
              placeholder="Amount"
              type="number"
              className="flex-1 text-sm px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
            />
            <button
              onClick={awardXP}
              disabled={!xpAmount}
              className="px-3 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
            >
              {xpSent ? '✓' : 'Award'}
            </button>
          </div>
          <div className="space-y-1">
            {[50, 100, 200, 500, 1000].map(amount => (
              <button
                key={amount}
                onClick={() => setXpAmount(String(amount))}
                className="text-xs px-2 py-1 rounded border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 mr-1"
              >
                +{amount}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTool === 'notes' && (
        <div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Private DM notes — only you can see these..."
            rows={6}
            className="w-full text-sm px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">Notes are saved locally only.</p>
        </div>
      )}

      {activeTool === 'map' && (
        <div className="space-y-4">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Live Map Controls</p>
          
          {!mapState ? (
            <div className="space-y-2">
              <input
                value={mapBg}
                onChange={e => setMapBg(e.target.value)}
                placeholder="Background Map Image URL (optional)"
                className="w-full text-sm px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                onClick={initMap}
                className="w-full px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Initialize Map Grid
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  value={mapBg}
                  onChange={e => setMapBg(e.target.value)}
                  placeholder="Update bg URL..."
                  className="flex-1 text-sm px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
                />
                <button
                  onClick={updateMapBg}
                  className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:brightness-95 transition-colors"
                >
                  Set
                </button>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-2">Add Player Tokens</p>
                <div className="flex flex-wrap gap-2">
                  {characters.map(c => (
                    <button
                      key={c.id}
                      onClick={() => addToken(c.id, c.name, true, '#10b981')}
                      className="text-xs px-3 py-1.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800/60 border border-emerald-200 dark:border-emerald-800/50 transition-colors"
                    >
                      + {c.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-2">Add Monster Tokens</p>
                <div className="flex gap-2">
                  <select
                    onChange={e => setSelectedMonster(e.target.value)}
                    value={selectedMonster}
                    className="flex-1 text-sm px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
                  >
                    <option value="">Select monster...</option>
                    {Object.keys(MONSTERS).map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => selectedMonster && addToken(selectedMonster, selectedMonster, false, '#ef4444')}
                    className="px-3 py-1.5 text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-800/60 border border-red-200 dark:border-red-800/50 transition-colors disabled:opacity-50"
                    disabled={!selectedMonster}
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={clearMap}
                  className="w-full px-3 py-2 text-sm border border-red-200 dark:border-red-800/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  Destroy Map & Clear Tokens
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}