import PanelHeader from "../../Commons/PanelHeader/PanelHeader";
import EntitySet from "../../Commons/EntitySet/EntitySet";
import type {Tab} from "../../../state/types";
import { useEditorStore } from "../../../state/editorStore";


/**
 * TileArea - Layout wrapper for tiles and collectibles
 * Second column, top 3 rows
 */
export default function TileArea() {
  const activeTab = useEditorStore(state => state.tileTab);
  const setTileTab = useEditorStore(state => state.setTileTab);

  const tabs: Tab[] = [
    { id: 'tiles', label: 'Tiles', active: activeTab === 'tile-set' },
    { id: 'collectibles', label: 'Collectibles', active: activeTab === 'collectible-set' }
  ]

  return (
    <section className="tile-area panel">
        <PanelHeader
            tabs={tabs} 
            onTabChange={(tabId) => setTileTab(tabId as typeof activeTab)} 
        />
      <div className="panel-body">
        {activeTab === 'tile-set' && <EntitySet  type="tile"/>}
        {activeTab === 'collectible-set' && <EntitySet type="collectible" />}
      </div>
    </section>
  )
}