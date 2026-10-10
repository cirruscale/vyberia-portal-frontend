import { Outlet } from 'react-router-dom'
import { CmsAuthProvider } from '../lib/context/CmsAuthContext'
import { CMSSidebar } from '../components/layout/CMSSidebar'

export default function CMSLayout() {
  return (
    <CmsAuthProvider>
      <div className="flex" style={{ background: '#F1F5F9', minHeight: '100vh' }}>
        <CMSSidebar />
        <main className="flex-1 ml-56 overflow-auto" style={{ minHeight: '100vh' }}>
          <Outlet />
        </main>
      </div>
    </CmsAuthProvider>
  )
}
