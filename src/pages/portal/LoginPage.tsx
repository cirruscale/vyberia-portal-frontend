import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/context/AuthContext'
import { portalAuth } from '@/lib/api/auth'

const inputClass = 'w-full border border-[#ddd] rounded-[3px] px-4 py-3 text-[14px] bg-white outline-none focus:border-dark transition-colors'

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
    <div className="min-h-[70vh] flex items-center justify-center px-5 py-16 animate-fade-in">
      <div className="w-full max-w-[380px]">
        <div className="text-center mb-10">
          <Link to="/" className="text-[22px] font-semibold tracking-[-0.04em]">VYBERIA</Link>
        </div>

        {step === 'phone' && (
          <>
            <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-center mb-2">Sign in</h1>
            <p className="text-[14px] text-muted text-center mb-8">
              New here?{' '}
              <Link to="/register" className="text-dark underline underline-offset-4 hover:no-underline">Create account</Link>
            </p>
            <form onSubmit={handleCheckPhone} className="space-y-5">
              <div>
                <label className="block text-[13px] text-[#555] mb-1.5">Phone number</label>
                <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} placeholder="+8801700000004" />
              </div>
              {error && <p className="text-[13px] text-red-600">{error}</p>}
              <button type="submit" disabled={loading} className="w-full h-[50px] bg-dark text-white text-[13px] font-medium rounded-full hover:bg-brand transition-colors cursor-pointer disabled:opacity-50 uppercase tracking-[0.05em]">
                {loading ? 'Loading...' : 'Continue'}
              </button>
            </form>
          </>
        )}

        {step === 'password' && (
          <>
            <button onClick={() => { setStep('phone'); setError('') }} className="text-[13px] text-muted hover:text-dark mb-8 flex items-center gap-1.5 cursor-pointer">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
              Back
            </button>
            <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-center mb-2">Enter password</h1>
            <p className="text-[14px] text-muted text-center mb-8">{phone}</p>
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-[13px] text-[#555] mb-1.5">Password</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className={inputClass} autoFocus />
              </div>
              {error && <p className="text-[13px] text-red-600">{error}</p>}
              <button type="submit" disabled={loading} className="w-full h-[50px] bg-dark text-white text-[13px] font-medium rounded-full hover:bg-brand transition-colors cursor-pointer disabled:opacity-50 uppercase tracking-[0.05em]">
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </>
        )}

        {step === 'set-password' && (
          <>
            <button onClick={() => { setStep('phone'); setError('') }} className="text-[13px] text-muted hover:text-dark mb-8 flex items-center gap-1.5 cursor-pointer">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
              Back
            </button>
            <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-center mb-2">Set your password</h1>
            <p className="text-[14px] text-muted text-center mb-8">You placed an order with {phone}. Set a password to access your account.</p>
            <form onSubmit={handleSetPassword} className="space-y-5">
              <div>
                <label className="block text-[13px] text-[#555] mb-1.5">New password</label>
                <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className={inputClass} placeholder="At least 6 characters" autoFocus />
              </div>
              <div>
                <label className="block text-[13px] text-[#555] mb-1.5">Confirm password</label>
                <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputClass} />
              </div>
              {error && <p className="text-[13px] text-red-600">{error}</p>}
              <button type="submit" disabled={loading} className="w-full h-[50px] bg-dark text-white text-[13px] font-medium rounded-full hover:bg-brand transition-colors cursor-pointer disabled:opacity-50 uppercase tracking-[0.05em]">
                {loading ? 'Setting...' : 'Set Password & Sign In'}
              </button>
            </form>
          </>
        )}

        <div className="mt-8 text-center">
          <Link to="/cms/login" className="text-[11px] text-[#ccc] hover:text-[#999] transition-colors">Admin</Link>
        </div>
      </div>
    </div>
  )
}
