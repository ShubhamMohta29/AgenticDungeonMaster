import { supabaseAdmin } from './supabaseServer'
import { callGroqFast } from './groq'
import type { Message } from '@/types/message'
import type { WorldState } from '@/types/campaign'

const MAX_RECENT_MESSAGES = 10
const SUMMARIZE_AFTER = 20

export interface DMContext {
  recentMessages: Message[]
  latestSummary: string
  worldState: WorldState
}

export async function getContextForDM(campaignId: string): Promise<DMContext> {
  const [
    { data: messages },
    { data: summaries },
    { data: campaign, error: campErr }
  ] = await Promise.all([
    supabaseAdmin
      .from('messages')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })
      .limit(MAX_RECENT_MESSAGES),
    supabaseAdmin
      .from('world_memory_summaries')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })
      .limit(1),
    supabaseAdmin
      .from('campaigns')
      .select('world_state')
      .eq('id', campaignId)
      .single()
  ])

  if (campErr) throw new Error(`Failed to fetch campaign context: ${campErr.message}`)

  return {
    recentMessages: [...(messages || [])].reverse(),
    latestSummary: summaries?.[0]?.content || '',
    worldState: campaign?.world_state || {}
  }
}

export async function shouldSummarize(campaignId: string): Promise<boolean> {
  const { data: lastSummaryRows } = await supabaseAdmin
    .from('world_memory_summaries')
    .select('message_range_end, created_at')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false })
    .limit(1)

  const lastSummary = lastSummaryRows?.[0] ?? null

  const { count, data: recentMessages } = await supabaseAdmin
    .from('messages')
    .select('created_at', { count: 'exact' })
    .eq('campaign_id', campaignId)
    .eq('type', 'narration')
    .order('created_at', { ascending: false })
    .limit(SUMMARIZE_AFTER)

  const totalCount = count || 0

  if (totalCount % SUMMARIZE_AFTER !== 0 || totalCount === 0) {
    return false
  }

  // If a summary exists and was created after the oldest message in the
  // current 20-message window, it already covers this window — skip.
  if (lastSummary?.created_at && recentMessages && recentMessages.length > 0) {
    const oldestRecentMessage = recentMessages[recentMessages.length - 1]
    if (
      oldestRecentMessage?.created_at &&
      new Date(lastSummary.created_at) > new Date(oldestRecentMessage.created_at)
    ) {
      return false
    }
  }

  return true
}

export async function summarizeSession(
  campaignId: string,
  messages: Message[]
): Promise<void> {
  if (messages.length === 0) return

  const transcript = messages
    .map(m => `[${m.type}]: ${m.content}`)
    .join('\n')

  const response = await callGroqFast({
    system: 'You are a D&D session historian. Summarize concisely in 150-200 words. Focus on: decisions made, characters met, locations visited, quests updated, items found, combat outcomes. Write in past tense.',
    messages: [{ role: 'user', content: `Summarize this session:\n\n${transcript}` }]
  })

  await supabaseAdmin
    .from('world_memory_summaries')
    .insert({
      campaign_id: campaignId,
      summary_type: 'session',
      content: response.content,
      message_range_start: messages[0].id,
      message_range_end: messages[messages.length - 1].id
    })
}