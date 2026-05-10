import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getAuthenticatedUser } from '@/lib/supabaseServer'
import { applyEvents } from '@/lib/gameEventApplier'
import { callGroq } from '@/lib/groq'
import { parseGameEvents } from '@/lib/gameEvents'
import { buildDMSystemPrompt } from '@/lib/systemPrompt'
import { getContextForDM, shouldSummarize, summarizeSession } from '@/lib/worldMemory'
import { resolveRollRequest } from '@/lib/dice'


export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { campaignId, action, characterId } = body

    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!campaignId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (typeof action !== 'string' || action.length > 2000) {
      return NextResponse.json({ error: 'Action must be a string under 2000 characters' }, { status: 400 })
    }
    if (!UUID_REGEX.test(campaignId)) {
      return NextResponse.json({ error: 'Invalid campaignId' }, { status: 400 })
    }
    if (characterId && !UUID_REGEX.test(characterId)) {
      return NextResponse.json({ error: 'Invalid characterId' }, { status: 400 })
    }

    const user = await getAuthenticatedUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: membership } = await supabaseAdmin
      .from('campaign_members')
      .select('id')
      .eq('campaign_id', campaignId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this campaign' }, { status: 403 })
    }

    const [
      { data: campaign },
      { data: characters },
      { data: npcs },
      { data: quests },
      dmContext
    ] = await Promise.all([
      supabaseAdmin.from('campaigns').select('*').eq('id', campaignId).single(),
      supabaseAdmin.from('characters').select('*').eq('campaign_id', campaignId),
      supabaseAdmin.from('npcs').select('*').eq('campaign_id', campaignId),
      supabaseAdmin.from('quests').select('*').eq('campaign_id', campaignId),
      getContextForDM(campaignId)
    ])

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const systemPrompt = buildDMSystemPrompt({
      campaign,
      characters: characters || [],
      npcs: npcs || [],
      quests: quests || [],
      memorySummary: dmContext.latestSummary
    })

    const messageHistory = dmContext.recentMessages.map(m => ({
      role: (m.type === 'player_action' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: m.content
    }))

    messageHistory.push({ role: 'user', content: action })

    const response = await callGroq({
      system: systemPrompt,
      messages: messageHistory,
      maxTokens: 1000
    })

    const { narration, events, rollRequests } = parseGameEvents(response.content)

    // Handle automated dice rolls
    if (rollRequests && rollRequests.length > 0) {
      for (const rollReq of rollRequests) {
        // Find the character for the roll
        const char = (characters || []).find(c => 
          c.name.toLowerCase() === rollReq.character.toLowerCase() || 
          c.id === rollReq.character
        )
        
        if (char) {
          const result = resolveRollRequest(rollReq, char as any)
          
          // Create a dice roll message
          await supabaseAdmin.from('messages').insert({
            campaign_id: campaignId,
            character_id: char.id,
            type: 'dice_roll',
            content: `${char.name} rolled for ${result.purpose || 'a check'}`,
            metadata: result
          })
          
          console.log(`Automated roll for ${char.name}: ${result.total} (${result.purpose})`)
        }
      }
    }


    await supabaseAdmin.from('messages').insert({
      campaign_id: campaignId,
      character_id: characterId || null,
      type: 'player_action',
      content: action
    })

    const { data: savedMessage } = await supabaseAdmin
      .from('messages')
      .insert({
        campaign_id: campaignId,
        character_id: null,
        type: 'narration',
        content: narration,
        metadata: { events, rollRequests }
      })
      .select()
      .single()

    await applyEvents(events, campaignId, characters || [])

    const needsSummary = await shouldSummarize(campaignId)
    if (needsSummary) {
      summarizeSession(campaignId, dmContext.recentMessages).catch(console.error)
    }

    return NextResponse.json({
      narration,
      events,
      rollRequests,
      messageId: savedMessage?.id
    })

  } catch (error) {
    console.error('DM API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

