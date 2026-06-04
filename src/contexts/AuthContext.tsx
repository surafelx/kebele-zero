import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import api from '../services/api'

interface User {
  id: string
  _id?: string
  email: string
  username: string
  role: 'user' | 'moderator' | 'admin'
  createdAt?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { username: string; email: string; password: string; role?: string }) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // normalise _id → id
  const normalise = (u: any): User => ({ ...u, id: u._id || u.id })

  useEffect(() => {
    const token = localStorage.getItem('kz_token')
    if (!token) { setLoading(false); return }
    api.get('/auth/me')
      .then(r => setUser(normalise(r.data.user)))
      .catch(() => localStorage.removeItem('kz_token'))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const r = await api.post('/auth/login', { email, password })
    localStorage.setItem('kz_token', r.data.token)
    setUser(normalise(r.data.user))
  }

  const register = async (data: { username: string; email: string; password: string; role?: string }) => {
    const r = await api.post('/auth/register', data)
    localStorage.setItem('kz_token', r.data.token)
    setUser(normalise(r.data.user))
  }

  const logout = async () => {
    localStorage.removeItem('kz_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
