import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCmsAuth } from '@/lib/context/CmsAuthContext'
import { cmsUsers } from '@/lib/api/cms'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import type { User, UserRole } from '@/lib/types'

const inputCls = 'border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500'

const roleColors: Record<string, 'blue' | 'purple' | 'orange' | 'green' | 'gray'> = {
  admin: 'blue', operator: 'purple', merchant: 'orange', customer: 'green',
}

export default function CMSUsersPage() {
  const { user, loading: authLoading } = useCmsAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)

  useEffect(() => {
    if (!authLoading && !user) navigate('/cms/login', { replace: true })
  }, [user, authLoading, navigate])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await cmsUsers.list({
        page, page_size: 20,
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
      })
      setItems(res.data?.items ?? [])
      setTotal(res.data?.total ?? 0)
      setTotalPages(res.data?.total_pages ?? 1)
    } finally { setLoading(false) }
  }, [page, search, roleFilter])

  useEffect(() => { if (user) load() }, [user, load])

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="text-slate-500 text-sm mt-0.5">{total} total users</p>
        </div>
        <Button onClick={() => { setEditUser(null); setShowForm(true) }}>+ Add User</Button>
      </div>

      <div className="flex gap-3 mb-5">
        <input type="text" placeholder="Search name, email, phone..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className={`flex-1 ${inputCls}`} />
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }} className={inputCls}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="operator">Operator</option>
          <option value="merchant">Merchant</option>
          <option value="customer">Customer</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading...
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No users found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead style={{ background: '#F8FAFC' }}>
              <tr>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500">User</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500">Email</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500">Phone</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500">Role</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500">Status</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-indigo-700 text-xs font-bold">
                          {u.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-slate-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{u.email || '—'}</td>
                  <td className="px-5 py-3.5 text-slate-500">{u.phone || '—'}</td>
                  <td className="px-5 py-3.5"><Badge variant={roleColors[u.role] ?? 'gray'}>{u.role}</Badge></td>
                  <td className="px-5 py-3.5"><Badge variant={u.is_active ? 'green' : 'red'}>{u.is_active ? 'Active' : 'Inactive'}</Badge></td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => { setEditUser(u); setShowForm(true) }} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors mr-4">Edit</button>
                    <button onClick={async () => { if (confirm('Delete user?')) { await cmsUsers.delete(u.id); load() } }} className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {showForm && (
        <UserFormModal
          user={editUser}
          onClose={() => { setShowForm(false); setEditUser(null) }}
          onSaved={() => { setShowForm(false); setEditUser(null); load() }}
        />
      )}
    </div>
  )
}

function UserFormModal({ user, onClose, onSaved }: { user: User | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    password: '',
    role: user?.role ?? 'customer',
    is_active: user?.is_active ?? true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const inputCls = 'mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (user) {
        const data: Record<string, unknown> = { name: form.name, phone: form.phone, role: form.role, is_active: form.is_active }
        if (form.password) data.password = form.password
        await cmsUsers.update(user.id, data)
      } else {
        await cmsUsers.create({ ...form, is_active: form.is_active })
      }
      onSaved()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">{user ? 'Edit User' : 'New User'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Name *</label>
            <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inputCls} />
          </div>
          {!user && (
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email *</label>
              <input required type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className={inputCls} />
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone</label>
            <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{user ? 'New Password (leave blank to keep)' : 'Password *'}</label>
            <input type="password" required={!user} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</label>
            <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as UserRole }))} className={inputCls}>
              <option value="customer">Customer</option>
              <option value="merchant">Merchant</option>
              <option value="operator">Operator</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} className="w-4 h-4 rounded text-indigo-600" />
            <span className="text-sm text-slate-700">Active account</span>
          </label>
          {error && <div className="rounded-lg px-4 py-3 text-sm text-red-700" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>{error}</div>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={loading}>{user ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
