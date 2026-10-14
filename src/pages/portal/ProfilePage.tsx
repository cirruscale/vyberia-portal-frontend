import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/lib/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { portalAuth } from '@/lib/api/auth'

const inputClass = 'mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all'

export default function ProfilePage() {
  const { user, loading, loginWithOutput } = useAuth()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [oldPass, setOldPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [saving, setSaving] = useState(false)
  const [changingPass, setChangingPass] = useState(false)
  const [msg, setMsg] = useState('')
  const [passMsg, setPassMsg] = useState('')
  const [err, setErr] = useState('')

  if (loading) return <div className="max-w-2xl mx-auto py-12 text-center text-muted">Loading...</div>
  if (!user) return (
    <div className="max-w-2xl mx-auto py-20 text-center animate-fade-in">
      <Link to="/login" className="text-brand hover:text-brand-hover font-medium transition-colors">Sign in</Link>
    </div>
  )

  const handleProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setMsg(''); setErr('')
    try {
      await portalAuth.updateProfile({ name: name || user.name, phone: phone || undefined })
      setMsg('Profile updated!')
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Update failed')
    } finally { setSaving(false) }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPass !== confirmPass) { setPassMsg('Passwords do not match'); return }
    if (newPass.length < 6) { setPassMsg('Password must be at least 6 characters'); return }
    setChangingPass(true); setPassMsg('')
    try {
      await portalAuth.changePassword({ old_password: oldPass, new_password: newPass })
      setPassMsg('Password changed successfully!')
      setOldPass(''); setNewPass(''); setConfirmPass('')
    } catch (e: unknown) {
      setPassMsg(e instanceof Error ? e.message : 'Failed')
    } finally { setChangingPass(false) }
  }

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPass !== confirmPass) { setPassMsg('Passwords do not match'); return }
    if (newPass.length < 6) { setPassMsg('Password must be at least 6 characters'); return }
    setChangingPass(true); setPassMsg('')
    try {
      const res = await portalAuth.setPassword({ phone: user.phone!, password: newPass })
      if (res.data) {
        loginWithOutput(res.data)
        setPassMsg('Password set successfully!')
        setNewPass(''); setConfirmPass('')
      }
    } catch (e: unknown) {
      setPassMsg(e instanceof Error ? e.message : 'Failed')
    } finally { setChangingPass(false) }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Profile</h1>

      {/* Account info card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand/10 text-brand flex items-center justify-center text-xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user.name}</p>
            {user.email && <p className="text-sm text-muted">{user.email}</p>}
            <p className="text-xs text-muted mt-0.5 capitalize">Role: {user.role}</p>
          </div>
        </div>
      </div>

      {/* Update profile */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Update Profile</h2>
        <form onSubmit={handleProfile} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Name</label>
            <input value={name || user.name} onChange={e => setName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <input value={phone || user.phone || ''} onChange={e => setPhone(e.target.value)} className={inputClass} />
          </div>
          {msg && <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">{msg}</p>}
          {err && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{err}</p>}
          <Button type="submit" loading={saving} size="sm">Save changes</Button>
        </form>
      </div>

      {/* Password section */}
      {!user.has_password ? (
        <div className="bg-amber-50/50 rounded-2xl border border-amber-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Set Password</h2>
          <p className="text-sm text-muted mb-4">Your account was created automatically. Set a password to secure it.</p>
          <form onSubmit={handleSetPassword} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">New Password</label>
              <input type="password" required value={newPass} onChange={e => setNewPass(e.target.value)}
                placeholder="At least 6 characters" className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Confirm Password</label>
              <input type="password" required value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className={inputClass} />
            </div>
            {passMsg && <p className={`text-sm px-3 py-2 rounded-lg ${passMsg.includes('success') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>{passMsg}</p>}
            <Button type="submit" loading={changingPass} size="sm">Set Password</Button>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Current Password</label>
              <input type="password" required value={oldPass} onChange={e => setOldPass(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">New Password</label>
              <input type="password" required value={newPass} onChange={e => setNewPass(e.target.value)}
                placeholder="At least 6 characters" className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
              <input type="password" required value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className={inputClass} />
            </div>
            {passMsg && <p className={`text-sm px-3 py-2 rounded-lg ${passMsg.includes('success') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>{passMsg}</p>}
            <Button type="submit" loading={changingPass} size="sm">Change password</Button>
          </form>
        </div>
      )}
    </div>
  )
}
