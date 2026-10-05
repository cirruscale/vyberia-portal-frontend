import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { User } from '../types'
import { setToken, setRefreshToken, clearTokens } from '../api/client'
import { portalAuth } from '../api/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('portal_token')
    if (token) {
      portalAuth.me()
        .then(res => { if (res.data) setUser(res.data) })
        .catch(() => clearTokens(false))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const res = await portalAuth.login({ email, password })
    if (res.data) {
      setToken(res.data.tokens.access_token, false)
      setRefreshToken(res.data.tokens.refresh_token, false)
      setUser(res.data.user)
    }
  }

  const register = async (name: string, email: string, password: string, phone?: string) => {
    const res = await portalAuth.register({ name, email, password, phone })
    if (res.data) {
      setToken(res.data.tokens.access_token, false)
      setRefreshToken(res.data.tokens.refresh_token, false)
      setUser(res.data.user)
    }
  }

  const logout = () => {
    clearTokens(false)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
