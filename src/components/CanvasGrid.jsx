import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';
import { screenToGrid, isInBounds } from '../utils/grid';
import '../css/CanvasGrid.css';

/**
 * CanvasGrid - Interactive canvas for tilemap/entity editing
 * 
 * @param {number} width - Grid width in cells
 * @param {number} height - Grid height in cells
 * @param {number} cellSize - Size of each cell in pixels (default: 20)
 * @param {Array<Array<number>>} data - 2D array of cell values (indices)
 * @param {function} onCellClick - Callback(x, y, button) when cell is clicked
 * @param {function} onCellHover - Callback(x, y) when cell is hovered
 * @param {boolean} showGrid - Show grid lines (default: true)
 * @param {Array} overlayLayers - Additional layers to render greyed out
 * @param {function} getCellColor - Function(value) to get color for cell value
 * @param {string} className - Additional CSS classes
 */
export default function CanvasGrid({
  width,
  height,
  cellSize: propCellSize, // Optional fixed cell size
  minCellSize = 50,
  data,
  onCellClick,
  onCellHover,
  showGrid = true,
  overlayLayers = [],
  getCellColor,
  className = ''
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [cellSize, setCellSize] = useState(propCellSize || 50);

  // Calculate cell size to fit container while maintaining a minimum (default 50px)
  useLayoutEffect(() => {
    if (!containerRef.current || propCellSize) {
      // If cellSize is provided as prop, use it directly
      if (propCellSize) setCellSize(propCellSize);
      return;
    }

    const updateCellSize = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // Calculate cell size based on the smaller of width/height in cells
      let calculatedSize;
      if (width < height) {
        calculatedSize = Math.floor(containerWidth / width);
      } else {
        calculatedSize = Math.floor(containerHeight / height);
      }

      // Determine minimum cell size: prop override > data attribute > default 50
      const minCell = typeof minCellSize === 'number'
        ? minCellSize
        : (container.dataset.minCellSize ? Number.parseInt(container.dataset.minCellSize, 10) : 50);

      const newCellSize = Math.max(minCell, Math.min(100, calculatedSize));
      setCellSize(newCellSize);
    };

    updateCellSize();

    const resizeObserver = new ResizeObserver(updateCellSize);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [width, height, propCellSize, minCellSize]);

  const canvasWidth = width * cellSize;
  const canvasHeight = height * cellSize;

  // Draw the grid
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw overlay layers (greyed out)
    overlayLayers.forEach(layer => {
      drawLayer(ctx, layer, cellSize, width, height, getCellColor, 0.3);
    });

    // Draw main data layer
    drawLayer(ctx, data, cellSize, width, height, getCellColor, 1);
    // Draw grid lines
    if (showGrid) {
      drawGridLines(ctx, width, height, cellSize);
    }

    // Draw hover indicator
    if (hoveredCell && isInBounds(hoveredCell.x, hoveredCell.y, width, height)) {
      drawHoverIndicator(ctx, hoveredCell.x, hoveredCell.y, cellSize);
    }
  }, [data, overlayLayers, showGrid, hoveredCell, width, height, cellSize, getCellColor]);

  // Handle mouse move
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = canvas.getBoundingClientRect();
    
    // Get mouse position relative to canvas
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const { gridX, gridY } = screenToGrid(mouseX, mouseY, cellSize);

    if (isInBounds(gridX, gridY, width, height)) {
      setHoveredCell({ x: gridX, y: gridY });
      if (onCellHover) onCellHover(gridX, gridY);
    } else {
      setHoveredCell(null);
    }
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setHoveredCell(null);
  };

  // Handle click
  const handleClick = (e) => {
    if (!onCellClick) return;
    
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = canvas.getBoundingClientRect();
    
    // Get mouse position relative to canvas
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const { gridX, gridY } = screenToGrid(mouseX, mouseY, cellSize);

    if (isInBounds(gridX, gridY, width, height)) {
      const button = e.button === 2 ? 'right' : 'left';
      onCellClick(gridX, gridY, button);
    }
  };

  // Handle right click (prevent context menu)
  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  return (
    <div ref={containerRef} className={`canvas-grid-container ${className}`}>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="canvas-grid"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleClick}
        onContextMenu={handleContextMenu}
      />
    </div>
  );
}

// Helper: Draw a layer
function drawLayer(ctx, layerData, cellSize, width, height, getCellColor, opacity) {
  if (!layerData || layerData.length === 0) return;

  ctx.globalAlpha = opacity;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const value = layerData[y]?.[x];
      if (value === undefined || value === null || value === -1) continue;

      const screenX = x * cellSize;
      const screenY = y * cellSize;

      // Get color for this cell value
      const color = getCellColor ? getCellColor(value) : getDebugColor(value);

      // Fill cell
      ctx.fillStyle = color;
      ctx.fillRect(screenX, screenY, cellSize, cellSize);

      // Draw index number (debug mode)
      if (cellSize >= 16 && opacity === 1) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${Math.floor(cellSize * 0.4)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(value.toString(), screenX + cellSize / 2, screenY + cellSize / 2);
      }
    }
  }

  ctx.globalAlpha = 1;
}

// Helper: Draw grid lines
function drawGridLines(ctx, width, height, cellSize) {
  ctx.strokeStyle = 'rgba(69, 90, 100, 0.3)'; // var(--grid-color-major) with opacity
  ctx.lineWidth = 1;

  // Vertical lines
  for (let x = 0; x <= width; x++) {
    ctx.beginPath();
    ctx.moveTo(x * cellSize, 0);
    ctx.lineTo(x * cellSize, height * cellSize);
    ctx.stroke();
  }

  // Horizontal lines
  for (let y = 0; y <= height; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * cellSize);
    ctx.lineTo(width * cellSize, y * cellSize);
    ctx.stroke();
  }
}

// Helper: Draw hover indicator
function drawHoverIndicator(ctx, gridX, gridY, cellSize) {
  const screenX = gridX * cellSize;
  const screenY = gridY * cellSize;

  // Draw border outline
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.strokeRect(screenX + 1, screenY + 1, cellSize - 2, cellSize - 2);

  // Optional: semi-transparent overlay
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillRect(screenX, screenY, cellSize, cellSize);
}

// Helper: Get debug color for value
function getDebugColor(value) {
  // Generate consistent color based on value
  const hue = (value * 37) % 360; // Spread colors across hue spectrum
  const saturation = 60 + (value % 3) * 10; // Vary saturation slightly
  const lightness = 40 + (value % 4) * 5; // Vary lightness slightly
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

