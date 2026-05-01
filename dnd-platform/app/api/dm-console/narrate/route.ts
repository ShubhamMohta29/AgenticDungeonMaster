import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { supabaseAdmin } from '@/lib/supabaseServer'

export async function POST(req: NextRequest) {
  try {
    const { campaignId, content, targetCharacterId } = await req.json()

    // Auth validation
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify user is DM
    const { data: campaign } = await supabaseAdmin
      .from('campaigns')
      .select('dm_user_id')
      .eq('id', campaignId)
      .single()
    
    if (campaign?.dm_user_id !== user.id) {
      return NextResponse.json({ error: 'Not the DM' }, { status: 403 })
    }

    // Insert narration
    const { data: message, error } = await supabaseAdmin
      .from('messages')
      .insert({
        campaign_id: campaignId,
        character_id: targetCharacterId || null,
        type: 'narration',
        content,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, message })

  } catch (error) {
    console.error('Narrate error:', error)
    return NextResponse.json({ error: 'Failed to save narration' }, { status: 500 })
  }
}
