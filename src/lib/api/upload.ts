import { uploadFile, api } from './client'
import type { ApiResponse, UploadResult } from '../types'

// Portal upload (authenticated users)
export const upload = {
  single: async (file: File, folder = 'general'): Promise<ApiResponse<UploadResult>> => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', folder)
    const res = await uploadFile('/api/v1/upload', fd)
    return res.json()
  },
}

// CMS upload (admin/operator)
export const cmsUpload = {
  single: async (file: File, folder = 'products'): Promise<ApiResponse<UploadResult>> => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', folder)
    const res = await uploadFile('/api/v1/cms/upload', fd, true)
    return res.json()
  },

  multiple: async (files: File[], folder = 'products'): Promise<ApiResponse<UploadResult[]>> => {
    const fd = new FormData()
    files.forEach(f => fd.append('files', f))
    fd.append('folder', folder)
    const res = await uploadFile('/api/v1/cms/upload/multiple', fd, true)
    return res.json()
  },

  delete: (key: string) =>
    api.delete<ApiResponse<void>>(`/api/v1/cms/upload?key=${encodeURIComponent(key)}`, { auth: true, cms: true }),
}
