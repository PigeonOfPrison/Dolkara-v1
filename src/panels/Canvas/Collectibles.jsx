import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { screenToGrid, isInBounds } from '../../utils/grid';
import useEditorStore from '../../state/editorStore';
import '../../css/CanvasGrid.css';

/**
 * Collectibles - Canvas for painting collectibles only
 * Tiles and entities are visible but greyed out and uneditable
 * Collectibles cannot be placed on solid tiles or where entities exist
 */
export default function Collectibles() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [mouseButton, setMouseButton] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [cellSize, setCellSize] = useState(50);
  
  const selectedCollectibleId = useEditorStore(state => state.selectedCollectibleId);
  const currentSceneId = useEditorStore(state => state.currentSceneId);
  const scenes = useEditorStore(state => state.scenes);
  const updateScene = useEditorStore(state => state.updateScene);
  
  const currentScene = scenes.find(s => s.id === currentSceneId);
  const width = currentScene?.width || 32;
  const height = currentScene?.height || 12;

  // Calculate cell size based on container (synchronous before paint)
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

  // Paint collectibles only
  const paint = (x, y, button) => {
    if (!currentScene) return;
    
    if (button === 'right') {
      // Right click erases collectible only
      const newCollectibleLayer = [...currentScene.collectibleLayer.map(row => [...row])];
      newCollectibleLayer[y][x] = -1;
      
      currentScene.collectibleLayer = newCollectibleLayer;
      updateScene(currentSceneId, { collectibleLayer: newCollectibleLayer });
      return;
    }
    
    // Left click places selected collectible
    if (selectedCollectibleId !== null && selectedCollectibleId !== undefined) {
      // Find collectible index in collectibles array
      const collectibleIndex = currentScene.collectibles.findIndex(c => c.id === selectedCollectibleId);
      if (collectibleIndex === -1) {
        console.log('[Collectibles] Selected collectible not found in scene');
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
        console.log('[Collectibles] Cannot place collectible on empty tile');
        return;
      }
      if (isSolid) {
        console.log('[Collectibles] Cannot place collectible on solid tile');
        return;
      }
      
      // Check if entity exists at position
      const entityIndex = currentScene.entityLayer[y]?.[x];
      if (entityIndex !== -1) {
        console.log('[Collectibles] Cannot place collectible where entity exists');
        return;
      }
      
      // Place collectible
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

  // Render the scene with collectibles editable, tiles/entities greyed out
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentScene) return;

    const ctx = canvas.getContext('2d');
    const canvasWidth = width * cellSize;
    const canvasHeight = height * cellSize;
    
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw terrain layers (back to front) - greyed out
    for (let layer = 0; layer < currentScene.terrainLayers.length; layer++) {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const tileId = currentScene.terrainLayers[layer][y]?.[x];
          if (tileId !== -1 && tileId >= 0) {
            const tile = currentScene.tiles[tileId];
            if (tile) {
              drawTile(ctx, tile, x * cellSize, y * cellSize, cellSize, currentScene.palette.colours, true);
            }
          }
        }
      }
    }

    // Draw collectible layer - normal colors
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const collectibleId = currentScene.collectibleLayer[y]?.[x];
        if (collectibleId !== -1 && collectibleId >= 0) {
          const collectible = currentScene.collectibles[collectibleId];
          if (collectible) {
            drawCollectible(ctx, collectible, x * cellSize, y * cellSize, cellSize, currentScene.palette.colours, false);
          }
        }
      }
    }

    // Draw entity layer - greyed out
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const entityId = currentScene.entityLayer[y]?.[x];
        if (entityId !== -1 && entityId >= 0) {
          const entity = currentScene.entities[entityId];
          if (entity) {
            drawEntity(ctx, entity, currentScene, x * cellSize, y * cellSize, cellSize, currentScene.palette.colours, true);
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
function drawTile(ctx, tile, x, y, cellSize, palette, greyedOut = false) {
  const pixels2D = tile.getAllPixels2D();
  
  for (let py = 0; py < 8; py++) {
    for (let px = 0; px < 8; px++) {
      const colorIndex = pixels2D[py][px];
      if (colorIndex !== -1) {
        const pixelX = Math.floor(x + (px * cellSize) / 8);
        const pixelY = Math.floor(y + (py * cellSize) / 8);
        const pixelWidth = Math.floor(x + ((px + 1) * cellSize) / 8) - pixelX;
        const pixelHeight = Math.floor(y + ((py + 1) * cellSize) / 8) - pixelY;
        
        let color = palette[colorIndex] || '#FF00FF';
        if (greyedOut) {
          color = desaturate(color, 0.3);
        }
        ctx.fillStyle = color;
        ctx.fillRect(pixelX, pixelY, pixelWidth, pixelHeight);
      }
    }
  }
}

// Draw an 8x8 collectible
function drawCollectible(ctx, collectible, x, y, cellSize, palette, greyedOut = false) {
  const pixels2D = collectible.getAllPixels2D();
  
  for (let py = 0; py < 8; py++) {
    for (let px = 0; px < 8; px++) {
      const colorIndex = pixels2D[py][px];
      if (colorIndex !== -1) {
        const pixelX = Math.floor(x + (px * cellSize) / 8);
        const pixelY = Math.floor(y + (py * cellSize) / 8);
        const pixelWidth = Math.floor(x + ((px + 1) * cellSize) / 8) - pixelX;
        const pixelHeight = Math.floor(y + ((py + 1) * cellSize) / 8) - pixelY;
        
        let color = palette[colorIndex] || '#FF00FF';
        if (greyedOut) {
          color = desaturate(color, 0.3);
        }
        ctx.fillStyle = color;
        ctx.fillRect(pixelX, pixelY, pixelWidth, pixelHeight);
      }
    }
  }
}

// Draw a 16x16 entity
function drawEntity(ctx, entity, scene, x, y, cellSize, palette, greyedOut = false) {
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
        
        let color = palette[colorIndex] || '#FF00FF';
        if (greyedOut) {
          color = desaturate(color, 0.3);
        }
        ctx.fillStyle = color;
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

// Desaturate and dim a color for greyed-out effect
function desaturate(hexColor, opacity = 0.3) {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return hexColor;
  
  // Convert to grayscale
  const gray = Math.round(rgb.r * 0.3 + rgb.g * 0.59 + rgb.b * 0.11);
  
  // Apply opacity
  return `rgba(${gray}, ${gray}, ${gray}, ${opacity})`;
}

// Convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}
