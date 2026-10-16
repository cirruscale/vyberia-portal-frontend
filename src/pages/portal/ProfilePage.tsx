import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/lib/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { portalAuth } from '@/lib/api/auth'

const inputClass = 'mt-1.5 w-full border border-[#ddd] rounded-[3px] px-4 py-3 text-[14px] text-dark bg-white outline-none focus:border-dark transition-colors'

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

  if (loading) return <div className="max-w-[600px] mx-auto px-5 sm:px-8 py-12 text-center text-muted">Loading...</div>
  if (!user) return (
    <div className="max-w-[600px] mx-auto px-5 sm:px-8 py-24 text-center animate-fade-in">
      <Link to="/login" className="inline-flex items-center gap-2 px-7 py-3 bg-dark text-white text-[13px] font-medium rounded-full hover:bg-brand transition-colors">Sign in</Link>
    </div>
  )

  const handleProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setMsg(''); setErr('')
    try { await portalAuth.updateProfile({ name: name || user.name, phone: phone || undefined }); setMsg('Profile updated!') }
    catch (e: unknown) { setErr(e instanceof Error ? e.message : 'Update failed') }
    finally { setSaving(false) }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPass !== confirmPass) { setPassMsg('Passwords do not match'); return }
    if (newPass.length < 6) { setPassMsg('Password must be at least 6 characters'); return }
    setChangingPass(true); setPassMsg('')
    try { await portalAuth.changePassword({ old_password: oldPass, new_password: newPass }); setPassMsg('Password changed successfully!'); setOldPass(''); setNewPass(''); setConfirmPass('') }
    catch (e: unknown) { setPassMsg(e instanceof Error ? e.message : 'Failed') }
    finally { setChangingPass(false) }
  }

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPass !== confirmPass) { setPassMsg('Passwords do not match'); return }
    if (newPass.length < 6) { setPassMsg('Password must be at least 6 characters'); return }
    setChangingPass(true); setPassMsg('')
    try {
      const res = await portalAuth.setPassword({ phone: user.phone!, password: newPass })
      if (res.data) { loginWithOutput(res.data); setPassMsg('Password set successfully!'); setNewPass(''); setConfirmPass('') }
    } catch (e: unknown) { setPassMsg(e instanceof Error ? e.message : 'Failed') }
    finally { setChangingPass(false) }
  }

  return (
    <div className="max-w-[600px] mx-auto px-5 sm:px-8 lg:px-12 py-8 animate-fade-in">
      <h1 className="text-[26px] font-semibold tracking-[-0.02em] mb-10">Profile</h1>

      {/* Info */}
      <div className="flex items-center gap-4 pb-8 border-b border-[#eee] mb-8">
        <div className="w-14 h-14 rounded-full bg-dark text-white flex items-center justify-center text-[18px] font-semibold">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-[16px] font-medium">{user.name}</p>
          <p className="text-[13px] text-muted">{user.email || user.phone}</p>
        </div>
      </div>

      {/* Update profile */}
      <section className="pb-8 border-b border-[#eee] mb-8">
        <h2 className="text-[14px] font-semibold uppercase tracking-[0.06em] mb-5">Update Profile</h2>
        <form onSubmit={handleProfile} className="space-y-4">
          <div>
            <label className="text-[13px] text-[#555]">Name</label>
            <input value={name || user.name} onChange={e => setName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-[13px] text-[#555]">Phone</label>
            <input value={phone || user.phone || ''} onChange={e => setPhone(e.target.value)} className={inputClass} />
          </div>
          {msg && <p className="text-[13px] text-green-600">{msg}</p>}
          {err && <p className="text-[13px] text-red-600">{err}</p>}
          <Button type="submit" loading={saving} size="sm">Save changes</Button>
        </form>
      </section>

      {/* Password */}
      <section>
        <h2 className="text-[14px] font-semibold uppercase tracking-[0.06em] mb-5">
          {!user.has_password ? 'Set Password' : 'Change Password'}
        </h2>
        {!user.has_password && <p className="text-[13px] text-muted mb-5">Your account was created automatically. Set a password to secure it.</p>}
        <form onSubmit={user.has_password ? handleChangePassword : handleSetPassword} className="space-y-4">
          {user.has_password && (
            <div>
              <label className="text-[13px] text-[#555]">Current Password</label>
              <input type="password" required value={oldPass} onChange={e => setOldPass(e.target.value)} className={inputClass} />
            </div>
          )}
          <div>
            <label className="text-[13px] text-[#555]">New Password</label>
            <input type="password" required value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="At least 6 characters" className={inputClass} />
          </div>
          <div>
            <label className="text-[13px] text-[#555]">Confirm Password</label>
            <input type="password" required value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className={inputClass} />
          </div>
          {passMsg && <p className={`text-[13px] ${passMsg.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{passMsg}</p>}
          <Button type="submit" loading={changingPass} size="sm">{user.has_password ? 'Change password' : 'Set Password'}</Button>
        </form>
      </section>
    </div>
  )
}
