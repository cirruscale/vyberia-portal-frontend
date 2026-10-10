import { Outlet } from 'react-router-dom'
import { CmsAuthProvider } from '../lib/context/CmsAuthContext'
import { CMSSidebar } from '../components/layout/CMSSidebar'

export default function CMSLayout() {
  return (
    <CmsAuthProvider>
      <div className="flex min-h-screen bg-gray-50">
        <CMSSidebar />
        <main className="flex-1 ml-64 overflow-auto p-6" style={{ zoom: 0.9 }}>
          <Outlet />
        </main>
      </div>
    </CmsAuthProvider>
  )
}
