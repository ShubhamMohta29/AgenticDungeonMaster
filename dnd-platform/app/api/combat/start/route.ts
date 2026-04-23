import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabaseServer'
import type { Combatant } from '@/types/combat'

export async function POST(req: NextRequest) {
  try {
    const { campaignId, monsterNames } = await req.json()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: characters } = await supabaseAdmin
      .from('characters')
      .select('*')
      .eq('campaign_id', campaignId)

    // Dynamic import to avoid module resolution issues
    const { buildCombatants } = await import('@/lib/combatEngine')
    const turnOrder = buildCombatants(characters || [], monsterNames)

    const { data: encounter } = await supabaseAdmin
      .from('combat_encounters')
      .insert({
        campaign_id: campaignId,
        status: 'active',
        round: 1,
        turn_order: turnOrder,
        current_turn_index: 0,
        monsters: monsterNames.map((name: string) => ({ name })),
        loot_table: []
      })
      .select()
      .single()

    await supabaseAdmin.from('messages').insert({
      campaign_id: campaignId,
      type: 'system',
      content: `⚔️ Combat begins! Initiative order: ${turnOrder.map((c: Combatant) => `${c.name} (${c.initiative})`).join(', ')}. Round 1.`
    })

    return NextResponse.json({ encounter })
  } catch (error) {
    console.error('Combat start error:', error)
    return NextResponse.json({ error: 'Failed to start combat' }, { status: 500 })
  }
}