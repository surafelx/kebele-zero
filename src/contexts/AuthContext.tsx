import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from 'react'
import { supabase } from '../services/supabase'
import { pointsAPI } from '../services/points'

/* ===================== TYPES ===================== */

interface User {
  id: string
  email: string
  username: string
  role: 'user' | 'admin'
  created_at?: string
  profile?: {
    firstName?: string
    lastName?: string
    bio?: string
    avatar?: string
  }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    username: string
    email: string
    password: string
    role?: 'user' | 'admin'
  }) => Promise<void>
  logout: () => Promise<void>
}

/* ===================== CONTEXT ===================== */

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

interface AuthProviderProps {
  children: ReactNode
}

/* ===================== PROVIDER ===================== */

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  /* ========== INITIAL SESSION + LISTENER ========== */

  useEffect(() => {
    console.log('[Auth] Provider mounted')

    let mounted = true

    const init = async () => {
      console.log('[Auth] Fetching initial session...')
      const { data } = await supabase.auth.getSession()
      console.log('[Auth] Initial session:', data.session)

      if (data.session?.user && mounted) {
         loadUserProfile(data.session.user)
      }

      setLoading(false)
    }

    init()

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] Auth state change:', event)
        console.log('[Auth] Session:', session)

        if (!mounted) return

        if (event === 'SIGNED_IN' && session?.user) {
           loadUserProfile(session.user)
        }

        if (event === 'SIGNED_OUT') {
          setUser(null)
        }

        setLoading(false)
      }
    )

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
      console.log('[Auth] Provider unmounted')
    }
  }, [])

  /* ===================== PROFILE LOADER ===================== */

const loadUserProfile = async (authUser: any) => {
  console.log('[Auth] Loading profile for:', authUser.id)

  const profile: User = {
    id: authUser.id,
    email: authUser.email || '',
    username:
      authUser.user_metadata?.username ||
      authUser.email?.split('@')[0] ||
      'user',
    role: authUser.user_metadata?.role === 'admin' ? 'admin' : 'user',
    created_at: authUser.created_at,
    profile: {
      firstName: authUser.user_metadata?.firstName || '',
      lastName: authUser.user_metadata?.lastName || '',
      bio: authUser.user_metadata?.bio || '',
      avatar: authUser.user_metadata?.avatar_url || ''
    }
  }

  // Ensure user exists in users table
  try {
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('id', authUser.id)
      .single()

    if (userCheckError && userCheckError.code === 'PGRST116') {
      // User doesn't exist in users table, create them
      console.log('[Auth] Creating user record in users table')
      const { error: createError } = await supabase
        .from('users')
        .insert([{
          id: authUser.id,
          email: authUser.email,
          username: profile.username,
          role: profile.role,
          is_active: true
        }])

      if (createError) {
        console.error('[Auth] Error creating user record:', createError)
      } else {
        console.log('[Auth] User record created successfully')
      }
    }
  } catch (err) {
    console.error('[Auth] Error checking/creating user record:', err)
  }

  console.log('[Auth] Setting user from auth data')
  setUser(profile)

  // Fire & forget
  pointsAPI.getUserPoints(authUser.id)
    .then(() => console.log('[Auth] Points OK'))
    .catch(() => console.warn('[Auth] Points API skipped'))
}

  /* ===================== AUTH ACTIONS ===================== */

  const login = async (email: string, password: string) => {
    console.log('[Auth] Login:', email)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const register = async ({
    email,
    password,
    username,
    role = 'user'
  }: {
    username: string
    email: string
    password: string
    role?: 'user' | 'admin'
  }) => {
    console.log('[Auth] Register:', email, 'role:', role)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, role }
      }
    })

    if (error) throw error

    // If signup was successful and we have a user, create a record in the users table
    if (data.user) {
      try {
        const { error: userError } = await supabase
          .from('users')
          .insert([{
            id: data.user.id,
            email: email,
            username: username,
            role: role,
            is_active: true
          }])

        if (userError) {
          console.error('[Auth] Error creating user record:', userError)
          // Don't throw here as the auth signup succeeded
        } else {
          console.log('[Auth] User record created in users table')
        }
      } catch (err) {
        console.error('[Auth] Failed to create user record:', err)
      }
    }

    console.log('[Auth] Signup complete – waiting for email confirmation if enabled')
  }

  const logout = async () => {
    console.log('[Auth] Logout')
    await supabase.auth.signOut()
    setUser(null)
  }

  /* ===================== PROVIDER ===================== */

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
