import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/lib/context/AuthContext'
import { Button } from '@/components/ui/Button'

const inputClass = 'w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all'

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
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-stone-200 p-8">
        <h1 className="text-xl font-bold mb-1 text-center">Create account</h1>
        <p className="text-sm text-muted text-center mb-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand hover:text-brand-hover font-medium">Sign in</Link>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'Your name' },
            { key: 'phone', label: 'Phone', type: 'tel', required: true, placeholder: '+8801700000000' },
            { key: 'email', label: 'Email (optional)', type: 'email', required: false, placeholder: 'you@example.com' },
            { key: 'password', label: 'Password', type: 'password', required: true, placeholder: 'At least 6 characters' },
          ].map(({ key, label, type, required, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-stone-700 mb-1">{label}</label>
              <input type={type} required={required} value={form[key as keyof typeof form]} onChange={field(key as keyof typeof form)} placeholder={placeholder} className={inputClass} />
            </div>
          ))}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" size="lg" className="w-full" loading={loading}>Create account</Button>
        </form>
      </div>
    </div>
  )
}
