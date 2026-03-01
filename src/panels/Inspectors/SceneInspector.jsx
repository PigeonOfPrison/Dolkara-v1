import React from 'react';
import useEditorStore from '../../state/editorStore';
import List from '../../components/List';
import Button from '../../components/Button';
import NumberInput from '../../components/NumberInput';
import ColourPicker from '../../components/ColourPicker';
import { FiCopy, FiTrash2, FiDownload } from 'react-icons/fi';
import { MAX_LAYERS } from '../../constants/hardwareLimits';
import '../../css/SceneInspector.css';

/**
 * SceneInspector - Edit scene properties, palette, spawn points, and exits
 */
export default function SceneInspector() {
  const currentSceneId = useEditorStore(state => state.currentSceneId);
  const scenes = useEditorStore(state => state.scenes);
  const updateScene = useEditorStore(state => state.updateScene);
  const createScene = useEditorStore(state => state.createScene);
  const deleteScene = useEditorStore(state => state.deleteScene);
  const exportCurrentScene = useEditorStore(state => state.exportCurrentScene);
  const setPaletteColor = useEditorStore(state => state.setPaletteColor);
  const resetPalette = useEditorStore(state => state.resetPalette);
  const selectedColourId = useEditorStore(state => state.selectedColourId);
  const setSelectedColourId = useEditorStore(state => state.setSelectedColourId);
  
  const currentScene = scenes.find(s => s.id === currentSceneId);

  if (!currentScene) {
    return (
      <div className="scene-inspector-empty">
        <p>No scene selected</p>
        <p>
          Select a scene from the Scenes panel or create a new one.
        </p>
      </div>
    );
  }

  const handleNameChange = (e) => {
    const newName = e.target.value;
    try {
      // Validate name (non-empty string)
      if (typeof newName !== 'string' || newName.trim() === '') {
        console.error('Name must be a non-empty string');
        return;
      }
      // Update store directly without mutating currentScene
      updateScene(currentSceneId, { name: newName.trim() });
    } catch (error) {
      console.error('Failed to update scene name:', error);
    }
  };

  const handleDimensionChange = (newWidth, newHeight) => {
    try {
      // Validate dimensions
      if (newWidth < 1 || newWidth > 64 || newHeight < 1 || newHeight > 64) {
        console.error('Dimensions must be between 1 and 64');
        return;
      }

      // Create new resized layers
      const numTerrainLayers = currentScene.terrainLayers.length;
      const newTerrainLayers = Array(numTerrainLayers).fill(null).map(() =>
        Array(newHeight).fill(null).map(() => Array(newWidth).fill(-1))
      );
      const newEntityLayer = Array(newHeight).fill(null).map(() => Array(newWidth).fill(-1));
      const newCollectibleLayer = Array(newHeight).fill(null).map(() => Array(newWidth).fill(-1));
      
      // Copy existing data from current layers
      const copyWidth = Math.min(currentScene.width, newWidth);
      const copyHeight = Math.min(currentScene.height, newHeight);
      
      for (let layer = 0; layer < numTerrainLayers; layer++) {
        for (let y = 0; y < copyHeight; y++) {
          for (let x = 0; x < copyWidth; x++) {
            newTerrainLayers[layer][y][x] = currentScene.terrainLayers[layer][y][x];
          }
        }
      }
      
      for (let y = 0; y < copyHeight; y++) {
        for (let x = 0; x < copyWidth; x++) {
          newEntityLayer[y][x] = currentScene.entityLayer[y][x];
          newCollectibleLayer[y][x] = currentScene.collectibleLayer[y][x];
        }
      }

      // Update store directly without mutating currentScene
      updateScene(currentSceneId, { 
        width: newWidth, 
        height: newHeight,
        terrainLayers: newTerrainLayers,
        entityLayer: newEntityLayer,
        collectibleLayer: newCollectibleLayer
      });
    } catch (error) {
      console.error('Failed to resize scene:', error);
    }
  };

  const handleLayersChange = (newLayers) => {
    try {
      // Validate layers (minimum 3: 1 terrain + 1 entity + 1 collectible)
      if (newLayers < 3 || newLayers > MAX_LAYERS) {
        console.error(`Layers must be between 3 and ${MAX_LAYERS}`);
        return;
      }

      // Calculate number of terrain layers (last 2 layers are entity and collectible)
      const numTerrainLayers = newLayers - 2;
      
      // Create new terrain layers array
      const newTerrainLayers = Array(numTerrainLayers).fill(null).map(() =>
        Array(currentScene.height).fill(null).map(() => Array(currentScene.width).fill(-1))
      );
      
      // Copy existing terrain data
      const copyLayers = Math.min(currentScene.terrainLayers.length, numTerrainLayers);
      for (let layer = 0; layer < copyLayers; layer++) {
        for (let y = 0; y < currentScene.height; y++) {
          for (let x = 0; x < currentScene.width; x++) {
            newTerrainLayers[layer][y][x] = currentScene.terrainLayers[layer][y][x];
          }
        }
      }

      // Update store
      updateScene(currentSceneId, {
        layers: newLayers,
        terrainLayers: newTerrainLayers
      });
    } catch (error) {
      console.error('Failed to change layers:', error);
    }
  };

  const handlePaletteColorChange = (index, color) => {
    try {
      console.log('[SceneInspector] Color changed:', index, color);
      setPaletteColor(index, color);
    } catch (error) {
      console.error('Failed to update palette color:', error);
    }
  };

  const handleResetPalette = () => {
    try {
      console.log('[SceneInspector] Resetting palette');
      resetPalette();
    } catch (error) {
      console.error('Failed to reset palette:', error);
    }
  };

  // Spawn Points
  const handleAddSpawnPoint = () => {
    const newName = `spawn_${currentScene.spawnPoints.length}`;
    // Create new spawn points array with the new item
    const updatedSpawnPoints = [...currentScene.spawnPoints, { name: newName, x: 0, y: 0 }];
    console.log('[SceneInspector] Adding spawn point:', newName, updatedSpawnPoints);
    updateScene(currentSceneId, { spawnPoints: updatedSpawnPoints });
  };

  const handleDeleteSpawnPoint = (index) => {
    const spawnPoint = currentScene.spawnPoints[index];
    if (spawnPoint.name === 'default') {
      alert('Cannot delete the default spawn point');
      return;
    }
    console.log('[SceneInspector] Deleting spawn point:', spawnPoint.name);
    // Create new array without the deleted item
    const updatedSpawnPoints = currentScene.spawnPoints.filter((_, i) => i !== index);
    updateScene(currentSceneId, { spawnPoints: updatedSpawnPoints });
  };

  const handleUpdateSpawnPoint = (index, field, value) => {
    // Create new array with updated item
    const updatedSpawnPoints = currentScene.spawnPoints.map((sp, i) => 
      i === index ? { ...sp, [field]: value } : sp
    );
    updateScene(currentSceneId, { spawnPoints: updatedSpawnPoints });
  };

  // Exits
  const handleAddExit = () => {
    console.log('[SceneInspector] Adding exit, current count:', currentScene.exits.length);
    // Create new exits array with the new item
    const newExit = {
      name: `exit_${currentScene.exits.length}`,
      x: 0,
      y: 0,
      width: 1,
      height: 1,
      targetScene: '',
      targetSpawn: 'default',
      requirement: 'no'
    };
    const updatedExits = [...currentScene.exits, newExit];
    console.log('[SceneInspector] Exit added, new count:', updatedExits.length);
    updateScene(currentSceneId, { exits: updatedExits });
  };

  const handleDeleteExit = (index) => {
    console.log('[SceneInspector] Deleting exit at index:', index);
    // Create new array without the deleted item
    const updatedExits = currentScene.exits.filter((_, i) => i !== index);
    updateScene(currentSceneId, { exits: updatedExits });
  };

  const handleUpdateExit = (index, field, value) => {
    // Create new array with updated item
    const updatedExits = currentScene.exits.map((exit, i) => 
      i === index ? { ...exit, [field]: value } : exit
    );
    updateScene(currentSceneId, { exits: updatedExits });
  };

  const handleCloneScene = () => {
    if (!currentScene) return;
    const clonedScene = currentScene.clone();
    clonedScene.id = Date.now();
    clonedScene.name = currentScene.name + '_copy';
    createScene(clonedScene);
  };

  const handleDeleteScene = () => {
    if (!currentScene) return;
    if (scenes.length <= 1) {
      alert('Cannot delete the last scene');
      return;
    }
    if (window.confirm(`Delete scene "${currentScene.name}"?`)) {
      deleteScene(currentSceneId);
    }
  };

  const handleExportScene = async () => {
    if (!currentScene) return;
    await exportCurrentScene();
  };

  return (
    <div className="scene-inspector-container">
      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '12px', padding: '0' }}>
        <Button
          variant="secondary"
          size="small"
          icon={<FiDownload />}
          onClick={handleExportScene}
          title="Export Scene"
          style={{ flex: 1, minWidth: 0 }}
        />
        <Button
          variant="secondary"
          size="small"
          icon={<FiCopy />}
          onClick={handleCloneScene}
          title="Clone Scene"
          style={{ flex: 1, minWidth: 0 }}
        />
        <Button
          variant="secondary"
          size="small"
          icon={<FiTrash2 />}
          onClick={handleDeleteScene}
          title="Delete Scene"
          style={{ flex: 1, minWidth: 0 }}
          disabled={scenes.length <= 1}
        />
      </div>

      {/* Scene Properties */}
      <section>
        <h2 className="scene-inspector-section-title">Scene Properties</h2>
        
        {/* Name */}
        <div className="inspector-row">
          <label className="inspector-row-label">Name</label>
          <input
            type="text"
            value={currentScene.name}
            onChange={handleNameChange}
          />
        </div>

        {/* Width */}
        <div className="inspector-row">
          <label className="inspector-row-label">Width</label>
          <NumberInput
            value={currentScene.width}
            onChange={(val) => handleDimensionChange(val, currentScene.height)}
            min={1}
            max={64}
            size="small"
          />
        </div>

        {/* Height */}
        <div className="inspector-row">
          <label className="inspector-row-label">Height</label>
          <NumberInput
            value={currentScene.height}
            onChange={(val) => handleDimensionChange(currentScene.width, val)}
            min={1}
            max={64}
            size="small"
          />
        </div>

        {/* Layers */}
        <div className="inspector-row">
          <label className="inspector-row-label">Layers</label>
          <NumberInput
            value={currentScene.layers}
            onChange={(val) => handleLayersChange(val)}
            min={3}
            max={MAX_LAYERS}
            size="small"
          />
        </div>
      </section>

      {/* Palette Editor */}
      <section>
        <h2 className="scene-inspector-section-title">Palette Editor</h2>
        
        <ColourPicker
          mode="scene"
          palette={currentScene.palette.colours}
          selectedIndex={selectedColourId}
          onColorSelect={(index) => {
            console.log('[SceneInspector] Color selected:', index);
            setSelectedColourId(index);
          }}
          onColorChange={handlePaletteColorChange}
        />

        <Button
          variant="secondary"
          size="small"
          onClick={handleResetPalette}
          className="inspector-add-button"
        >
          Reset to Default
        </Button>
      </section>

      {/* Spawn Points */}
      <section>
        <h2 className="scene-inspector-section-title">Spawn Points</h2>
        <List
          items={currentScene.spawnPoints}
          onAdd={handleAddSpawnPoint}
          onDelete={handleDeleteSpawnPoint}
          addLabel="Add Spawn Point"
          emptyMessage="No spawn points (at least one required)"
          renderItem={(spawnPoint, index) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div className="inspector-row">
                <label className="inspector-row-label">ID</label>
                <input
                  type="text"
                  value={spawnPoint.name}
                  onChange={(e) => handleUpdateSpawnPoint(index, 'name', e.target.value)}
                  placeholder="Spawn ID"
                  disabled={spawnPoint.name === 'default'}
                />
              </div>
              <div className="inspector-row">
                <label className="inspector-row-label">Position</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                  <NumberInput
                    value={spawnPoint.x}
                    onChange={(val) => handleUpdateSpawnPoint(index, 'x', val)}
                    min={0}
                    max={currentScene.width - 1}
                    size="small"
                    placeholder="X"
                  />
                  <NumberInput
                    value={spawnPoint.y}
                    onChange={(val) => handleUpdateSpawnPoint(index, 'y', val)}
                    min={0}
                    max={currentScene.height - 1}
                    size="small"
                    placeholder="Y"
                  />
                </div>
              </div>
            </div>
          )}
        />
      </section>

      {/* Exits */}
      <section>
        <h2 className="scene-inspector-section-title">Exits</h2>
        <List
          items={currentScene.exits}
          onAdd={handleAddExit}
          onDelete={handleDeleteExit}
          addLabel="Add Exit"
          emptyMessage="No exits defined"
          renderItem={(exit, index) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {/* Name */}
              <div className="inspector-row">
                <label className="inspector-row-label">Name</label>
                <input
                  type="text"
                  value={exit.name}
                  onChange={(e) => handleUpdateExit(index, 'name', e.target.value)}
                  placeholder="Exit Name"
                />
              </div>
              
              {/* Position */}
              <div className="inspector-row">
                <label className="inspector-row-label">Position</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                  <NumberInput
                    value={exit.x}
                    onChange={(val) => handleUpdateExit(index, 'x', val)}
                    min={0}
                    max={currentScene.width - 1}
                    size="small"
                    placeholder="X"
                  />
                  <NumberInput
                    value={exit.y}
                    onChange={(val) => handleUpdateExit(index, 'y', val)}
                    min={0}
                    max={currentScene.height - 1}
                    size="small"
                    placeholder="Y"
                  />
                </div>
              </div>

              {/* Size */}
              <div className="inspector-row">
                <label className="inspector-row-label">Size</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                  <NumberInput
                    value={exit.width}
                    onChange={(val) => handleUpdateExit(index, 'width', val)}
                    min={1}
                    max={10}
                    size="small"
                    placeholder="W"
                  />
                  <NumberInput
                    value={exit.height}
                    onChange={(val) => handleUpdateExit(index, 'height', val)}
                    min={1}
                    max={10}
                    size="small"
                    placeholder="H"
                  />
                </div>
              </div>

              {/* Target Scene */}
              <div className="inspector-row">
                <label className="inspector-row-label">Target Scene</label>
                <select
                  value={exit.targetScene}
                  onChange={(e) => handleUpdateExit(index, 'targetScene', e.target.value)}
                >
                  <option value="">Select Scene</option>
                  {scenes.map(scene => (
                    <option key={scene.id} value={scene.id}>
                      {scene.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Spawn */}
              <div className="inspector-row">
                <label className="inspector-row-label">Target Spawn</label>
                <input
                  type="text"
                  value={exit.targetSpawn}
                  onChange={(e) => handleUpdateExit(index, 'targetSpawn', e.target.value)}
                  placeholder="Spawn ID"
                />
              </div>

              {/* Requirement */}
              <div className="inspector-row">
                <label className="inspector-row-label">Requirement</label>
                <select
                  value={exit.requirement}
                  onChange={(e) => handleUpdateExit(index, 'requirement', e.target.value)}
                >
                  <option value="no">None</option>
                  {Array.from({ length: 64 }, (_, i) => i + 1).map(itemId => (
                    <option key={itemId} value={itemId}>
                      Item #{itemId}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        />
      </section>
    </div>
  );
}
