import React, { useState } from 'react'
import PanelHeader from '../components/PanelHeader'
import TileSet from '../panels/TileSet'
import CollectibleSet from '../panels/CollectibleSet'

/**
 * TileArea - Layout wrapper for tiles and collectibles
 * Second column, top 3 rows
 */
export default function TileArea() {
  const [activeTab, setActiveTab] = useState('tiles')

  const tabs = [
    { id: 'tiles', label: 'Tiles', active: activeTab === 'tiles' },
    { id: 'collectibles', label: 'Collectibles', active: activeTab === 'collectibles' }
  ]

  return (
    <section className="tile-area panel">
      <PanelHeader tabs={tabs} onTabChange={setActiveTab} />
      <div className="panel-body">
        {activeTab === 'tiles' && <TileSet />}
        {activeTab === 'collectibles' && <CollectibleSet />}
      </div>
    </section>
  )
}
