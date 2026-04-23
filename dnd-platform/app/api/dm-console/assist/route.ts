import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { callClaudeHaiku } from '@/lib/claude'

export async function POST(req: NextRequest) {
  try {
    const { campaignId, prompt } = await req.json()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: campaign } = await supabaseAdmin
      .from('campaigns')
      .select('setting, current_scene, world_state')
      .eq('id', campaignId)
      .single()

    const { data: characters } = await supabaseAdmin
      .from('characters')
      .select('name, class, level, hp, max_hp')
      .eq('campaign_id', campaignId)

    const system = `You are a D&D assistant helping a human Dungeon Master run a ${campaign?.setting || 'fantasy'} campaign.
Current scene: ${campaign?.current_scene || 'Unknown'}
Party: ${characters?.map(c => `${c.name} (${c.class} ${c.level}, HP: ${c.hp}/${c.max_hp})`).join(', ') || 'None'}
Be concise and practical. Give direct, usable suggestions the DM can immediately apply.`

    const response = await callClaudeHaiku({
      system,
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 400
    })

    return NextResponse.json({ suggestion: response.content })
  } catch (error) {
    console.error('Assist error:', error)
    return NextResponse.json({ error: 'Failed to get suggestion' }, { status: 500 })
  }
}