import PanelHeader from '../components/PanelHeader'
import Tilemap from '../panels/Canvas/Tilemap'
import Entities from '../panels/Canvas/Entities'
import Tiles from '../panels/Canvas/Tiles'
import Collectibles from '../panels/Canvas/Collectibles'
import CreateTileTab from '../panels/Canvas/CreateTileTab'
import CreateEntityTab from '../panels/Canvas/CreateEntityTab'
import CreateCollectibleTab from '../panels/Canvas/CreateCollectibleTab'
import useEditorStore from '../state/editorStore'

/**
 * CanvasArea - Main canvas editor with tabs
 * Columns 3-5, rows 1-4
 * Supports multiple canvas views: Tilemap, Entities, Collectibles
 */
export default function CanvasArea() {
  const canvasTab = useEditorStore(state => state.canvasTab);
  const setCanvasTab = useEditorStore(state => state.setCanvasTab);

  console.log('[CanvasArea] Current canvasTab:', canvasTab);

  const tabs = [
    { id: 'tilemap', label: 'Tilemap', active: canvasTab === 'tilemap' },
    { id: 'tiles', label: 'Tiles', active: canvasTab === 'tiles' },
    { id: 'entities', label: 'Entities', active: canvasTab === 'entities' },
    { id: 'collectibles', label: 'Collectibles', active: canvasTab === 'collectibles' }
  ]

  return (
    <section className="canvas-area panel">
      <PanelHeader tabs={tabs} onTabChange={setCanvasTab} />
      <div className="panel-body">
        {canvasTab === 'tilemap' && <Tilemap />}
        {canvasTab === 'tiles' && <Tiles />}
        {canvasTab === 'entities' && <Entities />}
        {canvasTab === 'collectibles' && <Collectibles />}
        {canvasTab === 'createTile' && <CreateTileTab />}
        {canvasTab === 'createEntity' && <CreateEntityTab />}
        {canvasTab === 'createCollectible' && <CreateCollectibleTab />}
      </div>
    </section>
  )
}
