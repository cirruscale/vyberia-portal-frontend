import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCmsAuth } from '@/lib/context/CmsAuthContext'
import { cmsUsers } from '@/lib/api/cms'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import type { User, UserRole } from '@/lib/types'

const roleColors: Record<string, 'blue' | 'purple' | 'orange' | 'green' | 'gray'> = {
  admin: 'blue',
  operator: 'purple',
  merchant: 'orange',
  customer: 'green',
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
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users ({total})</h1>
        <Button onClick={() => { setEditUser(null); setShowForm(true) }}>+ Add User</Button>
      </div>

      <div className="flex gap-3 mb-6">
        <input type="text" placeholder="Search name, email, phone..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm" />
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }} className="border border-gray-300 rounded-md px-4 py-2 text-sm">
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="operator">Operator</option>
          <option value="merchant">Merchant</option>
          <option value="customer">Customer</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No users found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Role</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3"><Badge variant={roleColors[u.role] ?? 'gray'}>{u.role}</Badge></td>
                  <td className="px-4 py-3"><Badge variant={u.is_active ? 'green' : 'red'}>{u.is_active ? 'Active' : 'Inactive'}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setEditUser(u); setShowForm(true) }} className="text-indigo-600 hover:underline text-xs mr-3">Edit</button>
                    <button onClick={async () => { if (confirm('Delete user?')) { await cmsUsers.delete(u.id); load() } }} className="text-red-600 hover:underline text-xs">Delete</button>
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
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">{user ? 'Edit User' : 'New User'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-sm text-gray-600">Name *</label>
            <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          {!user && (
            <div>
              <label className="text-sm text-gray-600">Email *</label>
              <input required type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
          )}
          <div>
            <label className="text-sm text-gray-600">Phone</label>
            <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm text-gray-600">{user ? 'New Password (leave blank to keep)' : 'Password *'}</label>
            <input type="password" required={!user} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Role</label>
            <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as UserRole }))} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="customer">Customer</option>
              <option value="merchant">Merchant</option>
              <option value="operator">Operator</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} />
            Active
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={loading}>{user ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
