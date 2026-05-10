'use client'
import { useEffect, useCallback, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useGameStore } from '@/store/gameStore'
import type { Character } from '@/types/character'
import type { CombatEncounter } from '@/types/combat'
import type { Message } from '@/types/message'

import { StoryLog } from '@/components/game/StoryLog'
import { ActionPanel } from '@/components/game/ActionPanel'
import { CharacterPanel } from '@/components/character/CharacterPanel'
import { InitiativeTracker } from '@/components/game/InitiativeTracker'
import { DiceLog } from '@/components/game/DiceLog'

export default function PlayPage() {
  const params = useParams()
  const campaignId = params.id as string

  const [error, setError] = useState<string | null>(null)
  const [retryIn, setRetryIn] = useState<number | null>(null)

  const {
    setCampaign, setCharacters, setMyCharacter,
    addMessage, setEncounter,
    updateCharacter, setDMThinking,
    setMessages
  } = useGameStore()

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        console.log('Fetching campaign data for:', campaignId)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          console.warn('No authenticated user found in PlayPage')
          return
        }

        const [campaignRes, charactersRes, messagesRes] = await Promise.all([
          supabase.from('campaigns').select('*').eq('id', campaignId).single(),
          supabase.from('characters').select('*').eq('campaign_id', campaignId),
          supabase.from('messages').select('*').eq('campaign_id', campaignId)
            .order('created_at', { ascending: false }).limit(50)
        ])

        if (campaignRes.error) console.error('Campaign load error:', campaignRes.error)
        if (charactersRes.error) console.error('Characters load error:', charactersRes.error)
        if (messagesRes.error) console.error('Messages load error:', messagesRes.error)

        if (campaignRes.data) {
          console.log('Campaign loaded:', campaignRes.data.name)
          setCampaign(campaignRes.data)
        }

        if (charactersRes.data) {
          console.log('Characters loaded:', charactersRes.data.length)
          setCharacters(charactersRes.data)
          const mine = charactersRes.data.find(c => c.user_id === user.id)
          if (mine) {
            console.log('User character found:', mine.name)
            setMyCharacter(mine)
          } else {
            console.warn('No character found for current user in this campaign')
          }
        }

        if (messagesRes.data) {
          console.log('Messages loaded:', messagesRes.data.length)
          // Reverse them so they are in chronological order for display
          setMessages([...messagesRes.data].reverse())
        }
      } catch (err) {
        console.error('Failed to load initial game data:', err)
      }
    }

    loadData()
  }, [campaignId, setCampaign, setCharacters, setMyCharacter, setMessages])

  // Retry timer countdown
  useEffect(() => {
    if (retryIn === null || retryIn <= 0) return
    const timer = setInterval(() => {
      setRetryIn(prev => (prev && prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [retryIn])

  // Realtime subscriptions
  useEffect(() => {
    const messagesSub = supabase
      .channel(`messages:${campaignId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `campaign_id=eq.${campaignId}`
      }, payload => {
        addMessage(payload.new as Message)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const { data } = await supabase
            .from('messages')
            .select('*')
            .eq('campaign_id', campaignId)
            .order('created_at', { ascending: false })
            .limit(50)
          if (data) setMessages([...data].reverse())
        }
      })

    const charactersSub = supabase
      .channel(`characters:${campaignId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'characters',
        filter: `campaign_id=eq.${campaignId}`
      }, payload => {
        updateCharacter(payload.new.id, payload.new as Partial<Character>)
      })
      .subscribe()

    const combatSub = supabase
      .channel(`combat:${campaignId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'combat_encounters',
        filter: `campaign_id=eq.${campaignId}`
      }, payload => {
        if (payload.eventType === 'DELETE') {
          setEncounter(null)
        } else {
          setEncounter(payload.new as CombatEncounter)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(messagesSub)
      supabase.removeChannel(charactersSub)
      supabase.removeChannel(combatSub)
    }
  }, [campaignId, addMessage, updateCharacter, setEncounter, setMessages])

  const handleAction = useCallback(async (action: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { myCharacter } = useGameStore.getState()

    setError(null)
    setRetryIn(null)
    setDMThinking(true)
    
    try {
      const response = await fetch('/api/dm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          action,
          characterId: myCharacter?.id
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'The Dungeon Master is currently overwhelmed.')
        if (response.status === 429 && data.retryAfter) {
          setRetryIn(data.retryAfter)
        }
        return
      }

    } catch (error) {
      console.error('Action failed:', error)
      setError('Connection lost. Please check your internet.')
    } finally {
      setDMThinking(false)
    }
  }, [campaignId, setDMThinking])


  return (
    <div className="relative h-screen w-full overflow-hidden flex">
      {/* Background Image is handled by body in globals.css */}

      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
        <div className="pointer-events-auto">
          <InitiativeTracker />
        </div>
      </div>

      {/* Left Sidebar: Dice Log */}
      <div className="relative z-20 h-full hidden lg:block">
        <DiceLog />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 pb-32 pt-20 custom-scrollbar">
          <div className="max-w-4xl mx-auto">
            <StoryLog />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-30">
          {error && (
            <div className="max-w-xl mx-auto mb-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 p-4 rounded-2xl flex items-center gap-3 shadow-2xl">
                <span className="text-xl">⚠️</span>
                <div className="flex-1">
                  <p className="text-red-100 text-sm font-medium">{error}</p>
                  {retryIn !== null && retryIn > 0 && (
                    <p className="text-red-200/60 text-[10px] uppercase tracking-widest mt-1 font-bold">
                      Available again in {retryIn}s
                    </p>
                  )}
                </div>
                <button 
                  onClick={() => setError(null)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors text-red-200/40 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
          <ActionPanel onAction={handleAction} />
        </div>
      </div>

      {/* Sidebar */}
      <div className="relative z-20 h-full">
        <CharacterPanel />
      </div>
    </div>
  )
}