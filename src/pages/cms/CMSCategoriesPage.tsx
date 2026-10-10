import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCmsAuth } from '@/lib/context/CmsAuthContext'
import { cmsCategories } from '@/lib/api/categories'
import { cmsUpload } from '@/lib/api/upload'
import { Button } from '@/components/ui/Button'
import type { Category } from '@/lib/types'

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand'

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default function CMSCategoriesPage() {
  const { user, loading: authLoading } = useCmsAuth()
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const [catForm, setCatForm] = useState({ name: '', slug: '', description: '', image_url: '' })
  const [catEdit, setCatEdit] = useState<Category | null>(null)
  const [catSaving, setCatSaving] = useState(false)
  const [catUploading, setCatUploading] = useState(false)

  const [subForm, setSubForm] = useState({ name: '', parent_id: '', description: '', image_url: '' })
  const [subSaving, setSubSaving] = useState(false)
  const [subUploading, setSubUploading] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) navigate('/cms/login', { replace: true })
  }, [user, authLoading, navigate])

  const load = useCallback(async () => {
    setLoading(true)
    await Promise.all([
      cmsCategories.list().then(r => { if (r.data) setCategories(r.data) }),
      cmsCategories.listSubcategories().then(r => { if (r.data) setSubcategories(r.data) }),
    ])
    setLoading(false)
  }, [])

  useEffect(() => { if (user) load() }, [user, load])

  const handleCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCatSaving(true)
    try {
      const data = { ...catForm, slug: catForm.slug || slugify(catForm.name) }
      if (catEdit) await cmsCategories.update(catEdit.id, data)
      else await cmsCategories.create(data)
      setCatForm({ name: '', slug: '', description: '', image_url: '' })
      setCatEdit(null)
      load()
    } finally { setCatSaving(false) }
  }

  const handleCatDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return
    await cmsCategories.delete(id)
    load()
  }

  const handleCatImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCatUploading(true)
    try {
      const res = await cmsUpload.single(file, 'categories')
      if (res.data) setCatForm(p => ({ ...p, image_url: res.data!.url }))
    } finally { setCatUploading(false) }
  }

  const handleSubImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSubUploading(true)
    try {
      const res = await cmsUpload.single(file, 'categories')
      if (res.data) setSubForm(p => ({ ...p, image_url: res.data!.url }))
    } finally { setSubUploading(false) }
  }

  const handleSubSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubSaving(true)
    try {
      await cmsCategories.createSubcategory({ ...subForm, name: subForm.name })
      setSubForm({ name: '', parent_id: '', description: '', image_url: '' })
      load()
    } finally { setSubSaving(false) }
  }

  const editCat = (cat: Category) => {
    setCatEdit(cat)
    setCatForm({ name: cat.name, slug: cat.slug, description: cat.description ?? '', image_url: cat.image_url ?? '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) return (
    <div className="p-8 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#C4A87A', borderTopColor: 'transparent' }} />
    </div>
  )

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
        <p className="text-slate-500 text-sm mt-0.5">{categories.length} categories · {subcategories.length} subcategories</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Category form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-sm font-bold text-slate-800 mb-4">{catEdit ? `Edit: ${catEdit.name}` : 'New Category'}</h2>
          <form onSubmit={handleCatSubmit} className="space-y-3">
            <input required placeholder="Name" value={catForm.name} onChange={e => setCatForm(p => ({ ...p, name: e.target.value }))} className={inputCls} />
            <input placeholder="Slug (auto-generated)" value={catForm.slug} onChange={e => setCatForm(p => ({ ...p, slug: e.target.value }))} className={inputCls} />
            <input placeholder="Description" value={catForm.description} onChange={e => setCatForm(p => ({ ...p, description: e.target.value }))} className={inputCls} />
            <div>
              <input placeholder="Image URL" value={catForm.image_url} onChange={e => setCatForm(p => ({ ...p, image_url: e.target.value }))} className={inputCls} />
              <label className="mt-1.5 inline-flex items-center gap-1.5 cursor-pointer text-xs text-brand hover:text-brand-dark font-medium">
                <input type="file" accept="image/*" className="hidden" onChange={handleCatImageUpload} />
                {catUploading ? 'Uploading...' : 'Upload image instead'}
              </label>
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="submit" loading={catSaving} size="sm">{catEdit ? 'Update' : 'Create'}</Button>
              {catEdit && <Button type="button" variant="ghost" size="sm" onClick={() => { setCatEdit(null); setCatForm({ name: '', slug: '', description: '', image_url: '' }) }}>Cancel</Button>}
            </div>
          </form>
        </div>

        {/* Subcategory form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-sm font-bold text-slate-800 mb-4">New Subcategory</h2>
          <form onSubmit={handleSubSubmit} className="space-y-3">
            <select required value={subForm.parent_id} onChange={e => setSubForm(p => ({ ...p, parent_id: e.target.value }))} className={inputCls}>
              <option value="">— Select parent category —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input required placeholder="Subcategory name" value={subForm.name} onChange={e => setSubForm(p => ({ ...p, name: e.target.value }))} className={inputCls} />
            <input placeholder="Description" value={subForm.description} onChange={e => setSubForm(p => ({ ...p, description: e.target.value }))} className={inputCls} />
            <div>
              <input placeholder="Image URL" value={subForm.image_url} onChange={e => setSubForm(p => ({ ...p, image_url: e.target.value }))} className={inputCls} />
              <label className="mt-1.5 inline-flex items-center gap-1.5 cursor-pointer text-xs text-brand hover:text-brand-dark font-medium">
                <input type="file" accept="image/*" className="hidden" onChange={handleSubImageUpload} />
                {subUploading ? 'Uploading...' : 'Upload image instead'}
              </label>
            </div>
            <div className="pt-1">
              <Button type="submit" loading={subSaving} size="sm">Create Subcategory</Button>
            </div>
          </form>
        </div>
      </div>

      {/* Categories table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Categories ({categories.length})</h3>
        </div>
        {categories.length === 0 ? (
          <p className="p-8 text-center text-slate-400 text-sm">No categories yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead style={{ background: '#F8FAFC' }}>
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Slug</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Subcategories</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-900">{cat.name}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-400">{cat.slug}</td>
                  <td className="px-5 py-3.5 text-slate-500">{subcategories.filter(s => s.parent_id === cat.id).length}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => editCat(cat)} className="text-xs font-medium text-brand hover:text-brand-dark transition-colors mr-4">Edit</button>
                    <button onClick={() => handleCatDelete(cat.id)} className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Subcategories table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">Subcategories ({subcategories.length})</h3>
        </div>
        {subcategories.length === 0 ? (
          <p className="p-8 text-center text-slate-400 text-sm">No subcategories yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead style={{ background: '#F8FAFC' }}>
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Parent</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Slug</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {subcategories.map(sub => (
                <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-900">{sub.name}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs px-2 py-1 rounded-md font-medium" style={{ background: '#F5EDE0', color: '#9A7A5A' }}>
                      {categories.find(c => c.id === sub.parent_id)?.name ?? 'Unknown'}
                    </span>

                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-400">{sub.slug}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={async () => { if (confirm('Delete?')) { await cmsCategories.deleteSubcategory(sub.id); load() } }} className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
