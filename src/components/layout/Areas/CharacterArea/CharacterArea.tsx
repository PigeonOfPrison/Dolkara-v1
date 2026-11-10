import PanelHeader from "../../../Commons/PanelHeader/PanelHeader";
import EntitySet from "../../../Commons/EntitySet/EntitySet";
import type { Tab } from "../../../../state/types";
import { useEditorStore } from "../../../../state/editorStore";


export default function CharacterArea() {
    // const type: EntityType = "character"

    const activeTab = useEditorStore(state => state.characterTab);
    const setCharacterTab = useEditorStore(state => state.setCharacterTab);

    const tabs: Tab[] = [
        { id: 'character-set', label: 'Character Set', active: activeTab === 'character-set' },
        // leaving it here so that we don't forget that this also belong here, although we cant access it in the usual fashion
        // only through the charactere-inpector
        // { id: 'animation-editor', label: 'Animation Editor', active: activeTab === 'animation-editor' }
    ];


    return (
        <section className="character-area panel">
            <PanelHeader
                tabs={tabs} 
                onTabChange={(tabId) => setCharacterTab(tabId as typeof activeTab)}
            />
          <div className="panel-body">
            {activeTab === 'character-set' && <EntitySet type = 'character' />}
          </div>
        </section>
    )
}