import React from 'react';
import useEditorStore from '../../state/editorStore';
import Button from '../../components/Button';
import NumberInput from '../../components/NumberInput';
import ColourPicker from '../../components/ColourPicker';
import { FiEdit2, FiCopy, FiTrash2 } from 'react-icons/fi';
import { MdFlip } from 'react-icons/md';
import { flipHorizontally, flipVertically } from '../../utils/grid';
import '../../css/TileInspector.css';

/**
 * CollectibleInspector - Edit collectible properties
 */
export default function CollectibleInspector() {
  const selectedCollectibleId = useEditorStore(state => state.selectedCollectibleId);
  const scenes = useEditorStore(state => state.scenes);
  const currentSceneId = useEditorStore(state => state.currentSceneId);
  const updateCollectible = useEditorStore(state => state.updateCollectible);
  const addCollectibleToCurrentScene = useEditorStore(state => state.addCollectibleToCurrentScene);
  const deleteCollectible = useEditorStore(state => state.deleteCollectible);
  const setCanvasTab = useEditorStore(state => state.setCanvasTab);
  const canvasTab = useEditorStore(state => state.canvasTab);
  const getCurrentPalette = useEditorStore(state => state.getCurrentPalette);
  const selectedColourId = useEditorStore(state => state.selectedColourId);
  const setSelectedColourId = useEditorStore(state => state.setSelectedColourId);

  // Get selected collectible from current scene
  const currentScene = scenes.find(s => s.id === currentSceneId);
  const selectedCollectible = currentScene?.collectibles.find(c => c.id === selectedCollectibleId);
  
  const palette = getCurrentPalette()?.colours || [];
  const isEditingCollectible = canvasTab === 'createCollectible';

  if (!selectedCollectible) {
    return (
      <div className="tile-inspector-empty">
        <p>No collectible selected</p>
        <p>
          Select a collectible from the Collectibles panel or create a new one.
        </p>
      </div>
    );
  }

  const handleNameChange = (e) => {
    try {
      updateCollectible(selectedCollectibleId, { name: e.target.value });
    } catch (error) {
      console.error('Failed to update collectible name:', error);
    }
  };

  const handleTagChange = (e) => {
    try {
      updateCollectible(selectedCollectibleId, { tag: e.target.value });
    } catch (error) {
      console.error('Failed to update collectible tag:', error);
    }
  };

  const handleValueChange = (value) => {
    try {
      updateCollectible(selectedCollectibleId, { value: value });
    } catch (error) {
      console.error('Failed to update collectible value:', error);
    }
  };

  const handleInventorySlotChange = (value) => {
    try {
      updateCollectible(selectedCollectibleId, { inventorySlot: value });
    } catch (error) {
      console.error('Failed to update collectible inventorySlot:', error);
    }
  };

  const handleEditCollectible = () => {
    setCanvasTab('createCollectible');
  };

  const handleCloneCollectible = () => {
    if (!selectedCollectible) return;
    const clonedCollectible = selectedCollectible.clone();
    clonedCollectible.id = Date.now();
    clonedCollectible.name = selectedCollectible.name + '_copy';
    addCollectibleToCurrentScene(clonedCollectible);
  };

  const handleDeleteCollectible = () => {
    if (!selectedCollectible) return;
    // Direct deletion without confirmation (Tauri dialog permission issue)
    deleteCollectible(selectedCollectibleId);
  };

  const handleFlipHorizontal = () => {
    if (!selectedCollectible) return;
    const pixels2D = selectedCollectible.getAllPixels2D();
    flipHorizontally(pixels2D);
    const pixels1D = pixels2D.flat();
    updateCollectible(selectedCollectibleId, { pixels: pixels1D });
  };

  const handleFlipVertical = () => {
    if (!selectedCollectible) return;
    const pixels2D = selectedCollectible.getAllPixels2D();
    flipVertically(pixels2D);
    const pixels1D = pixels2D.flat();
    updateCollectible(selectedCollectibleId, { pixels: pixels1D });
  };

  return (
    <div className="tile-inspector-container">
      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '12px', padding: '0' }}>
        <Button
          variant="secondary"
          size="small"
          icon={<FiEdit2 />}
          onClick={handleEditCollectible}
          title="Edit Collectible Pixels"
          style={{ flex: 1, minWidth: 0 }}
        />
        <Button
          variant="secondary"
          size="small"
          icon={<FiCopy />}
          onClick={handleCloneCollectible}
          title="Clone Collectible"
          style={{ flex: 1, minWidth: 0 }}
        />
        <Button
          variant="secondary"
          size="small"
          icon={<FiTrash2 />}
          onClick={handleDeleteCollectible}
          title="Delete Collectible"
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

      {/* Collectible Properties */}
      <section>
        <h2 className="tile-inspector-section-title">Collectible Properties</h2>
        
        {/* ID (Read-only) */}
        <div className="tile-inspector-row">
          <label className="tile-inspector-row-label">ID</label>
          <input
            type="text"
            value={selectedCollectible.id}
            disabled
            style={{ opacity: 0.6 }}
          />
        </div>

        {/* Name */}
        <div className="tile-inspector-row">
          <label className="tile-inspector-row-label">Name</label>
          <input
            type="text"
            value={selectedCollectible.name}
            onChange={handleNameChange}
            placeholder="Collectible Name"
          />
        </div>

        {/* Tag */}
        <div className="tile-inspector-row">
          <label className="tile-inspector-row-label">Tag</label>
          <input
            type="text"
            value={selectedCollectible.tag}
            onChange={handleTagChange}
            placeholder="coin, key, potion..."
          />
        </div>

        {/* Value */}
        <div className="tile-inspector-row">
          <label className="tile-inspector-row-label">Value</label>
          <NumberInput
            value={selectedCollectible.value}
            onChange={handleValueChange}
            min={0}
            max={4294967295}
            size="small"
          />
        </div>

        {/* Inventory Slot */}
        <div className="tile-inspector-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <label className="tile-inspector-row-label">Inventory Slot</label>
          <NumberInput
            value={selectedCollectible.inventorySlot}
            onChange={handleInventorySlotChange}
            min={-1}
            max={63}
            size="small"
          />
          <ul style={{ 
            color: 'var(--color-text-muted)', 
            fontSize: '11px', 
            marginTop: '4px',
            paddingLeft: '16px',
            marginBottom: 0,
            lineHeight: '1.4',
            listStyleType: 'disc',
            width: '100%'
          }}>
            <li style={{ whiteSpace: 'nowrap' }}>-1 = currency</li>
            <li style={{ whiteSpace: 'nowrap' }}>0-63 = inventory item</li>
          </ul>
        </div>
      </section>

      {/* Color Palette - Only interactive when editing */}
      <section>
        <h2 className="tile-inspector-section-title">Color Palette</h2>
        {!isEditingCollectible && (
          <p className="tile-inspector-palette-hint">
            Click "Edit Collectible Pixels" to select colors
          </p>
        )}
        <div className={!isEditingCollectible ? 'tile-inspector-palette-disabled' : ''}>
          <ColourPicker
            mode="select"
            palette={palette}
            selectedIndex={selectedColourId}
            onColorSelect={(index) => {
              setSelectedColourId(index);
            }}
            disabled={!isEditingCollectible}
          />
        </div>
      </section>
    </div>
  );
}