import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/lib/context/AuthContext'
import { portalAuth } from '@/lib/api/auth'

const inputClass = 'w-full border border-[#E0D8CE] bg-[#FAF9F7] px-4 py-3 text-[13px] outline-none focus:border-[#065084] transition-colors placeholder:text-[#C8BFB3] text-[#1A2E24]'
const labelClass = 'block text-[10px] tracking-[0.12em] uppercase text-[#7A7067] mb-2'

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

  if (loading) return (
    <div className="max-w-[600px] mx-auto px-6 sm:px-8 py-16 text-center">
      <p className="text-[13px] text-[#065084] tracking-[0.08em]">Loading...</p>
    </div>
  )

  if (!user) return (
    <div className="max-w-[500px] mx-auto px-6 sm:px-8 py-28 text-center animate-fade-in">
      <p className="font-display text-[26px] font-light text-[#1A2E24] mb-3">Sign in required</p>
      <p className="text-[13px] text-[#7A7067] mb-10 font-light">Please sign in to view your profile.</p>
      <Link to="/login" className="btn-primary">Sign in</Link>
    </div>
  )

  const handleProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setMsg(''); setErr('')
    try {
      await portalAuth.updateProfile({ name: name || user.name, phone: phone || undefined })
      setMsg('Profile updated successfully.')
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'Update failed') }
    finally { setSaving(false) }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPass !== confirmPass) { setPassMsg('Passwords do not match'); return }
    if (newPass.length < 6) { setPassMsg('Password must be at least 6 characters'); return }
    setChangingPass(true); setPassMsg('')
    try {
      await portalAuth.changePassword({ old_password: oldPass, new_password: newPass })
      setPassMsg('Password changed successfully.')
      setOldPass(''); setNewPass(''); setConfirmPass('')
    } catch (e: unknown) { setPassMsg(e instanceof Error ? e.message : 'Failed') }
    finally { setChangingPass(false) }
  }

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPass !== confirmPass) { setPassMsg('Passwords do not match'); return }
    if (newPass.length < 6) { setPassMsg('Password must be at least 6 characters'); return }
    setChangingPass(true); setPassMsg('')
    try {
      const res = await portalAuth.setPassword({ phone: user.phone!, password: newPass })
      if (res.data) { loginWithOutput(res.data); setPassMsg('Password set successfully.'); setNewPass(''); setConfirmPass('') }
    } catch (e: unknown) { setPassMsg(e instanceof Error ? e.message : 'Failed') }
    finally { setChangingPass(false) }
  }

  return (
    <div className="max-w-[580px] mx-auto px-6 sm:px-8 lg:px-12 py-12 animate-fade-in">
      {/* Page heading */}
      <div className="mb-12">
        <p className="text-[9px] tracking-[0.2em] uppercase text-[#065084] mb-3">Account</p>
        <h1 className="font-display text-[36px] font-light text-[#1A2E24]">Profile</h1>
      </div>

      {/* Avatar + name */}
      <div className="flex items-center gap-5 pb-10 border-b border-[#E0D8CE] mb-10">
        <div className="w-14 h-14 bg-[#065084] flex items-center justify-center text-[#FAF9F7] font-display text-[20px] font-light flex-shrink-0">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-[15px] font-medium text-[#1A2E24]">{user.name}</p>
          <p className="text-[12px] text-[#7A7067] mt-0.5">{user.email || user.phone}</p>
        </div>
      </div>

      {/* Update profile */}
      <section className="pb-10 border-b border-[#E0D8CE] mb-10">
        <p className="text-[9px] tracking-[0.2em] uppercase text-[#065084] mb-6">Personal details</p>
        <form onSubmit={handleProfile} className="space-y-5">
          <div>
            <label className={labelClass}>Full name</label>
            <input value={name || user.name} onChange={e => setName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input value={phone || user.phone || ''} onChange={e => setPhone(e.target.value)} className={inputClass} />
          </div>
          {msg && <p className="text-[12px] text-[#6BAF7A] tracking-[0.02em]">{msg}</p>}
          {err && <p className="text-[12px] text-red-500 tracking-[0.02em]">{err}</p>}
          <button
            type="submit"
            disabled={saving}
            className="h-[46px] px-8 bg-[#065084] text-[#FAF9F7] text-[11px] font-medium uppercase tracking-[0.12em] hover:bg-[#1B4332] transition-colors cursor-pointer disabled:opacity-40"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </section>

      {/* Password */}
      <section>
        <p className="text-[9px] tracking-[0.2em] uppercase text-[#065084] mb-2">
          {!user.has_password ? 'Set password' : 'Security'}
        </p>
        <p className="font-display text-[20px] font-light text-[#1A2E24] mb-6">
          {!user.has_password ? 'Create a password' : 'Change password'}
        </p>
        {!user.has_password && (
          <p className="text-[13px] text-[#7A7067] mb-6 font-light leading-relaxed">
            Your account was created automatically via a guest order. Set a password to secure it.
          </p>
        )}
        <form onSubmit={user.has_password ? handleChangePassword : handleSetPassword} className="space-y-5">
          {user.has_password && (
            <div>
              <label className={labelClass}>Current password</label>
              <input type="password" required value={oldPass} onChange={e => setOldPass(e.target.value)} className={inputClass} />
            </div>
          )}
          <div>
            <label className={labelClass}>New password</label>
            <input type="password" required value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="At least 6 characters" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Confirm password</label>
            <input type="password" required value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className={inputClass} />
          </div>
          {passMsg && (
            <p className={`text-[12px] tracking-[0.02em] ${passMsg.includes('success') ? 'text-[#6BAF7A]' : 'text-red-500'}`}>
              {passMsg}
            </p>
          )}
          <button
            type="submit"
            disabled={changingPass}
            className="h-[46px] px-8 border border-[#065084] text-[#065084] text-[11px] font-medium uppercase tracking-[0.12em] hover:bg-[#065084] hover:text-[#FAF9F7] transition-colors cursor-pointer disabled:opacity-40"
          >
            {changingPass ? 'Saving...' : user.has_password ? 'Change Password' : 'Set Password'}
          </button>
        </form>
      </section>
    </div>
  )
}
