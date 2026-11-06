import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/lib/context/AuthContext'

const inputClass = 'w-full border border-[#E0D8CE] bg-[#FAF9F7] px-4 py-3.5 text-[13px] text-[#1A2E24] outline-none focus:border-[#065084] transition-colors placeholder:text-[#C8BFB3]'
const labelClass = 'block text-[10px] tracking-[0.12em] uppercase text-[#7A7067] mb-2'

export default function RegisterPage() {
  const { register, user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({
    name: '', phone: searchParams.get('phone') || '', email: '', password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (user) navigate('/') }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await register(form.name, form.phone, form.password, form.email || undefined)
      navigate('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally { setLoading(false) }
  }

  const field = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const fields = [
    { key: 'name',     label: 'Full name',       type: 'text',     required: true,  placeholder: 'Your name' },
    { key: 'phone',    label: 'Phone',            type: 'tel',      required: true,  placeholder: '+8801700000000' },
    { key: 'email',    label: 'Email (optional)', type: 'email',    required: false, placeholder: 'you@example.com' },
    { key: 'password', label: 'Password',         type: 'password', required: true,  placeholder: 'At least 6 characters' },
  ] as const

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-6 py-20 animate-fade-in bg-[#FAF9F7]">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="text-center mb-14">
          <Link to="/" className="font-display text-[24px] font-light tracking-[0.3em] uppercase text-[#1A2E24]">
            Vyberia
          </Link>
          <div className="w-6 h-px bg-[#065084] mx-auto mt-4" />
        </div>

        <div className="text-center mb-10">
          <h1 className="font-display text-[32px] font-light text-[#1A2E24] mb-2">Create account</h1>
          <p className="text-[13px] text-[#7A7067] font-light">
            Already have an account?{' '}
            <Link to="/login" className="text-[#065084] hover:text-[#1B4332] transition-colors underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {fields.map(({ key, label, type, required, placeholder }) => (
            <div key={key}>
              <label className={labelClass}>{label}</label>
              <input
                type={type}
                required={required}
                value={form[key]}
                onChange={field(key)}
                placeholder={placeholder}
                className={inputClass}
              />
            </div>
          ))}
          {error && <p className="text-[12px] text-red-500 tracking-[0.02em]">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[52px] bg-[#065084] text-[#FAF9F7] text-[11px] font-medium uppercase tracking-[0.12em] hover:bg-[#1B4332] transition-colors cursor-pointer disabled:opacity-40 mt-2"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}
