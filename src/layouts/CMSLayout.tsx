import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { CmsAuthProvider } from '../lib/context/CmsAuthContext'
import { CMSSidebar } from '../components/layout/CMSSidebar'

export default function CMSLayout() {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024)
  // sidebar widths: collapsed=4rem, expanded=18rem — kept in sync with CMSSidebar

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 1024) setCollapsed(true)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <CmsAuthProvider>
      <div
        className="cms-root flex"
        style={{ background: '#F1F5F9', height: '100vh', overflow: 'hidden' }}
      >
        <CMSSidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
        <main className="flex-1 overflow-hidden transition-all duration-300" style={{ height: '100%', minHeight: 0 }}>
          <Outlet />
        </main>
      </div>
    </CmsAuthProvider>
  )
}
