import { Outlet } from 'react-router-dom'
import { CmsAuthProvider } from '../lib/context/CmsAuthContext'
import { CMSSidebar } from '../components/layout/CMSSidebar'

export default function CMSLayout() {
  return (
    <CmsAuthProvider>
      <div className="flex min-h-screen" style={{ background: '#F1F5F9' }}>
        <CMSSidebar />
        <main className="flex-1 ml-56 min-h-screen overflow-auto">
          <Outlet />
        </main>
      </div>
    </CmsAuthProvider>
  )
}
