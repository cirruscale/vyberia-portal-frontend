import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { User } from '../types'
import { setToken, setRefreshToken, clearTokens } from '../api/client'
import { cmsAuth } from '../api/auth'

interface CmsAuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const CmsAuthContext = createContext<CmsAuthContextType | null>(null)

export function CmsAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('cms_token')
    if (token) {
      cmsAuth.me()
        .then(res => { if (res.data) setUser(res.data) })
        .catch(() => clearTokens(true))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const res = await cmsAuth.login({ email, password })
    if (res.data) {
      setToken(res.data.tokens.access_token, true)
      setRefreshToken(res.data.tokens.refresh_token, true)
      setUser(res.data.user)
    }
  }

  const logout = () => {
    clearTokens(true)
    setUser(null)
  }

  return (
    <CmsAuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </CmsAuthContext.Provider>
  )
}

export function useCmsAuth() {
  const ctx = useContext(CmsAuthContext)
  if (!ctx) throw new Error('useCmsAuth must be used within CmsAuthProvider')
  return ctx
}
