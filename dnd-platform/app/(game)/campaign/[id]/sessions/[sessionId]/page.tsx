import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function SessionReplayPage({ params }: { params: { id: string, sessionId: string } }) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch the summary metadata
  const { data: summary } = await supabase
    .from('world_memory_summaries')
    .select('*')
    .eq('id', params.sessionId)
    .single()

  if (!summary) return <div>Session not found</div>

  // Fetch the boundary messages to get timestamps
  const { data: startMsg } = await supabase.from('messages').select('created_at').eq('id', summary.message_range_start).single()
  const { data: endMsg } = await supabase.from('messages').select('created_at').eq('id', summary.message_range_end).single()

  let messages: any[] = []
  if (startMsg && endMsg) {
    // Fetch all messages in that time window
    const { data } = await supabase
      .from('messages')
      .select('*, character:characters(name, class)')
      .eq('campaign_id', params.id)
      .gte('created_at', startMsg.created_at)
      .lte('created_at', endMsg.created_at)
      .order('created_at', { ascending: true })
    
    messages = data || []
  }

  return (
    <div className="flex justify-center h-screen bg-gray-50 dark:bg-gray-900 bg-[url('/background.png')] bg-cover bg-center overflow-y-auto">
      <div className="max-w-3xl w-full mx-auto my-8 flex flex-col gap-4">
        
        <header className="flex justify-between items-center backdrop-blur-md bg-white/80 dark:bg-gray-900/80 p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
          <Link href={`/campaign/${params.id}/sessions`} className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
            ← Back to Sessions
          </Link>
          <span className="font-bold text-gray-900 dark:text-gray-100">Chronicle Replay</span>
          <div className="w-16" /> {/* Spacer for centering */}
        </header>

        <div className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm prose dark:prose-invert max-w-none">
          <h2 className="text-xl font-bold mt-0 mb-2">Session Summary</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 m-0">{summary.content}</p>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-12">
          {messages.map((message) => {
            const isDM = message.type === 'narration' || message.type === 'system'
            const isSystem = message.type === 'system'
            const isMe = message.type === 'player_action'

            return (
              <div key={message.id} className={`flex flex-col max-w-[85%] ${isDM ? 'self-start mr-auto' : 'self-end ml-auto items-end'}`}>
                {/* Name header */}
                <div className={`mb-1 px-1 flex items-baseline gap-2 ${isDM ? 'justify-start' : 'justify-end'}`}>
                  <span className={`text-xs font-semibold ${isDM ? 'text-emerald-600 dark:text-emerald-400 font-serif' : 'text-amber-600 dark:text-amber-500'}`}>
                    {isSystem ? 'System' : isDM ? 'Dungeon Master' : message.character?.name || 'Player'}
                  </span>
                  {!isDM && message.character?.class && (
                    <span className="text-[10px] uppercase text-gray-400">{message.character.class}</span>
                  )}
                </div>

                {/* Bubble */}
                <div className={`
                  px-4 py-3 shadow-md backdrop-blur-md
                  ${isDM 
                    ? 'rounded-2xl rounded-tl-sm bg-white/40 dark:bg-gray-800/40 border border-gray-200/50 dark:border-gray-700/50 text-gray-800 dark:text-gray-200 font-serif leading-relaxed' 
                    : isSystem
                      ? 'rounded-xl bg-gray-100/40 dark:bg-gray-900/40 text-gray-500 dark:text-gray-400 text-sm italic border border-gray-200/30 dark:border-gray-800/30'
                      : 'rounded-2xl rounded-tr-sm bg-emerald-500/30 dark:bg-emerald-600/30 border border-emerald-400/30 text-emerald-950 dark:text-emerald-50'
                  }
                `}>
                  {message.content}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
