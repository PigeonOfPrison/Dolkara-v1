import React from 'react'
import Sidebar from '../panels/Sidebar'

/**
 * SidebarArea - Layout wrapper for the sidebar
 * First column of the grid, full height
 */
export default function SidebarArea() {
  return (
    <nav className="sidebar">
      <Sidebar />
    </nav>
  )
}
