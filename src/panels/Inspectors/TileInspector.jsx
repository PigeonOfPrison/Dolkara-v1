import React from 'react';
import useEditorStore from '../../state/editorStore';
import Button from '../../components/Button';
import NumberInput from '../../components/NumberInput';
import ColourPicker from '../../components/ColourPicker';
import { FiEdit2, FiCopy, FiTrash2 } from 'react-icons/fi';
import { MdFlip } from 'react-icons/md';
import { flipHorizontally, flipVertically } from '../../utils/grid';
import { MAX_LAYERS } from '../../constants/hardwareLimits';
import '../../css/TileInspector.css';

/**
 * TileInspector - Edit tile properties
 */
export default function TileInspector() {
  const selectedTileId = useEditorStore(state => state.selectedTileId);
  const scenes = useEditorStore(state => state.scenes);
  const currentSceneId = useEditorStore(state => state.currentSceneId);
  const updateTile = useEditorStore(state => state.updateTile);
  const addTileToCurrentScene = useEditorStore(state => state.addTileToCurrentScene);
  const deleteTile = useEditorStore(state => state.deleteTile);
  const setCanvasTab = useEditorStore(state => state.setCanvasTab);
  const canvasTab = useEditorStore(state => state.canvasTab);
  const getCurrentPalette = useEditorStore(state => state.getCurrentPalette);
  const selectedColourId = useEditorStore(state => state.selectedColourId);
  const setSelectedColourId = useEditorStore(state => state.setSelectedColourId);

  // Get selected tile from current scene
  const currentScene = scenes.find(s => s.id === currentSceneId);
  const selectedTile = currentScene?.tiles.find(t => t.id === selectedTileId);
  
  const palette = getCurrentPalette()?.colours || [];
  const isEditingTile = canvasTab === 'createTile';

  if (!selectedTile) {
    return (
      <div className="tile-inspector-empty">
        <p>No tile selected</p>
        <p>
          Select a tile from the Tile Set panel or create a new one.
        </p>
      </div>
    );
  }

  const handleNameChange = (e) => {
    const newName = e.target.value;
    try {
      updateTile(selectedTileId, { name: newName });
    } catch (error) {
      console.error('Failed to update tile name:', error);
    }
  };

  const handleTagChange = (e) => {
    const newTag = e.target.value;
    try {
      updateTile(selectedTileId, { tag: newTag });
    } catch (error) {
      console.error('Failed to update tile tag:', error);
    }
  };

  const handleSolidChange = (e) => {
    const newSolid = e.target.checked;
    try {
      updateTile(selectedTileId, { solid: newSolid });
    } catch (error) {
      console.error('Failed to update tile solid:', error);
    }
  };

  const handleOpacityChange = (value) => {
    try {
      updateTile(selectedTileId, { opacity: value });
    } catch (error) {
      console.error('Failed to update tile opacity:', error);
    }
  };

  const handleDamageChange = (value) => {
    try {
      updateTile(selectedTileId, { damage: value });
    } catch (error) {
      console.error('Failed to update tile damage:', error);
    }
  };

  const handleLayerChange = (value) => {
    try {
      updateTile(selectedTileId, { layer: value });
    } catch (error) {
      console.error('Failed to update tile layer:', error);
    }
  };

  const handleEditTile = () => {
    console.log('[TileInspector] Opening tile editor for tile:', selectedTileId);
    setCanvasTab('createTile');
  };

  const handleCloneTile = () => {
    if (!selectedTile) return;
    const clonedTile = selectedTile.clone();
    clonedTile.id = Date.now(); // Generate new ID
    clonedTile.name = selectedTile.name + '_copy';
    addTileToCurrentScene(clonedTile);
  };

  const handleDeleteTile = () => {
    if (!selectedTile) return;
    // Direct deletion without confirmation (Tauri dialog permission issue)
    deleteTile(selectedTileId);
  };

  const handleFlipHorizontal = () => {
    if (!selectedTile) return;
    const pixels2D = selectedTile.getAllPixels2D();
    flipHorizontally(pixels2D);
    const pixels1D = pixels2D.flat();
    updateTile(selectedTileId, { pixels: pixels1D });
  };

  const handleFlipVertical = () => {
    if (!selectedTile) return;
    const pixels2D = selectedTile.getAllPixels2D();
    flipVertically(pixels2D);
    const pixels1D = pixels2D.flat();
    updateTile(selectedTileId, { pixels: pixels1D });
  };

  return (
    <div className="tile-inspector-container">
      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '12px', padding: '0' }}>
        <Button
          variant="secondary"
          size="small"
          icon={<FiEdit2 />}
          onClick={handleEditTile}
          title="Edit Tile Pixels"
          style={{ flex: 1, minWidth: 0 }}
        />
        <Button
          variant="secondary"
          size="small"
          icon={<FiCopy />}
          onClick={handleCloneTile}
          title="Clone Tile"
          style={{ flex: 1, minWidth: 0 }}
        />
        <Button
          variant="secondary"
          size="small"
          icon={<FiTrash2 />}
          onClick={handleDeleteTile}
          title="Delete Tile"
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

      {/* Tile Properties */}
      <section>
        <h2 className="tile-inspector-section-title">Tile Properties</h2>
        
        {/* ID (Read-only) */}
        <div className="tile-inspector-row">
          <label className="tile-inspector-row-label">ID</label>
          <input
            type="text"
            value={selectedTile.id}
            disabled
            style={{ opacity: 0.6 }}
          />
        </div>

        {/* Name */}
        <div className="tile-inspector-row">
          <label className="tile-inspector-row-label">Name</label>
          <input
            type="text"
            value={selectedTile.name}
            onChange={handleNameChange}
            placeholder="Tile Name"
          />
        </div>

        {/* Tag */}
        <div className="tile-inspector-row">
          <label className="tile-inspector-row-label">Tag</label>
          <input
            type="text"
            value={selectedTile.tag}
            onChange={handleTagChange}
            placeholder="ground, wall, water..."
          />
        </div>

        {/* Solid */}
        <div className="tile-inspector-row">
          <label className="tile-inspector-row-label">Solid</label>
          <input
            type="checkbox"
            checked={selectedTile.solid}
            onChange={handleSolidChange}
          />
        </div>

        {/* Opacity */}
        <div className="tile-inspector-row">
          <label className="tile-inspector-row-label">Opacity</label>
          <NumberInput
            value={selectedTile.opacity}
            onChange={handleOpacityChange}
            min={0}
            max={255}
            size="small"
          />
        </div>

        {/* Damage */}
        <div className="tile-inspector-row">
          <label className="tile-inspector-row-label">Damage</label>
          <NumberInput
            value={selectedTile.damage}
            onChange={handleDamageChange}
            min={0}
            max={255}
            size="small"
          />
        </div>

        {/* Layer */}
        <div className="tile-inspector-row">
          <label className="tile-inspector-row-label">Layer</label>
          <NumberInput
            value={selectedTile.layer}
            onChange={handleLayerChange}
            min={0}
            max={currentScene ? currentScene.layers - 3 : MAX_LAYERS - 3}
            size="small"
          />
        </div>
      </section>

      {/* Color Palette - Only interactive when editing */}
      <section>
        <h2 className="tile-inspector-section-title">Color Palette</h2>
        {!isEditingTile && (
          <p className="tile-inspector-palette-hint">
            Click "Edit Tile Pixels" to select colors
          </p>
        )}
        <div className={!isEditingTile ? 'tile-inspector-palette-disabled' : ''}>
          <ColourPicker
            mode="select"
            palette={palette}
            selectedIndex={selectedColourId}
            onColorSelect={(index) => {
              console.log('[TileInspector] Color selected:', index);
              setSelectedColourId(index);
            }}
            disabled={!isEditingTile}
          />
        </div>
      </section>
    </div>
  );
}
