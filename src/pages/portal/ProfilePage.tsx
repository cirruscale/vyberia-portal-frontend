import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/lib/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { portalAuth } from '@/lib/api/auth'

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [oldPass, setOldPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [saving, setSaving] = useState(false)
  const [changingPass, setChangingPass] = useState(false)
  const [msg, setMsg] = useState('')
  const [passMsg, setPassMsg] = useState('')
  const [err, setErr] = useState('')

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-12 text-center">Loading...</div>
  if (!user) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <Link to="/login" className="text-brand hover:underline">Sign in</Link>
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

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setChangingPass(true); setPassMsg('')
    try {
      await portalAuth.changePassword({ old_password: oldPass, new_password: newPass })
      setPassMsg('Password changed successfully!')
      setOldPass(''); setNewPass('')
    } catch (e: unknown) {
      setPassMsg(e instanceof Error ? e.message : 'Failed')
    } finally { setChangingPass(false) }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Profile</h1>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <p className="text-sm text-gray-500 mb-1">Account</p>
        <p className="font-medium">{user.name}</p>
        <p className="text-sm text-gray-600">{user.email}</p>
        <p className="text-xs text-gray-400 mt-1">Role: {user.role}</p>
      </div>

      {/* Update profile */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Update Profile</h2>
        <form onSubmit={handleProfile} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-black">Name</label>
            <input value={name || user.name} onChange={e => setName(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-brand" />
          </div>
          <div>
            <label className="text-sm font-medium text-black">Phone</label>
            <input value={phone || user.phone || ''} onChange={e => setPhone(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-brand" />
          </div>
          {msg && <p className="text-sm text-green-600">{msg}</p>}
          {err && <p className="text-sm text-red-600">{err}</p>}
          <Button type="submit" loading={saving} size="sm">Save changes</Button>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Change Password</h2>
        <form onSubmit={handlePassword} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-black">Current Password</label>
            <input type="password" required value={oldPass} onChange={e => setOldPass(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-brand" />
          </div>
          <div>
            <label className="text-sm font-medium text-black">New Password</label>
            <input type="password" required value={newPass} onChange={e => setNewPass(e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-brand" />
          </div>
          {passMsg && <p className={`text-sm ${passMsg.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{passMsg}</p>}
          <Button type="submit" loading={changingPass} size="sm">Change password</Button>
        </form>
      </div>
    </div>
  )
}
