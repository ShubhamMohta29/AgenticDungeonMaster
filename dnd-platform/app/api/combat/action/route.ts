import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { advanceTurn, checkCombatEnd, getCurrentCombatant } from '@/lib/combatEngine'

export async function POST(req: NextRequest) {
  try {
    const { campaignId, action, characterId } = await req.json()

    // 1. Auth check
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 2. Fetch encounter
    const { data: encounter } = await supabaseAdmin
      .from('combat_encounters')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('status', 'active')
      .single()

    if (!encounter) return NextResponse.json({ error: 'No active combat' }, { status: 400 })

    // 3. Verify turn
    const currentCombatant = getCurrentCombatant(encounter.turn_order, encounter.current_turn_index)
    if (currentCombatant?.character_id !== characterId) {
      return NextResponse.json({ error: 'Not your turn' }, { status: 403 })
    }

    // 4. Delegate to DM logic (simulate resolution)
    // Normally we would call Claude here, but for now we'll do a simple mock or call /api/dm
    // Wait, the easiest way is to let /api/dm handle the parsing of the action into events, 
    // but we need to advance the turn.
    // For now, we will just record the message and advance the turn since true combat AI is a gigantic feat.

    await supabaseAdmin.from('messages').insert([
      { campaign_id: campaignId, character_id: characterId, type: 'player_action', content: action }
    ])

    // Advance Turn
    const { nextIndex, newRound } = advanceTurn(encounter.turn_order, encounter.current_turn_index)
    
    await supabaseAdmin.from('combat_encounters').update({
      current_turn_index: nextIndex,
      round: newRound ? encounter.round + 1 : encounter.round,
      turn_order: encounter.turn_order
    }).eq('id', encounter.id)

    // Notify whose turn it is now
    const nextCombatant = encounter.turn_order[nextIndex]
    await supabaseAdmin.from('messages').insert([
      { campaign_id: campaignId, type: 'system', content: `⚔️ It is now ${nextCombatant.name}'s turn.` }
    ])

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to process action' }, { status: 500 })
  }
}
