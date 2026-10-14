import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/context/AuthContext'
import { portalAuth } from '@/lib/api/auth'
import { Button } from '@/components/ui/Button'

const inputClass = 'w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all'

type Step = 'phone' | 'password' | 'set-password'

export default function LoginPage() {
  const { login, loginWithOutput, user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (user) navigate('/') }, [user, navigate])

  const handleCheckPhone = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await portalAuth.checkPhone(phone)
      if (!res.data) { setError('Something went wrong'); return }
      if (!res.data.user_exists) { navigate(`/register?phone=${encodeURIComponent(phone)}`); return }
      setStep(res.data.has_password ? 'password' : 'set-password')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to check phone')
    } finally { setLoading(false) }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try { await login(phone, password); navigate('/') }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Login failed') }
    finally { setLoading(false) }
  }

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return }
    setError('')
    setLoading(true)
    try {
      const res = await portalAuth.setPassword({ phone, password: newPassword })
      if (res.data) { loginWithOutput(res.data); navigate('/') }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to set password')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-stone-200 p-8">

        {step === 'phone' && (
          <>
            <h1 className="text-xl font-bold mb-1 text-center">Sign in</h1>
            <p className="text-sm text-muted text-center mb-6">
              New customer?{' '}
              <Link to="/register" className="text-brand hover:text-brand-hover font-medium">Create account</Link>
            </p>
            <form onSubmit={handleCheckPhone} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Phone number</label>
                <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} placeholder="+8801700000004" />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" size="lg" className="w-full" loading={loading}>Continue</Button>
            </form>
          </>
        )}

        {step === 'password' && (
          <>
            <button onClick={() => { setStep('phone'); setError('') }} className="text-sm text-brand hover:text-brand-hover font-medium mb-4 block cursor-pointer">&larr; Change number</button>
            <h1 className="text-xl font-bold mb-1 text-center">Enter password</h1>
            <p className="text-sm text-muted text-center mb-6">{phone}</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className={inputClass} autoFocus />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" size="lg" className="w-full" loading={loading}>Sign in</Button>
            </form>
          </>
        )}

        {step === 'set-password' && (
          <>
            <button onClick={() => { setStep('phone'); setError('') }} className="text-sm text-brand hover:text-brand-hover font-medium mb-4 block cursor-pointer">&larr; Change number</button>
            <h1 className="text-xl font-bold mb-1 text-center">Set your password</h1>
            <p className="text-sm text-muted text-center mb-1">{phone}</p>
            <p className="text-sm text-muted text-center mb-6">You placed an order with this number. Set a password to access your account.</p>
            <form onSubmit={handleSetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">New password</label>
                <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className={inputClass} placeholder="At least 6 characters" autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Confirm password</label>
                <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputClass} />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" size="lg" className="w-full" loading={loading}>Set Password & Sign In</Button>
            </form>
          </>
        )}

        <div className="mt-4 text-center">
          <Link to="/cms/login" className="text-[11px] text-stone-400 hover:text-stone-600 transition-colors">Admin</Link>
        </div>
      </div>
    </div>
  )
}
