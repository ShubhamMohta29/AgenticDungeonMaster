import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabaseServer'

export async function POST(req: NextRequest) {
  try {
    const { name, setting, dmMode } = await req.json()

    // Get the authenticated user
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Use admin client to bypass RLS
    const { data: campaign, error } = await supabaseAdmin
      .from('campaigns')
      .insert({
        name,
        setting,
        dm_mode: dmMode,
        dm_user_id: dmMode === 'human' ? user.id : null,
        current_scene: 'The adventure begins...',
        world_state: {}
      })
      .select()
      .single()

    if (error) {
      console.error('Campaign insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Add creator as member
    await supabaseAdmin.from('campaign_members').insert({
      campaign_id: campaign.id,
      user_id: user.id
    })

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('Create campaign error:', error)
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
  }
}