import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCmsAuth } from '@/lib/context/CmsAuthContext'
import { cmsCategories } from '@/lib/api/categories'
import { cmsUpload } from '@/lib/api/upload'
import { Button } from '@/components/ui/Button'
import type { Category } from '@/lib/types'

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

  if (loading) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Categories</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">{catEdit ? 'Edit Category' : 'New Category'}</h2>
          <form onSubmit={handleCatSubmit} className="space-y-3">
            <input required placeholder="Name" value={catForm.name} onChange={e => setCatForm(p => ({ ...p, name: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            <input placeholder="Slug (auto)" value={catForm.slug} onChange={e => setCatForm(p => ({ ...p, slug: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            <input placeholder="Description" value={catForm.description} onChange={e => setCatForm(p => ({ ...p, description: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            <div className="space-y-1">
              <input placeholder="Image URL" value={catForm.image_url} onChange={e => setCatForm(p => ({ ...p, image_url: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
              <label className="flex items-center gap-2 cursor-pointer text-xs text-indigo-600 hover:underline">
                <input type="file" accept="image/*" className="hidden" onChange={handleCatImageUpload} />
                {catUploading ? 'Uploading...' : 'or upload image'}
              </label>
            </div>
            <div className="flex gap-2">
              <Button type="submit" loading={catSaving} size="sm">{catEdit ? 'Update' : 'Create'}</Button>
              {catEdit && <Button type="button" variant="ghost" size="sm" onClick={() => { setCatEdit(null); setCatForm({ name: '', slug: '', description: '', image_url: '' }) }}>Cancel</Button>}
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">New Subcategory</h2>
          <form onSubmit={handleSubSubmit} className="space-y-3">
            <select required value={subForm.parent_id} onChange={e => setSubForm(p => ({ ...p, parent_id: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="">— Select parent category —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input required placeholder="Subcategory name" value={subForm.name} onChange={e => setSubForm(p => ({ ...p, name: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            <input placeholder="Description" value={subForm.description} onChange={e => setSubForm(p => ({ ...p, description: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            <div className="space-y-1">
              <input placeholder="Image URL" value={subForm.image_url} onChange={e => setSubForm(p => ({ ...p, image_url: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
              <label className="flex items-center gap-2 cursor-pointer text-xs text-indigo-600 hover:underline">
                <input type="file" accept="image/*" className="hidden" onChange={handleSubImageUpload} />
                {subUploading ? 'Uploading...' : 'or upload image'}
              </label>
            </div>
            <Button type="submit" loading={subSaving} size="sm">Create Subcategory</Button>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h3 className="text-sm font-medium text-gray-700">Categories ({categories.length})</h3>
        </div>
        {categories.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">No categories yet.</p>
        ) : (
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-100">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{cat.slug}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{subcategories.filter(s => s.parent_id === cat.id).length} subcategories</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => editCat(cat)} className="text-indigo-600 hover:underline text-xs mr-3">Edit</button>
                    <button onClick={() => handleCatDelete(cat.id)} className="text-red-600 hover:underline text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h3 className="text-sm font-medium text-gray-700">Subcategories ({subcategories.length})</h3>
        </div>
        {subcategories.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">No subcategories yet.</p>
        ) : (
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-100">
              {subcategories.map(sub => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{sub.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{categories.find(c => c.id === sub.parent_id)?.name ?? 'Unknown'}</td>
                  <td className="px-4 py-3 font-mono text-gray-500 text-xs">{sub.slug}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={async () => { if (confirm('Delete?')) { await cmsCategories.deleteSubcategory(sub.id); load() } }} className="text-red-600 hover:underline text-xs">Delete</button>
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
