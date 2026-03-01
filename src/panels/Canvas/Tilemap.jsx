import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { screenToGrid, isInBounds } from '../../utils/grid';
import useEditorStore from '../../state/editorStore';
import '../../css/CanvasGrid.css';

/**
 * Tilemap - Main canvas for painting tiles, entities, and collectibles
 * This is the primary scene editor where all elements are placed
 */
export default function Tilemap() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [mouseButton, setMouseButton] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [cellSize, setCellSize] = useState(50);
  
  const selectedTileId = useEditorStore(state => state.selectedTileId);
  const selectedEntityId = useEditorStore(state => state.selectedEntityId);
  const selectedCollectibleId = useEditorStore(state => state.selectedCollectibleId);
  const currentSceneId = useEditorStore(state => state.currentSceneId);
  const scenes = useEditorStore(state => state.scenes);
  const updateScene = useEditorStore(state => state.updateScene);
  const selectedLayer = useEditorStore(state => state.selectedLayer);
  
  const currentScene = scenes.find(s => s.id === currentSceneId);
  const width = currentScene?.width || 32;
  const height = currentScene?.height || 12;

  // Calculate cell size based on container
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const updateCellSize = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      let calculatedSize;
      if (width < height) {
        calculatedSize = Math.floor(containerWidth / width);
      } else {
        calculatedSize = Math.floor(containerHeight / height);
      }
      
      const newCellSize = Math.max(50, Math.min(100, calculatedSize));
      setCellSize(newCellSize);
    };

    updateCellSize();
    const resizeObserver = new ResizeObserver(updateCellSize);
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [width, height]);

  // Paint on the appropriate layer based on what's selected
  const paint = (x, y, button) => {
    if (!currentScene) return;
    
    if (button === 'right') {
      // Right click erases from all layers
      const newTerrainLayers = currentScene.terrainLayers.map(layer => 
        layer.map(row => [...row])
      );
      const newEntityLayer = [...currentScene.entityLayer.map(row => [...row])];
      const newCollectibleLayer = [...currentScene.collectibleLayer.map(row => [...row])];
      
      // Erase from all terrain layers
      for (let layer = 0; layer < newTerrainLayers.length; layer++) {
        newTerrainLayers[layer][y][x] = -1;
      }
      newEntityLayer[y][x] = -1;
      newCollectibleLayer[y][x] = -1;
      
      currentScene.terrainLayers = newTerrainLayers;
      currentScene.entityLayer = newEntityLayer;
      currentScene.collectibleLayer = newCollectibleLayer;
      updateScene(currentSceneId, { 
        terrainLayers: newTerrainLayers,
        entityLayer: newEntityLayer,
        collectibleLayer: newCollectibleLayer
      });
      return;
    }
    
    // Left click places selected element
    if (selectedTileId !== null && selectedTileId !== undefined) {
      // Place tile - find index in tiles array
      const tileIndex = currentScene.tiles.findIndex(t => t.id === selectedTileId);
      if (tileIndex === -1) {
        console.log('[Tilemap] Selected tile not found in scene');
        return;
      }
      
      // Get the tile to find its layer property
      const tile = currentScene.tiles[tileIndex];
      const targetLayer = tile.layer || 0;
      
      const newTerrainLayers = currentScene.terrainLayers.map(layer => 
        layer.map(row => [...row])
      );
      newTerrainLayers[targetLayer][y][x] = tileIndex;
      currentScene.terrainLayers = newTerrainLayers;
      updateScene(currentSceneId, { terrainLayers: newTerrainLayers });
    } else if (selectedEntityId !== null && selectedEntityId !== undefined) {
      // Place entity - find index in entities array
      const entityIndex = currentScene.entities.findIndex(e => e.id === selectedEntityId);
      if (entityIndex === -1) {
        console.log('[Tilemap] Selected entity not found in scene');
        return;
      }
      
      // Check if there's a non-solid tile at position (check all layers)
      let hasTile = false;
      let isSolid = false;
      for (let layer = 0; layer < currentScene.terrainLayers.length; layer++) {
        const tileIndex = currentScene.terrainLayers[layer][y]?.[x];
        if (tileIndex !== -1) {
          hasTile = true;
          const tile = currentScene.tiles[tileIndex];
          if (tile?.solid) {
            isSolid = true;
            break;
          }
        }
      }
      
      if (!hasTile) {
        console.log('[Tilemap] Cannot place entity on empty tile');
        return;
      }
      if (isSolid) {
        console.log('[Tilemap] Cannot place entity on solid tile');
        return;
      }
      
      // Replace collectible if present
      const newEntityLayer = [...currentScene.entityLayer.map(row => [...row])];
      const newCollectibleLayer = [...currentScene.collectibleLayer.map(row => [...row])];
      newEntityLayer[y][x] = entityIndex;
      newCollectibleLayer[y][x] = -1;
      currentScene.entityLayer = newEntityLayer;
      currentScene.collectibleLayer = newCollectibleLayer;
      updateScene(currentSceneId, { 
        entityLayer: newEntityLayer,
        collectibleLayer: newCollectibleLayer
      });
    } else if (selectedCollectibleId !== null && selectedCollectibleId !== undefined) {
      // Place collectible - find index in collectibles array
      const collectibleIndex = currentScene.collectibles.findIndex(c => c.id === selectedCollectibleId);
      if (collectibleIndex === -1) {
        console.log('[Tilemap] Selected collectible not found in scene');
        return;
      }
      
      // Check if there's a non-solid tile at position (check all layers)
      let hasTile = false;
      let isSolid = false;
      for (let layer = 0; layer < currentScene.terrainLayers.length; layer++) {
        const tileIndex = currentScene.terrainLayers[layer][y]?.[x];
        if (tileIndex !== -1) {
          hasTile = true;
          const tile = currentScene.tiles[tileIndex];
          if (tile?.solid) {
            isSolid = true;
            break;
          }
        }
      }
      
      if (!hasTile) {
        console.log('[Tilemap] Cannot place collectible on empty tile');
        return;
      }
      if (isSolid) {
        console.log('[Tilemap] Cannot place collectible on solid tile');
        return;
      }
      
      const entityIndex = currentScene.entityLayer[y]?.[x];
      if (entityIndex !== -1) {
        console.log('[Tilemap] Cannot place collectible where entity exists');
        return;
      }
      
      const newCollectibleLayer = [...currentScene.collectibleLayer.map(row => [...row])];
      newCollectibleLayer[y][x] = collectibleIndex;
      currentScene.collectibleLayer = newCollectibleLayer;
      updateScene(currentSceneId, { collectibleLayer: newCollectibleLayer });
    }
  };

  const handleCellClick = (x, y, button) => {
    setIsMouseDown(true);
    setMouseButton(button);
    paint(x, y, button);
  };

  const handleCellHover = (x, y) => {
    if (isMouseDown && mouseButton) {
      paint(x, y, mouseButton);
    }
  };
  
  const handleMouseUp = () => {
    setIsMouseDown(false);
    setMouseButton(null);
  };

  // Render the scene with all layers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentScene) return;

    const ctx = canvas.getContext('2d');
    const canvasWidth = width * cellSize;
    const canvasHeight = height * cellSize;
    
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw terrain layers (back to front)
    for (let layer = 0; layer < currentScene.terrainLayers.length; layer++) {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const tileId = currentScene.terrainLayers[layer][y]?.[x];
          if (tileId !== -1 && tileId >= 0) {
            const tile = currentScene.tiles[tileId];
            if (tile) {
              drawTile(ctx, tile, x * cellSize, y * cellSize, cellSize, currentScene.palette.colours);
            }
          }
        }
      }
    }

    // Draw collectible layer
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const collectibleId = currentScene.collectibleLayer[y]?.[x];
        if (collectibleId !== -1 && collectibleId >= 0) {
          const collectible = currentScene.collectibles[collectibleId];
          if (collectible) {
            drawCollectible(ctx, collectible, x * cellSize, y * cellSize, cellSize, currentScene.palette.colours);
          }
        }
      }
    }

    // Draw entity layer
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const entityId = currentScene.entityLayer[y]?.[x];
        if (entityId !== -1 && entityId >= 0) {
          const entity = currentScene.entities[entityId];
          if (entity) {
            drawEntity(ctx, entity, currentScene, x * cellSize, y * cellSize, cellSize, currentScene.palette.colours);
          }
        }
      }
    }

    // Draw grid
    drawGrid(ctx, width, height, cellSize);

    // Draw hover indicator
    if (hoveredCell && isInBounds(hoveredCell.x, hoveredCell.y, width, height)) {
      drawHover(ctx, hoveredCell.x * cellSize, hoveredCell.y * cellSize, cellSize);
    }
  }, [currentScene, cellSize, hoveredCell, width, height]);

  // Handle mouse events
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const { gridX, gridY } = screenToGrid(mouseX, mouseY, cellSize);

    if (isInBounds(gridX, gridY, width, height)) {
      setHoveredCell({ x: gridX, y: gridY });
      handleCellHover(gridX, gridY);
    } else {
      setHoveredCell(null);
    }
  };

  const handleClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const { gridX, gridY } = screenToGrid(mouseX, mouseY, cellSize);

    if (isInBounds(gridX, gridY, width, height)) {
      const button = e.button === 2 ? 'right' : 'left';
      handleCellClick(gridX, gridY, button);
    }
  };

  return (
    <div 
      ref={containerRef}
      style={{ width: '100%', height: '100%', overflow: 'auto' }}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <canvas
        ref={canvasRef}
        width={width * cellSize}
        height={height * cellSize}
        className="canvas-grid"
        onMouseMove={handleMouseMove}
        onMouseDown={handleClick}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}

// Draw an 8x8 tile
function drawTile(ctx, tile, x, y, cellSize, palette) {
  const pixels2D = tile.getAllPixels2D();
  
  for (let py = 0; py < 8; py++) {
    for (let px = 0; px < 8; px++) {
      const colorIndex = pixels2D[py][px];
      if (colorIndex !== -1) {
        const pixelX = Math.floor(x + (px * cellSize) / 8);
        const pixelY = Math.floor(y + (py * cellSize) / 8);
        const pixelWidth = Math.floor(x + ((px + 1) * cellSize) / 8) - pixelX;
        const pixelHeight = Math.floor(y + ((py + 1) * cellSize) / 8) - pixelY;
        
        ctx.fillStyle = palette[colorIndex] || '#FF00FF';
        ctx.fillRect(pixelX, pixelY, pixelWidth, pixelHeight);
      }
    }
  }
}

// Draw an 8x8 collectible
function drawCollectible(ctx, collectible, x, y, cellSize, palette) {
  const pixels2D = collectible.getAllPixels2D();
  
  for (let py = 0; py < 8; py++) {
    for (let px = 0; px < 8; px++) {
      const colorIndex = pixels2D[py][px];
      if (colorIndex !== -1) {
        const pixelX = Math.floor(x + (px * cellSize) / 8);
        const pixelY = Math.floor(y + (py * cellSize) / 8);
        const pixelWidth = Math.floor(x + ((px + 1) * cellSize) / 8) - pixelX;
        const pixelHeight = Math.floor(y + ((py + 1) * cellSize) / 8) - pixelY;
        
        ctx.fillStyle = palette[colorIndex] || '#FF00FF';
        ctx.fillRect(pixelX, pixelY, pixelWidth, pixelHeight);
      }
    }
  }
}

// Draw a 16x16 entity
function drawEntity(ctx, entity, scene, x, y, cellSize, palette) {
  const defaultAnim = entity.animations[entity.defaultAnimation];
  if (!defaultAnim || defaultAnim.frameIds.length === 0) return;
  
  const frameIndex = defaultAnim.frameIds[0];
  const framePixels = scene.characterFrames[frameIndex];
  if (!framePixels) return;
  
  for (let py = 0; py < 16; py++) {
    for (let px = 0; px < 16; px++) {
      const colorIndex = framePixels[py * 16 + px];
      if (colorIndex !== -1) {
        const pixelX = Math.floor(x + (px * cellSize) / 16);
        const pixelY = Math.floor(y + (py * cellSize) / 16);
        const pixelWidth = Math.floor(x + ((px + 1) * cellSize) / 16) - pixelX;
        const pixelHeight = Math.floor(y + ((py + 1) * cellSize) / 16) - pixelY;
        
        ctx.fillStyle = palette[colorIndex] || '#FF00FF';
        ctx.fillRect(pixelX, pixelY, pixelWidth, pixelHeight);
      }
    }
  }
}

// Draw grid lines
function drawGrid(ctx, width, height, cellSize) {
  ctx.strokeStyle = 'rgba(69, 90, 100, 0.3)';
  ctx.lineWidth = 1;

  for (let x = 0; x <= width; x++) {
    ctx.beginPath();
    ctx.moveTo(x * cellSize, 0);
    ctx.lineTo(x * cellSize, height * cellSize);
    ctx.stroke();
  }

  for (let y = 0; y <= height; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * cellSize);
    ctx.lineTo(width * cellSize, y * cellSize);
    ctx.stroke();
  }
}

// Draw hover indicator
function drawHover(ctx, x, y, cellSize) {
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillRect(x, y, cellSize, cellSize);
}
