'use client'

import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import BreadcrumbNavigation from './Breadcrumb'
import { CommandPalette } from '@/components/CommandPalette'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true) // Default to open on desktop
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false) // New state for collapsed sidebar
  const [isMobile, setIsMobile] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) {
        setSidebarOpen(false) // Close sidebar on mobile by default
        setSidebarCollapsed(false)
      } else {
        setSidebarOpen(true) // Open sidebar on desktop by default
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(prev => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const toggleSidebar = () => {
    if (isMobile) {
      // On mobile, toggle open/close
      setSidebarOpen(!sidebarOpen)
    } else {
      // On desktop, toggle collapsed/expanded
      setSidebarCollapsed(!sidebarCollapsed)
    }
  }

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          isCollapsed={sidebarCollapsed}
          onClose={closeSidebar}
          onToggle={toggleSidebar}
          isMobile={isMobile}
        />

        {/* Command Palette */}
        <CommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
        />

        {/* Main Content */}
        <main
          className={`transition-all duration-300 ease-in-out bg-muted/20 ${
            isMobile
              ? 'ml-0'
              : sidebarCollapsed
                ? 'lg:ml-16'
                : 'lg:ml-64'
          }`}
        >
          <div className="p-8">
            {/* Breadcrumb */}
            <BreadcrumbNavigation />

            {/* Page Content */}
            <div className="mt-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}