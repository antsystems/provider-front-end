'use client'

import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TopNavigationProps {
  onMenuClick: () => void
  isSidebarOpen: boolean
}

export default function TopNavigation({ onMenuClick, isSidebarOpen }: TopNavigationProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50 shadow-none">
      <div className="flex items-center justify-between h-12 px-4">
        {/* Left - Sidebar Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="hover:bg-accent/80 transition-colors"
          title="Toggle sidebar"
        >
          <Menu size={18} />
        </Button>

        {/* Right - Future contextual actions can go here */}
        <div className="flex items-center gap-2">
          {/* Reserved for future contextual actions */}
        </div>
      </div>
    </nav>
  )
}