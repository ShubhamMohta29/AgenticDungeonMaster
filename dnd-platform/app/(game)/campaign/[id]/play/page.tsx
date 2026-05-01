'use client'
import { useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useGameStore } from '@/store/gameStore'
import { useCampaignStore } from '@/store/campaignStore'
import { useCombatStore } from '@/store/combatStore'
import { StoryLog } from '@/components/game/StoryLog'
import { ActionPanel } from '@/components/game/ActionPanel'
import { CharacterPanel } from '@/components/character/CharacterPanel'
import { InitiativeTracker } from '@/components/game/InitiativeTracker'
import { DiceRollModal } from '@/components/game/DiceRollModal'
import { MapCanvas } from '@/components/game/MapCanvas'
import { useToastStore } from '@/store/toastStore'

export default function PlayPage() {
  const params = useParams()
  const campaignId = params.id as string

  const {
    setCampaign, setCharacters, setMyCharacter,
    setMessages, addMessage, setEncounter,
    updateCharacter, setDMThinking, setPendingRollRequest
  } = useGameStore()

  // Load initial data
  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [campaignRes, charactersRes, messagesRes] = await Promise.all([
        supabase.from('campaigns').select('*').eq('id', campaignId).single(),
        supabase.from('characters').select('*').eq('campaign_id', campaignId),
        supabase.from('messages').select('*').eq('campaign_id', campaignId)
          .order('created_at', { ascending: true }).limit(50)
      ])

      if (campaignRes.data) setCampaign(campaignRes.data)
      if (charactersRes.data) {
        setCharacters(charactersRes.data)
        const mine = charactersRes.data.find(c => c.user_id === user.id)
        if (mine) setMyCharacter(mine)
      }
      if (messagesRes.data) setMessages(messagesRes.data)
    }

    loadData()
  }, [campaignId, setCampaign, setCharacters, setMyCharacter, setMessages])

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
        const msg = payload.new as any;
        addMessage(msg as never)

        if (msg.type === 'narration' && msg.metadata?.events) {
           msg.metadata.events.forEach((evt: any) => {
              if (evt.type === 'xp') useToastStore.getState().addToast({ type: 'xp', title: 'XP Awarded', message: `Party earned ${evt.data.amount} XP!` })
              else if (evt.type === 'loot') useToastStore.getState().addToast({ type: 'loot', title: 'Loot Discovered', message: `${evt.data.target} found ${evt.data.quantity}x ${evt.data.item}!` })
              else if (evt.type === 'pay') useToastStore.getState().addToast({ type: 'pay', title: 'Payment', message: `${evt.data.target} paid ${evt.data.quantity}x ${evt.data.item}.` })
           })
        }
      })
      .subscribe()

    const campaignsSub = supabase
      .channel(`campaigns:${campaignId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'campaigns',
        filter: `id=eq.${campaignId}`
      }, payload => {
        setCampaign(payload.new as never)
      })
      .subscribe()

    const charactersSub = supabase
      .channel(`characters:${campaignId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'characters',
        filter: `campaign_id=eq.${campaignId}`
      }, payload => {
        updateCharacter(payload.new.id, payload.new)
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
        setEncounter(payload.new as never)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(messagesSub)
      supabase.removeChannel(charactersSub)
      supabase.removeChannel(combatSub)
      supabase.removeChannel(campaignsSub)
    }
  }, [campaignId, addMessage, updateCharacter, setEncounter, setCampaign])

  const handleAction = useCallback(async (action: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { myCharacter } = useCampaignStore.getState()

    setDMThinking(true)
    try {
      const isCombatMode = useCombatStore.getState().encounter?.status === 'active'
      const endpoint = isCombatMode ? '/api/combat/action' : '/api/dm'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          action,
          characterId: myCharacter?.id
        })
      })

      const data = await response.json()

      if (data.rollRequests?.length > 0) {
        setPendingRollRequest(data.rollRequests[0])
      }
    } catch (error) {
      console.error('Action failed:', error)
    } finally {
      setDMThinking(false)
    }
  }, [campaignId, setDMThinking, setPendingRollRequest])

  async function handleRollComplete(result: number, success: boolean) {
    await handleAction(
      `I rolled a ${result} — ${success ? 'success' : 'failure'}.`
    )
  }

  return (
    <div className="flex flex-col h-screen bg-transparent">
      <InitiativeTracker />
      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
            <StoryLog />
            {useCampaignStore.getState().campaign?.world_state?.map && <MapCanvas />}
          </div>
          <ActionPanel onAction={handleAction} />
        </div>
        <CharacterPanel />
      </div>
      <DiceRollModal onRollComplete={handleRollComplete} />
    </div>
  )
}