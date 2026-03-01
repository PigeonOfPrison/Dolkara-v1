import React from 'react';
import useEditorStore from '../state/editorStore';
import Scene from '../model/Scene';
import '../css/ScenesMenu.css';

/**
 * ScenesMenu - Grid display of all scenes with create button
 */
export default function ScenesMenu() {
  const scenes = useEditorStore(state => state.scenes);
  const currentSceneId = useEditorStore(state => state.currentSceneId);
  const createScene = useEditorStore(state => state.createScene);
  const setCurrentScene = useEditorStore(state => state.setCurrentScene);
  const setInspectorTab = useEditorStore(state => state.setInspectorTab);

  const handleCreateScene = () => {
    // Create new scene with default values (20x10)
    // Use simple numeric ID based on current scene count
    const sceneNumber = scenes.length + 1;
    const sceneId = `scene_${sceneNumber}`;
    const sceneName = `Scene ${sceneNumber}`;
    
    // Scene constructor: (id, name, width, height)
    // Pass full name directly, not a base to concatenate
    const newScene = new Scene(sceneId, sceneName, 20, 10);
    
    console.log('[ScenesMenu] Creating new scene:', sceneId, newScene);
    createScene(newScene);
    setInspectorTab('scene');
    console.log('[ScenesMenu] Scene created, inspector set to scene');
  };

  const handleSelectScene = (sceneId) => {
    console.log('[ScenesMenu] Selecting scene:', sceneId);
    setCurrentScene(sceneId);
    setInspectorTab('scene');
    console.log('[ScenesMenu] Scene selected, inspector set to scene');
  };

  return (
    <div className="scenes-menu-container">
      {/* Create New Scene Button */}
      <button
        className="scenes-menu-create-btn"
        onClick={handleCreateScene}
        title="Create New Scene"
      >
        +
      </button>

      {/* Scene Cards */}
      {scenes.map(scene => (
        <button
          key={scene.id}
          className={`scene-card ${scene.id === currentSceneId ? 'active' : ''}`}
          onClick={() => handleSelectScene(scene.id)}
          title={`${scene.name} (${scene.width}×${scene.height})`}
        >
          <div className="scene-card-name">
            {scene.name}
          </div>
          <div className="scene-card-dimensions">
            {scene.width}×{scene.height}
          </div>
        </button>
      ))}
    </div>
  );
}

