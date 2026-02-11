import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'Accept': 'application/json',
    },
  },
})

// Add global error handler for Supabase to log database errors to console
if (typeof window !== 'undefined') {
  supabase.channel('custom-error-channel')
    .on('broadcast', { event: 'error' }, (payload) => {
      console.log('[Supabase Error]', payload)
    })
    .subscribe()
}

// Helper function to log Supabase errors with full details
export const logSupabaseError = (operation: string, error: any) => {
  console.group(`[Supabase] ${operation}`)
  console.log('Error Message:', error?.message || 'Unknown error')
  console.log('Error Code:', error?.code || 'N/A')
  console.log('Error Details:', error?.details || 'No details available')
  console.log('Error Hint:', error?.hint || 'No hint available')
  console.log('Full Error Object:', error)
  console.groupEnd()
}

// Helper function to safely execute Supabase queries with logging
export const safeSupabaseQuery = async <T>(
  operation: string,
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<T | null> => {
  try {
    const { data, error } = await queryFn()
    
    if (error) {
      logSupabaseError(operation, error)
      return null
    }
    
    return data
  } catch (err) {
    console.error(`[Supabase] Unexpected error during ${operation}:`, err)
    return null
  }
}
