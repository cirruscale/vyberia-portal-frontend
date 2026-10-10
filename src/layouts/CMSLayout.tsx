import { Outlet } from 'react-router-dom'
import { CmsAuthProvider } from '../lib/context/CmsAuthContext'
import { CMSSidebar } from '../components/layout/CMSSidebar'

export default function CMSLayout() {
  return (
    <CmsAuthProvider>
      <div className="flex min-h-screen bg-gray-50">
        <CMSSidebar />
        <main className="flex-1 ml-60 overflow-auto p-8" style={{ zoom: 0.85 }}>
          <Outlet />
        </main>
      </div>
    </CmsAuthProvider>
  )
}
