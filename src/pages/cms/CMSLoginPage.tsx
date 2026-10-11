import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCmsAuth } from '@/lib/context/CmsAuthContext'
import { Button } from '@/components/ui/Button'

export default function CMSLoginPage() {
  const { login, user } = useCmsAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) { navigate('/cms/dashboard', { replace: true }); return null }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/cms/dashboard', { replace: true })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F1F5F9' }}>
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full" style={{ maxWidth: '360px' }}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#C4A87A' }}>
            <span className="text-white font-bold text-base">V</span>
          </div>
          <div>
            <p className="text-slate-900 text-sm font-bold leading-tight">Vyberia</p>
            <p className="text-xs font-medium" style={{ color: '#C4A87A' }}>CMS Panel</p>
          </div>
        </div>

        <h1 className="text-slate-900 text-lg font-bold mb-0.5">Welcome back</h1>
        <p className="text-slate-400 text-xs mb-6">Sign in to your CMS account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Email</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@vyberia.com"
              className="w-full rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand border border-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Password</label>
            <input
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand border border-slate-200"
            />
          </div>
          {error && (
            <div className="rounded-lg px-3.5 py-2.5 text-xs text-red-600" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Sign in
          </Button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-5">Admin &amp; Operator access only</p>
      </div>
    </div>
  )
}
