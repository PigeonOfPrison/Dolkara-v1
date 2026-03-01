import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { screenToGrid, isInBounds } from '../../utils/grid';
import useEditorStore from '../../state/editorStore';
import { MAX_PATROL_WAYPOINTS } from '../../constants/hardwareLimits';
import '../../css/CanvasGrid.css';

/**
 * Entities - Canvas for painting entities only
 * Tiles and collectibles are visible but greyed out and uneditable
 * Entities can override collectibles when placed
 * Supports patrol path recording with WASD/Arrow keys
 */
export default function Entities() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [mouseButton, setMouseButton] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [cellSize, setCellSize] = useState(50);
  const [currentPatrolPosition, setCurrentPatrolPosition] = useState(null);
  
  const selectedEntityId = useEditorStore(state => state.selectedEntityId);
  const currentSceneId = useEditorStore(state => state.currentSceneId);
  const scenes = useEditorStore(state => state.scenes);
  const updateScene = useEditorStore(state => state.updateScene);
  const isRecordingPatrolPath = useEditorStore(state => state.isRecordingPatrolPath);
  const patrolPathWaypoints = useEditorStore(state => state.patrolPathWaypoints);
  const patrolPathStartPosition = useEditorStore(state => state.patrolPathStartPosition);
  const addPatrolPathWaypoint = useEditorStore(state => state.addPatrolPathWaypoint);
  
  const currentScene = scenes.find(s => s.id === currentSceneId);
  const width = currentScene?.width || 32;
  const height = currentScene?.height || 12;

  // Initialize patrol position when recording starts
  useEffect(() => {
    if (isRecordingPatrolPath && patrolPathStartPosition) {
      setCurrentPatrolPosition(patrolPathStartPosition);
    } else {
      setCurrentPatrolPosition(null);
    }
  }, [isRecordingPatrolPath, patrolPathStartPosition]);

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

  // Handle keyboard input for patrol path recording
  useEffect(() => {
    if (!isRecordingPatrolPath || !currentPatrolPosition) return;

    const handleKeyDown = (e) => {
      if (patrolPathWaypoints.length >= MAX_PATROL_WAYPOINTS) {
        console.log('[Entities] Max patrol waypoints reached');
        return;
      }

      let newX = currentPatrolPosition.x;
      let newY = currentPatrolPosition.y;

      // WASD or Arrow keys
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
        newY = currentPatrolPosition.y - 1;
        e.preventDefault();
      } else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
        newY = currentPatrolPosition.y + 1;
        e.preventDefault();
      } else if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        newX = currentPatrolPosition.x - 1;
        e.preventDefault();
      } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        newX = currentPatrolPosition.x + 1;
        e.preventDefault();
      } else {
        return; // Not a movement key
      }

      // Check bounds
      if (newX < 0 || newX >= width || newY < 0 || newY >= height) {
        console.log('[Entities] Patrol path out of bounds');
        return;
      }

      const newPosition = { x: newX, y: newY };
      setCurrentPatrolPosition(newPosition);
      addPatrolPathWaypoint(newPosition);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRecordingPatrolPath, currentPatrolPosition, width, height, patrolPathWaypoints, addPatrolPathWaypoint]);

  // Paint entities only - can override collectibles
  const paint = (x, y, button) => {
    if (!currentScene || isRecordingPatrolPath) return; // Disable painting during patrol path recording
    
    if (button === 'right') {
      // Right click erases entity only
      const newEntityLayer = [...currentScene.entityLayer.map(row => [...row])];
      newEntityLayer[y][x] = -1;
      
      currentScene.entityLayer = newEntityLayer;
      updateScene(currentSceneId, { entityLayer: newEntityLayer });
      return;
    }
    
    // Left click places selected entity
    if (selectedEntityId !== null && selectedEntityId !== undefined) {
      // Find entity index in entities array
      const entityIndex = currentScene.entities.findIndex(e => e.id === selectedEntityId);
      if (entityIndex === -1) {
        console.log('[Entities] Selected entity not found in scene');
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
        console.log('[Entities] Cannot place entity on empty tile');
        return;
      }
      if (isSolid) {
        console.log('[Entities] Cannot place entity on solid tile');
        return;
      }
      
      // Place entity and clear collectible at this position
      const newEntityLayer = [...currentScene.entityLayer.map(row => [...row])];
      const newCollectibleLayer = [...currentScene.collectibleLayer.map(row => [...row])];
      
      newEntityLayer[y][x] = entityIndex;
      newCollectibleLayer[y][x] = -1;  // Clear collectible
      
      currentScene.entityLayer = newEntityLayer;
      currentScene.collectibleLayer = newCollectibleLayer;
      
      updateScene(currentSceneId, { 
        entityLayer: newEntityLayer,
        collectibleLayer: newCollectibleLayer
      });
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

  // Render the scene with entities editable, tiles/collectibles greyed out
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

    // Draw collectible layer - greyed out
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const collectibleId = currentScene.collectibleLayer[y]?.[x];
        if (collectibleId !== -1 && collectibleId >= 0) {
          const collectible = currentScene.collectibles[collectibleId];
          if (collectible) {
            drawCollectible(ctx, collectible, x * cellSize, y * cellSize, cellSize, currentScene.palette.colours, true);
          }
        }
      }
    }

    // Draw entity layer - normal colors
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const entityId = currentScene.entityLayer[y]?.[x];
        if (entityId !== -1 && entityId >= 0) {
          const entity = currentScene.entities[entityId];
          if (entity) {
            drawEntity(ctx, entity, currentScene, x * cellSize, y * cellSize, cellSize, currentScene.palette.colours, false);
          }
        }
      }
    }

    // Draw patrol path waypoints if recording
    if (isRecordingPatrolPath && patrolPathWaypoints.length > 0) {
      const patrolEntity = currentScene.entities.find(e => e.id === selectedEntityId);
      if (patrolEntity) {
        // Draw lines connecting waypoints
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        for (let i = 0; i < patrolPathWaypoints.length; i++) {
          const wp = patrolPathWaypoints[i];
          const centerX = wp.x * cellSize + cellSize / 2;
          const centerY = wp.y * cellSize + cellSize / 2;
          
          if (i === 0) {
            ctx.moveTo(centerX, centerY);
          } else {
            ctx.lineTo(centerX, centerY);
          }
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw entity at each waypoint with low opacity
        patrolPathWaypoints.forEach((wp, index) => {
          const isCurrentPosition = currentPatrolPosition && wp.x === currentPatrolPosition.x && wp.y === currentPatrolPosition.y;
          const opacity = isCurrentPosition ? 0.5 : 0.2;
          
          ctx.save();
          ctx.globalAlpha = opacity;
          drawEntity(ctx, patrolEntity, currentScene, wp.x * cellSize, wp.y * cellSize, cellSize, currentScene.palette.colours, false);
          ctx.restore();
          
          // Draw waypoint number
          ctx.fillStyle = '#FFD700';
          ctx.font = 'bold 12px monospace';
          ctx.fillText(index.toString(), wp.x * cellSize + 4, wp.y * cellSize + 14);
        });

        // Highlight start position
        if (patrolPathStartPosition) {
          ctx.strokeStyle = '#00FF00';
          ctx.lineWidth = 3;
          ctx.strokeRect(
            patrolPathStartPosition.x * cellSize + 2,
            patrolPathStartPosition.y * cellSize + 2,
            cellSize - 4,
            cellSize - 4
          );
        }
      }
    }

    // Draw grid
    drawGrid(ctx, width, height, cellSize);

    // Draw hover indicator
    if (hoveredCell && isInBounds(hoveredCell.x, hoveredCell.y, width, height)) {
      drawHover(ctx, hoveredCell.x * cellSize, hoveredCell.y * cellSize, cellSize);
    }
  }, [currentScene, cellSize, hoveredCell, width, height, isRecordingPatrolPath, patrolPathWaypoints, currentPatrolPosition, patrolPathStartPosition, selectedEntityId]);

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
