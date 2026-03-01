import React, { useState, useCallback } from 'react';
import CanvasGrid from './CanvasGrid';
import useEditorStore from '../state/editorStore';
import '../css/DrawTab.css';

/**
 * DrawTab - Pixel editor for creating tiles, entities, and collectibles
 * 
 * @param {number} size - Grid size (8 for tiles/collectibles, 16 for entities)
 * @param {Array<Array<number>>} initialData - Initial pixel data (optional)
 * @param {number} cellSize - Size of each cell in pixels (optional, default auto-calculated)
 * @param {function} onPaintStart - Callback when painting starts (optional)
 * @param {function} onPaintEnd - Callback when painting ends (optional)
 * @param {function} onSaveOverride - Custom save handler (optional, for animation frames)
 * @param {function} onDiscardOverride - Custom discard handler (optional, for animation frames)
 */
export default function DrawTab({ size, initialData, cellSize, onPaintStart, onPaintEnd, onSaveOverride, onDiscardOverride, minCellSize }) {
  // Initialize pixel data - 2D array filled with -1 (transparent)
  const [pixelData, setPixelData] = useState(
    initialData || new Array(size).fill(null).map(() => new Array(size).fill(-1))
  );
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [mouseButton, setMouseButton] = useState(null); // 'left' or 'right'

  // Get selected color from store
  const selectedColourId = useEditorStore(state => state.selectedColourId);
  const getCurrentPalette = useEditorStore(state => state.getCurrentPalette);
  const updateTile = useEditorStore(state => state.updateTile);
  const updateEntity = useEditorStore(state => state.updateEntity);
  const updateCollectible = useEditorStore(state => state.updateCollectible);
  const updateAnimationFrame = useEditorStore(state => state.updateAnimationFrame);
  const addAnimationFrame = useEditorStore(state => state.addAnimationFrame);
  const selectedTileId = useEditorStore(state => state.selectedTileId);
  const selectedEntityId = useEditorStore(state => state.selectedEntityId);
  const selectedCollectibleId = useEditorStore(state => state.selectedCollectibleId);
  const canvasTab = useEditorStore(state => state.canvasTab);
  const scenes = useEditorStore(state => state.scenes);
  const currentSceneId = useEditorStore(state => state.currentSceneId);
  const updateScene = useEditorStore(state => state.updateScene);
  
  // Get palette colors from store
  const palette = getCurrentPalette()?.colours || [];

  const getCellColor = useCallback((colorIndex) => {
    if (colorIndex === -1 || colorIndex < 0) return 'transparent'; // -1 = no color/transparent
    if (colorIndex >= palette.length) {
      console.warn('[DrawTab getCellColor] Invalid color index:', colorIndex);
      return '#FF00FF'; // Fallback to magenta
    }
    // Direct mapping: pixel values 0-29 = palette indices 0-29
    return palette[colorIndex] || 'transparent';
  }, [palette]);

  const handleCellClick = (x, y, button) => {
    setIsMouseDown(true);
    setMouseButton(button);
    if (onPaintStart) onPaintStart();
    paintCell(x, y, button);
  };

  const handleCellHover = (x, y) => {
    // Paint while dragging if mouse is down
    if (isMouseDown && mouseButton) {
      paintCell(x, y, mouseButton);
    }
  };

  const paintCell = (x, y, button) => {
    let newPixelData;
    
    if (button === 'left') {
      // Paint with selected color
      // Direct mapping: palette index 0-29 = pixel value 0-29
      if (selectedColourId < 0 || selectedColourId >= palette.length) {
        console.warn('[DrawTab] Invalid selected color index:', selectedColourId);
        return;
      }
      newPixelData = pixelData.map((row, rowIdx) =>
        rowIdx === y ? row.map((cell, colIdx) =>
          colIdx === x ? selectedColourId : cell
        ) : row
      );
    } else if (button === 'right') {
      // Erase (set to -1/transparent)
      newPixelData = pixelData.map((row, rowIdx) =>
        rowIdx === y ? row.map((cell, colIdx) =>
          colIdx === x ? -1 : cell
        ) : row
      );
    }
    
    if (newPixelData) {
      setPixelData(newPixelData);
      
      // Auto-save to store based on what's being edited
      const pixels1D = newPixelData.flat();
      
      if (canvasTab === 'createTile' && selectedTileId !== null) {
        updateTile(selectedTileId, { pixels: pixels1D });
      } else if (canvasTab === 'createEntity' && selectedEntityId !== null) {
        // Get current scene and entity
        const currentScene = scenes.find(s => s.id === currentSceneId);
        if (!currentScene) return;
        
        const entity = currentScene.entities.find(e => e.id === selectedEntityId);
        if (!entity) return;
        
        // Check if editing animation frame from animation editor
        const editingFrameIndex = useEditorStore.getState().editingFrameIndex;
        const selectedAnimationId = useEditorStore.getState().selectedAnimationId;
        const isEditingAnimationFrame = editingFrameIndex !== null && selectedAnimationId !== null;
        
        if (isEditingAnimationFrame) {
          // Update animation frame using the store action
          updateAnimationFrame(selectedEntityId, selectedAnimationId, editingFrameIndex, pixels1D);
        } else {
          // Update default animation's first frame
          const defaultAnim = entity.animations[entity.defaultAnimation];
          
          if (defaultAnim.frameIds.length === 0) {
            // First frame - add it
            addAnimationFrame(selectedEntityId, entity.defaultAnimation, pixels1D);
          } else {
            // Update existing first frame
            updateAnimationFrame(selectedEntityId, entity.defaultAnimation, 0, pixels1D);
          }
        }
      } else if (canvasTab === 'createCollectible' && selectedCollectibleId !== null) {
        updateCollectible(selectedCollectibleId, { pixels: pixels1D });
      }
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
    setMouseButton(null);
    if (onPaintEnd) onPaintEnd();
  };

  return (
    <div 
      className="draw-tab"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <CanvasGrid
        width={size}
        height={size}
        cellSize={cellSize}
        minCellSize={minCellSize}
        data={pixelData}
        onCellClick={handleCellClick}
        onCellHover={handleCellHover}
        getCellColor={getCellColor}
        showGrid={true}
      />
    </div>
  );
}
