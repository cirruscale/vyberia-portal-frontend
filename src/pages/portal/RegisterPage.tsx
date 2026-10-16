import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/lib/context/AuthContext'

const inputClass = 'w-full border border-[#ddd] rounded-[3px] px-4 py-3 text-[14px] bg-white outline-none focus:border-dark transition-colors'

export default function RegisterPage() {
  const { register, user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({ name: '', phone: searchParams.get('phone') || '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (user) navigate('/') }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form.name, form.phone, form.password, form.email || undefined)
      navigate('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally { setLoading(false) }
  }

  const field = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-5 py-16 animate-fade-in">
      <div className="w-full max-w-[380px]">
        <div className="text-center mb-10">
          <Link to="/" className="text-[22px] font-semibold tracking-[-0.04em]">VYBERIA</Link>
        </div>

        <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-center mb-2">Create account</h1>
        <p className="text-[14px] text-muted text-center mb-8">
          Already have an account?{' '}
          <Link to="/login" className="text-dark underline underline-offset-4 hover:no-underline">Sign in</Link>
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            { key: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'Your name' },
            { key: 'phone', label: 'Phone', type: 'tel', required: true, placeholder: '+8801700000000' },
            { key: 'email', label: 'Email (optional)', type: 'email', required: false, placeholder: 'you@example.com' },
            { key: 'password', label: 'Password', type: 'password', required: true, placeholder: 'At least 6 characters' },
          ].map(({ key, label, type, required, placeholder }) => (
            <div key={key}>
              <label className="block text-[13px] text-[#555] mb-1.5">{label}</label>
              <input type={type} required={required} value={form[key as keyof typeof form]} onChange={field(key as keyof typeof form)} placeholder={placeholder} className={inputClass} />
            </div>
          ))}
          {error && <p className="text-[13px] text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="w-full h-[50px] bg-dark text-white text-[13px] font-medium rounded-full hover:bg-brand transition-colors cursor-pointer disabled:opacity-50 uppercase tracking-[0.05em]">
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}
