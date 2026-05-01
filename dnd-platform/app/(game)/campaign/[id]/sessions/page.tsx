import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function SessionsPage({ params }: { params: { id: string } }) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('name, setting')
    .eq('id', params.id)
    .single()

  const { data: summaries } = await supabase
    .from('world_memory_summaries')
    .select('*')
    .eq('campaign_id', params.id)
    .eq('summary_type', 'session')
    .order('created_at', { ascending: true })

  // Deduplicate and number the sessions logically
  const sessions = summaries?.map((s, index) => ({
    ...s,
    sessionNumber: index + 1
  })) || []

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 bg-[url('/background.png')] bg-cover bg-center overflow-y-auto">
      <div className="max-w-4xl w-full mx-auto p-8">
        <header className="mb-8 flex justify-between items-end backdrop-blur-md bg-white/60 dark:bg-gray-900/60 p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
          <div>
            <Link href={`/campaign/${params.id}/play`} className="text-sm font-medium text-emerald-600 hover:text-emerald-700 mb-2 inline-block">
              ← Return to Campaign
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{campaign?.name}</h1>
            <p className="text-gray-500 dark:text-gray-400">Campaign Chronicles & Session Logs</p>
          </div>
        </header>

        <div className="space-y-6">
          {sessions.length === 0 ? (
            <div className="text-center py-20 backdrop-blur-md bg-white/60 dark:bg-gray-900/60 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 text-gray-500">
              <p className="text-xl font-medium mb-2">No adventures logged yet.</p>
              <p>Session summaries will appear here automatically as you play.</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      Session {session.sessionNumber}
                    </h2>
                    <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                      <span>Recorded {new Date(session.created_at).toLocaleDateString()}</span>
                      <span>·</span>
                      <span className="uppercase tracking-wider font-medium text-emerald-600 dark:text-emerald-400">
                        {session.summary_type} Summary
                      </span>
                    </p>
                  </div>
                  <Link 
                    href={`/campaign/${params.id}/sessions/${session.id}`}
                    className="px-4 py-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 font-medium text-sm rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors"
                  >
                    View Replay
                  </Link>
                </div>
                
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                    {session.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
