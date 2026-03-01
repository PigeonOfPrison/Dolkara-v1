import React, { useEffect } from 'react';
import useEditorStore from '../../state/editorStore';
import Button from '../../components/Button';
import NumberInput from '../../components/NumberInput';
import ColourPicker from '../../components/ColourPicker';
import { FiEdit2, FiCopy, FiTrash2, FiPlay, FiSave, FiX } from 'react-icons/fi';
import { MdFlip, MdRoute } from 'react-icons/md';
import { flipHorizontally, flipVertically } from '../../utils/grid';
import '../../css/TileInspector.css'; // Reuse tile inspector styles

/**
 * EntityInspector - Edit entity properties
 */
export default function EntityInspector() {
  const selectedEntityId = useEditorStore(state => state.selectedEntityId);
  const scenes = useEditorStore(state => state.scenes);
  const currentSceneId = useEditorStore(state => state.currentSceneId);
  const updateEntity = useEditorStore(state => state.updateEntity);
  const addEntityToCurrentScene = useEditorStore(state => state.addEntityToCurrentScene);
  const deleteEntity = useEditorStore(state => state.deleteEntity);
  const updateScene = useEditorStore(state => state.updateScene);
  const setCanvasTab = useEditorStore(state => state.setCanvasTab);
  const canvasTab = useEditorStore(state => state.canvasTab);
  const getCurrentPalette = useEditorStore(state => state.getCurrentPalette);
  const selectedColourId = useEditorStore(state => state.selectedColourId);
  const setSelectedColourId = useEditorStore(state => state.setSelectedColourId);
  const setCharacterAreaTab = useEditorStore(state => state.setCharacterAreaTab);
  const editingFrameIndex = useEditorStore(state => state.editingFrameIndex);
  const characterAreaTab = useEditorStore(state => state.characterAreaTab);
  
  // Patrol path functions - using a fallback to detect missing functions
  const startPatrolPathRecording = useEditorStore(state => state.startPatrolPathRecording) || (() => console.error('startPatrolPathRecording not found in store'));
  const isRecordingPatrolPath = useEditorStore(state => state.isRecordingPatrolPath) ?? false;
  const savePatrolPath = useEditorStore(state => state.savePatrolPath) || (() => console.error('savePatrolPath not found in store'));
  const discardPatrolPath = useEditorStore(state => state.discardPatrolPath) || (() => console.error('discardPatrolPath not found in store'));

  // Get selected entity from current scene
  const currentScene = scenes.find(s => s.id === currentSceneId);
  const selectedEntity = currentScene?.entities.find(e => e.id === selectedEntityId);
  
  const palette = getCurrentPalette()?.colours || [];
  // Enable color picker when editing entity OR when animation tab is active OR editing animation frame
  const isEditingEntity = canvasTab === 'createEntity' || characterAreaTab === 'animation' || editingFrameIndex !== null;

  // Debug: Check if functions exist (must be before early return)
  useEffect(() => {
    const state = useEditorStore.getState();
    console.log('[EntityInspector] Patrol path functions available:', {
      startPatrolPathRecording: typeof state.startPatrolPathRecording,
      savePatrolPath: typeof state.savePatrolPath,
      discardPatrolPath: typeof state.discardPatrolPath,
      isRecordingPatrolPath: state.isRecordingPatrolPath
    });
  }, []);

  if (!selectedEntity) {
    return (
      <div className="tile-inspector-empty">
        <p>No entity selected</p>
        <p>
          Select an entity from the Character Set panel or create a new one.
        </p>
      </div>
    );
  }

  const handleNameChange = (e) => {
    try {
      updateEntity(selectedEntityId, { name: e.target.value });
    } catch (error) {
      console.error('Failed to update entity name:', error);
    }
  };

  const handleTagChange = (e) => {
    try {
      updateEntity(selectedEntityId, { tag: e.target.value });
    } catch (error) {
      console.error('Failed to update entity tag:', error);
    }
  };

  const handleHealthChange = (value) => {
    try {
      updateEntity(selectedEntityId, { health: value });
    } catch (error) {
      console.error('Failed to update entity health:', error);
    }
  };

  const handleDamageChange = (value) => {
    try {
      updateEntity(selectedEntityId, { damage: value });
    } catch (error) {
      console.error('Failed to update entity damage:', error);
    }
  };

  const handleSpeedChange = (value) => {
    try {
      updateEntity(selectedEntityId, { speed: value });
    } catch (error) {
      console.error('Failed to update entity speed:', error);
    }
  };

  const handleCanJumpChange = (e) => {
    try {
      updateEntity(selectedEntityId, { canJump: e.target.checked });
    } catch (error) {
      console.error('Failed to update entity canJump:', error);
    }
  };

  const handleCanFlyChange = (e) => {
    try {
      updateEntity(selectedEntityId, { canFly: e.target.checked });
    } catch (error) {
      console.error('Failed to update entity canFly:', error);
    }
  };

  const handleDropCurrencyChange = (value) => {
    try {
      updateEntity(selectedEntityId, { dropCurrency: value });
    } catch (error) {
      console.error('Failed to update entity dropCurrency:', error);
    }
  };

  const handleDropChanceChange = (value) => {
    try {
      updateEntity(selectedEntityId, { dropChance: value });
    } catch (error) {
      console.error('Failed to update entity dropChance:', error);
    }
  };

  const handleEditEntity = () => {
    setCanvasTab('createEntity');
  };

  const handleEditAnimation = () => {
    setCharacterAreaTab('animation');
  };

  const handleStartPatrolPath = () => {
    if (!selectedEntity || !currentScene) return;
    if (selectedEntity.tag.toLowerCase() === 'player') {
      alert('Players cannot have patrol paths');
      return;
    }
    
    // Find where the entity is placed in the scene
    let entityPosition = null;
    for (let y = 0; y < currentScene.height; y++) {
      for (let x = 0; x < currentScene.width; x++) {
        const entityIndex = currentScene.entityLayer[y][x];
        if (entityIndex !== -1) {
          const entity = currentScene.entities[entityIndex];
          if (entity && entity.id === selectedEntityId) {
            entityPosition = { x, y };
            break;
          }
        }
      }
      if (entityPosition) break;
    }
    
    if (!entityPosition) {
      alert('Entity must be placed on the map to create a patrol path');
      return;
    }
    
    startPatrolPathRecording(selectedEntityId, entityPosition);
  };
  
  const handleSavePatrolPath = () => {
    savePatrolPath();
  };
  
  const handleDiscardPatrolPath = () => {
    discardPatrolPath();
  };

  const handleCloneEntity = () => {
    if (!selectedEntity || !currentScene) return;
    const clonedEntity = selectedEntity.clone();
    clonedEntity.id = Date.now();
    clonedEntity.name = selectedEntity.name + '_copy';
    
    // Clone the character frame
    const defaultAnim = selectedEntity.animations[selectedEntity.defaultAnimation];
    if (defaultAnim && defaultAnim.frameIds.length > 0) {
      const originalFrameIndex = defaultAnim.frameIds[0];
      const originalFrame = currentScene.characterFrames[originalFrameIndex];
      if (originalFrame) {
        const newFrameIndex = currentScene.characterFrames.length;
        currentScene.characterFrames.push([...originalFrame]);
        clonedEntity.animations[clonedEntity.defaultAnimation].frameIds[0] = newFrameIndex;
        updateScene(currentSceneId, { characterFrames: currentScene.characterFrames });
      }
    }
    
    addEntityToCurrentScene(clonedEntity);
  };

  const handleDeleteEntity = () => {
    if (!selectedEntity) return;
    // Direct deletion without confirmation (Tauri dialog permission issue)
    deleteEntity(selectedEntityId);
  };

  const handleFlipHorizontal = () => {
    if (!selectedEntity || !currentScene) return;
    const defaultAnim = selectedEntity.animations[selectedEntity.defaultAnimation];
    if (!defaultAnim || defaultAnim.frameIds.length === 0) return;
    
    const frameIndex = defaultAnim.frameIds[0];
    const framePixels = currentScene.characterFrames[frameIndex];
    if (!framePixels) return;
    
    // Convert 1D to 2D (16x16)
    const pixels2D = [];
    for (let y = 0; y < 16; y++) {
      pixels2D.push(framePixels.slice(y * 16, (y + 1) * 16));
    }
    
    flipHorizontally(pixels2D);
    const pixels1D = pixels2D.flat();
    
    currentScene.characterFrames[frameIndex] = pixels1D;
    updateScene(currentSceneId, { characterFrames: [...currentScene.characterFrames] });
  };

  const handleFlipVertical = () => {
    if (!selectedEntity || !currentScene) return;
    const defaultAnim = selectedEntity.animations[selectedEntity.defaultAnimation];
    if (!defaultAnim || defaultAnim.frameIds.length === 0) return;
    
    const frameIndex = defaultAnim.frameIds[0];
    const framePixels = currentScene.characterFrames[frameIndex];
    if (!framePixels) return;
    
    // Convert 1D to 2D (16x16)
    const pixels2D = [];
    for (let y = 0; y < 16; y++) {
      pixels2D.push(framePixels.slice(y * 16, (y + 1) * 16));
    }
    
    flipVertically(pixels2D);
    const pixels1D = pixels2D.flat();
    
    currentScene.characterFrames[frameIndex] = pixels1D;
    updateScene(currentSceneId, { characterFrames: [...currentScene.characterFrames] });
  };

  return (
    <div className="tile-inspector-container">
      {/* Action Buttons Row 1 */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px', padding: '0' }}>
        <Button
          variant="secondary"
          size="small"
          icon={<FiEdit2 />}
          onClick={handleEditEntity}
          title="Edit Entity Pixels"
          style={{ flex: 1, minWidth: 0 }}
        />
        <Button
          variant="secondary"
          size="small"
          icon={<FiCopy />}
          onClick={handleCloneEntity}
          title="Clone Entity"
          style={{ flex: 1, minWidth: 0 }}
        />
        <Button
          variant="secondary"
          size="small"
          icon={<FiTrash2 />}
          onClick={handleDeleteEntity}
          title="Delete Entity"
          style={{ flex: 1, minWidth: 0 }}
        />
        <Button
          variant="secondary"
          size="small"
          icon={<MdFlip />}
          onClick={handleFlipHorizontal}
          title="Flip Horizontal"
          style={{ flex: 1, minWidth: 0 }}
        />
        <Button
          variant="secondary"
          size="small"
          icon={<MdFlip style={{ transform: 'rotate(90deg)' }} />}
          onClick={handleFlipVertical}
          title="Flip Vertical"
          style={{ flex: 1, minWidth: 0 }}
        />
      </div>

      {/* Animation Row */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px', padding: '0' }}>
        <Button
          variant="primary"
          size="small"
          icon={<FiPlay />}
          onClick={handleEditAnimation}
          title="Edit Animations"
          style={{ flex: 2, minWidth: 0 }}
        >
          Animation
        </Button>
        <Button
          variant="secondary"
          size="small"
          icon={<FiSave />}
          onClick={() => {/* Animation save logic will be in AnimationEditor */}}
          title="Save Animation"
          style={{ flex: 1, minWidth: 0 }}
          disabled
        >
          Save
        </Button>
        <Button
          variant="secondary"
          size="small"
          icon={<FiX />}
          onClick={() => {/* Animation discard logic will be in AnimationEditor */}}
          title="Discard Animation Changes"
          style={{ flex: 1, minWidth: 0 }}
          disabled
        >
          Discard
        </Button>
      </div>

      {/* Patrol Path Row */}
      {/* TODO: Implement entity instances system to support per-placement patrol paths */}
      {selectedEntity && selectedEntity.tag.toLowerCase() !== 'player' && (
        <div style={{ display: 'flex', gap: '4px', marginBottom: '12px', padding: '0' }}>
          <Button
            variant="primary"
            size="small"
            icon={<MdRoute />}
            onClick={handleStartPatrolPath}
            title="Feature disabled - Requires entity instances refactor"
            style={{ flex: 2, minWidth: 0 }}
            disabled={true}
          >
            Patrol Path
          </Button>
          <Button
            variant="success"
            size="small"
            icon={<FiSave />}
            onClick={handleSavePatrolPath}
            title="Save Patrol Path"
            style={{ flex: 1, minWidth: 0 }}
            disabled={true}
          >
            Save
          </Button>
          <Button
            variant="danger"
            size="small"
            icon={<FiX />}
            onClick={handleDiscardPatrolPath}
            title="Discard Patrol Path"
            style={{ flex: 1, minWidth: 0 }}
            disabled={true}
          >
            Discard
          </Button>
        </div>
      )}

      {/* Entity Properties */}
      <section>
        <h2 className="tile-inspector-section-title">Entity Properties</h2>
        
        {/* ID (Read-only) */}
        <div className="tile-inspector-row">
          <label className="tile-inspector-row-label">ID</label>
          <input
            type="text"
            value={selectedEntity.id}
            disabled
            style={{ opacity: 0.6 }}
          />
        </div>

        {/* Name */}
        <div className="tile-inspector-row">
          <label className="tile-inspector-row-label">Name</label>
          <input
            type="text"
            value={selectedEntity.name}
            onChange={handleNameChange}
            placeholder="Entity Name"
          />
        </div>

        {/* Tag */}
        <div className="tile-inspector-row">
          <label className="tile-inspector-row-label">Tag</label>
          <input
            type="text"
            value={selectedEntity.tag}
            onChange={handleTagChange}
            placeholder="player, enemy, npc..."
          />
        </div>

        {/* Health */}
        <div className="tile-inspector-row">
          <label className="tile-inspector-row-label">Health</label>
          <NumberInput
            value={selectedEntity.health}
            onChange={handleHealthChange}
            min={0}
            max={65535}
            size="small"
          />
        </div>

        {/* Damage */}
        <div className="tile-inspector-row">
          <label className="tile-inspector-row-label">Damage</label>
          <NumberInput
            value={selectedEntity.damage}
            onChange={handleDamageChange}
            min={0}
            max={255}
            size="small"
          />
        </div>

        {/* Speed */}
        <div className="tile-inspector-row">
          <label className="tile-inspector-row-label">Speed</label>
          <NumberInput
            value={selectedEntity.speed}
            onChange={handleSpeedChange}
            min={0}
            max={255}
            size="small"
          />
        </div>

        {/* Can Jump */}
        <div className="tile-inspector-row">
          <label className="tile-inspector-row-label">Can Jump</label>
          <input
            type="checkbox"
            checked={selectedEntity.canJump}
            onChange={handleCanJumpChange}
          />
        </div>

        {/* Can Fly */}
        <div className="tile-inspector-row">
          <label className="tile-inspector-row-label">Can Fly</label>
          <input
            type="checkbox"
            checked={selectedEntity.canFly}
            onChange={handleCanFlyChange}
          />
        </div>

        {/* Drop Currency */}
        <div className="tile-inspector-row">
          <label className="tile-inspector-row-label">Drop Currency</label>
          <NumberInput
            value={selectedEntity.dropCurrency}
            onChange={handleDropCurrencyChange}
            min={0}
            max={4294967295}
            size="small"
          />
        </div>

        {/* Drop Chance */}
        <div className="tile-inspector-row">
          <label className="tile-inspector-row-label">Drop Chance (%)</label>
          <NumberInput
            value={selectedEntity.dropChance}
            onChange={handleDropChanceChange}
            min={0}
            max={100}
            size="small"
          />
        </div>
      </section>

      {/* Color Palette - Only interactive when editing */}
      <section>
        <h2 className="tile-inspector-section-title">Color Palette</h2>
        {!isEditingEntity && (
          <p className="tile-inspector-palette-hint">
            Click "Edit Entity" or "Animation" to select colors
          </p>
        )}
        <div className={!isEditingEntity ? 'tile-inspector-palette-disabled' : ''}>
          <ColourPicker
            mode="select"
            palette={palette}
            selectedIndex={selectedColourId}
            onColorSelect={(index) => {
              setSelectedColourId(index);
            }}
            disabled={!isEditingEntity}
          />
        </div>
      </section>
    </div>
  );
}
