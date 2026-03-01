import React, { useState } from 'react';
import PanelHeader from '../components/PanelHeader';
import useEditorStore from '../state/editorStore';
import SceneInspector from '../panels/Inspectors/SceneInspector';
import TileInspector from '../panels/Inspectors/TileInspector';
import EntityInspector from '../panels/Inspectors/EntityInspector';
import CollectibleInspector from '../panels/Inspectors/CollectibleInspector';
import ColoursPalette from '../panels/Inspectors/ColoursPalette';
import ExampleInspector from '../panels/Inspectors/ExampleInspector';

/**
 * InspectorArea - Dynamic inspector panel with tabs
 * Inspector tab shows content based on selection (scene/tile/entity/collectible)
 * Palette tab always shows color palette
 * Column 6, full height
 */
export default function InspectorArea() {
  const inspectorTab = useEditorStore(state => state.inspectorTab);
  const [activeTab, setActiveTab] = useState('inspector');
  
  const tabs = [
    { id: 'inspector', label: 'Inspector', active: activeTab === 'inspector' },
    { id: 'palette', label: 'Palette', active: activeTab === 'palette' }
  ];

  const renderInspector = () => {
    if (activeTab === 'palette') {
      return <ColoursPalette />;
    }
    
    // Inspector tab - show appropriate inspector based on selection
    switch (inspectorTab) {
      case 'scene':
        return <SceneInspector />;
      case 'tile':
        return <TileInspector />;
      case 'entity':
        return <EntityInspector />;
      case 'collectible':
        return <CollectibleInspector />;
      case 'example':
        return <ExampleInspector />;
      default:
        return <SceneInspector />;
    }
  };
  
  return (
    <aside className="inspector-area panel">
      <PanelHeader tabs={tabs} onTabChange={setActiveTab} />
      <div className="panel-body">
        {renderInspector()}
      </div>
    </aside>
  );
}
