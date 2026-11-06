import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/context/AuthContext'
import { portalAuth } from '@/lib/api/auth'

const inputClass = 'w-full border border-[#E0D8CE] bg-[#FAF9F7] px-4 py-3.5 text-[13px] outline-none focus:border-[#B8956A] transition-colors placeholder:text-[#C8BFB3] text-[#0C0B0A]'

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
    <div className="min-h-[75vh] flex items-center justify-center px-6 py-20 animate-fade-in bg-[#FAF9F7]">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="text-center mb-14">
          <Link to="/" className="font-display text-[24px] font-light tracking-[0.3em] uppercase text-[#0C0B0A]">
            Vyberia
          </Link>
          <div className="w-6 h-px bg-[#B8956A] mx-auto mt-4" />
        </div>

        {step === 'phone' && (
          <>
            <div className="text-center mb-10">
              <h1 className="font-display text-[32px] font-light text-[#0C0B0A] mb-2">Welcome back</h1>
              <p className="text-[13px] text-[#7A7067] font-light">
                New here?{' '}
                <Link to="/register" className="text-[#B8956A] hover:text-[#0C0B0A] transition-colors underline underline-offset-4">
                  Create an account
                </Link>
              </p>
            </div>
            <form onSubmit={handleCheckPhone} className="space-y-5">
              <div>
                <label className="block text-[10px] tracking-[0.12em] uppercase text-[#7A7067] mb-2">Phone number</label>
                <input
                  type="tel" required value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className={inputClass}
                  placeholder="+8801700000004"
                />
              </div>
              {error && <p className="text-[12px] text-red-500 tracking-[0.02em]">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[52px] bg-[#B8956A] text-[#FAF9F7] text-[11px] font-medium uppercase tracking-[0.12em] hover:bg-[#9A7A54] transition-colors cursor-pointer disabled:opacity-40 mt-2"
              >
                {loading ? 'Loading...' : 'Continue'}
              </button>
            </form>
          </>
        )}

        {step === 'password' && (
          <>
            <button
              onClick={() => { setStep('phone'); setError('') }}
              className="flex items-center gap-2 text-[11px] tracking-[0.08em] uppercase text-[#7A7067] hover:text-[#B8956A] mb-10 cursor-pointer transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Back
            </button>
            <div className="text-center mb-10">
              <h1 className="font-display text-[32px] font-light text-[#0C0B0A] mb-2">Enter password</h1>
              <p className="text-[13px] text-[#B8956A] font-light">{phone}</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-[10px] tracking-[0.12em] uppercase text-[#7A7067] mb-2">Password</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className={inputClass} autoFocus />
              </div>
              {error && <p className="text-[12px] text-red-500 tracking-[0.02em]">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[52px] bg-[#B8956A] text-[#FAF9F7] text-[11px] font-medium uppercase tracking-[0.12em] hover:bg-[#9A7A54] transition-colors cursor-pointer disabled:opacity-40 mt-2"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </>
        )}

        {step === 'set-password' && (
          <>
            <button
              onClick={() => { setStep('phone'); setError('') }}
              className="flex items-center gap-2 text-[11px] tracking-[0.08em] uppercase text-[#7A7067] hover:text-[#B8956A] mb-10 cursor-pointer transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Back
            </button>
            <div className="text-center mb-10">
              <h1 className="font-display text-[32px] font-light text-[#0C0B0A] mb-2">Set your password</h1>
              <p className="text-[13px] text-[#7A7067] font-light max-w-[300px] mx-auto">
                You placed an order with <span className="text-[#B8956A]">{phone}</span>. Set a password to access your account.
              </p>
            </div>
            <form onSubmit={handleSetPassword} className="space-y-5">
              <div>
                <label className="block text-[10px] tracking-[0.12em] uppercase text-[#7A7067] mb-2">New password</label>
                <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className={inputClass} placeholder="At least 6 characters" autoFocus />
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.12em] uppercase text-[#7A7067] mb-2">Confirm password</label>
                <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputClass} />
              </div>
              {error && <p className="text-[12px] text-red-500 tracking-[0.02em]">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[52px] bg-[#B8956A] text-[#FAF9F7] text-[11px] font-medium uppercase tracking-[0.12em] hover:bg-[#9A7A54] transition-colors cursor-pointer disabled:opacity-40 mt-2"
              >
                {loading ? 'Setting...' : 'Set Password & Sign In'}
              </button>
            </form>
          </>
        )}

        <div className="mt-10 text-center">
          <Link to="/cms/login" className="text-[10px] tracking-[0.08em] text-[#D4CCBf] hover:text-[#B8956A] transition-colors">
            Admin access
          </Link>
        </div>
      </div>
    </div>
  )
}
