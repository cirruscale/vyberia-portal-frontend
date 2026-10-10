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
    <div className="min-h-screen flex" style={{ background: '#0F172A' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-80 p-10" style={{ background: '#1E293B' }}>
        <div>
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center mb-8">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <h2 className="text-white text-2xl font-bold mb-3">Vyberia CMS</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Manage your products, orders, categories and users from one central dashboard.
          </p>
        </div>
        <p className="text-slate-600 text-xs">Admin & Operator access only</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="text-white font-bold">Vyberia CMS</span>
          </div>

          <h1 className="text-white text-2xl font-bold mb-1">Welcome back</h1>
          <p className="text-slate-400 text-sm mb-8">Sign in to your CMS account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Email</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@vyberia.com"
                className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ background: '#1E293B', border: '1px solid #334155' }}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Password</label>
              <input
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ background: '#1E293B', border: '1px solid #334155' }}
              />
            </div>
            {error && (
              <div className="rounded-lg px-4 py-3 text-sm text-red-400" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}
            <Button type="submit" size="lg" className="w-full" loading={loading}>
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
