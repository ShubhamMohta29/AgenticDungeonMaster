import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import type { NextRequest } from 'next/server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _supabaseAdminClient: SupabaseClient<any> | null = null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabaseAdminClient(): SupabaseClient<any> {
  if (_supabaseAdminClient) return _supabaseAdminClient

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing required Supabase server configuration')
  }

  _supabaseAdminClient = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
  return _supabaseAdminClient
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabaseAdmin = new Proxy({} as SupabaseClient<any>, {
  get(_target, prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getSupabaseAdminClient() as any)[prop]
  }
})

// setAll is intentionally a no-op: API routes have no access to the outgoing
// response object, so refreshed tokens cannot be written back to the client.
// Token refresh is handled by middleware (dnd-platform/middleware.ts) which
// does have response access. getUser() still validates the JWT server-side.
export async function getAuthenticatedUser(req: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}