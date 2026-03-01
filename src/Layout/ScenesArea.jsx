import React from 'react'
import PanelHeader from '../components/PanelHeader'
import ScenesMenu from '../panels/ScenesMenu'

/**
 * Scenes area - List of all scenes
 * Second column, bottom 2 rows
 */
export default function ScenesArea() {
  return (
    <section className="scenes-menu panel">
      <PanelHeader title="Scenes" />
      <div className="panel-body">
        <ScenesMenu />
      </div>
    </section>
  )
}
