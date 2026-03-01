import React from 'react'
import PanelHeader from '../components/PanelHeader'
import CharacterSet from '../panels/CharacterSet'
import AnimationEditor from '../panels/AnimationEditor'
import useEditorStore from '../state/editorStore'

/**
 * CharacterArea - Horizontal character list
 * Columns 3-5, row 5 (bottom)
 */
export default function CharacterArea() {
  const activeTab = useEditorStore(state => state.characterAreaTab)
  const setActiveTab = useEditorStore(state => state.setCharacterAreaTab)

  const tabs = [
    { id: 'characters', label: 'Characters', active: activeTab !== 'animation' }
  ]

  return (
    <section className="character-area panel">
      <PanelHeader 
        tabs={tabs}
        onTabChange={(tabId) => setActiveTab(tabId)}
      />
      <div className="panel-body">
        {activeTab === 'animation' ? <AnimationEditor /> : <CharacterSet />}
      </div>
    </section>
  )
}
