import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getAuthenticatedUser } from '@/lib/supabaseServer'
import { buildCombatants } from '@/lib/combatEngine'
import type { Combatant } from '@/types/combat'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(req: NextRequest) {
  try {
    const { campaignId, monsterNames } = await req.json()

    if (!campaignId || !UUID_REGEX.test(campaignId)) {
      return NextResponse.json({ error: 'Invalid campaignId' }, { status: 400 })
    }
    if (!Array.isArray(monsterNames) || monsterNames.length === 0 ||
        monsterNames.some((n: unknown) => typeof n !== 'string' || !n.trim())) {
      return NextResponse.json({ error: 'monsterNames must be a non-empty array of strings' }, { status: 400 })
    }

    const user = await getAuthenticatedUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify user is a member of this campaign
    const { data: membership } = await supabaseAdmin
      .from('campaign_members')
      .select('id')
      .eq('campaign_id', campaignId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this campaign' }, { status: 403 })
    }

    const { data: characters } = await supabaseAdmin
      .from('characters')
      .select('*')
      .eq('campaign_id', campaignId)

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