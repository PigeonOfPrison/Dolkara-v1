import React, { useEffect, useRef } from 'react';
import useEditorStore from '../state/editorStore';
import Tile from '../model/Tile';
import { TILE_SIZE } from '../constants/hardwareLimits';
import { PreviewCard } from '../components/PreviewCard';
import '../css/TileSet.css';

/**
 * TileSet - Grid display of all tiles with create button
 */
export default function TileSet() {
  const currentSceneId = useEditorStore(state => state.currentSceneId);
  const scenes = useEditorStore(state => state.scenes);
  const selectedTileId = useEditorStore(state => state.selectedTileId);
  const selectTile = useEditorStore(state => state.selectTile);
  const setCanvasTab = useEditorStore(state => state.setCanvasTab);
  const addTileToCurrentScene = useEditorStore(state => state.addTileToCurrentScene);

  const currentScene = scenes.find(s => s.id === currentSceneId);
  const tiles = currentScene?.tiles || [];
  const palette = currentScene?.palette?.colours || [];

  const handleCreateTile = () => {
    // Create a draft tile immediately
    if (!currentScene) {
      console.error('[TileSet] No current scene!');
      return;
    }
    
    // Use array length as ID - it will always match the index after insertion
    const tileId = currentScene.tiles.length;
    const draftTile = new Tile(tileId, 'New Tile');
    
    // Add tile to scene - this now also selects it and switches inspector
    addTileToCurrentScene(draftTile);
    
    // Switch canvas to edit view
    setCanvasTab('createTile');
  };

  const handleSelectTile = (tileId) => {
    selectTile(tileId);
  };

  return (
    <div className="tileset-container">
      {/* Create New Tile Button */}
      <button
        className="tileset-create-btn"
        onClick={handleCreateTile}
        title="Create New Tile"
      >
        +
      </button>

      {/* Tile Cards */}
      {tiles.map(tile => (
        // <TileCard
        //   key={`${tile.id}-${tile.pixels.join(',')}`}
        //   tile={tile}
        //   palette={palette}
        //   isSelected={tile.id === selectedTileId}
        //   onClick={() => handleSelectTile(tile.id)}
        // />
        <PreviewCard 
            key={`${tile.id}-${tile.pixels.join(',')}`}
            type = "tile" 
            entity = {tile}
            size = {TILE_SIZE}
            scale = {8}
            palette = {palette}
            isSelected = {tile.id === selectedTileId}
            onClick = {() => handleSelectTile(tile.id)}
        />
      ))}
    </div>
  );
}

/**
 * TileCard - Individual tile preview card with canvas rendering
 */
function TileCard({ tile, palette, isSelected, onClick }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const scale = 8; // Larger scale to fill card
    canvas.width = TILE_SIZE * scale;
    canvas.height = TILE_SIZE * scale;

    // Draw checkerboard pattern background for transparency
    const checkerSize = scale;
    for (let y = 0; y < TILE_SIZE; y++) {
      for (let x = 0; x < TILE_SIZE; x++) {
        const isLight = (x + y) % 2 === 0;
        ctx.fillStyle = isLight ? '#2a2a2a' : '#1e1e1e';
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }

    // Draw tile pixels
    const pixels = tile.getAllPixels2D();
    for (let y = 0; y < TILE_SIZE; y++) {
      for (let x = 0; x < TILE_SIZE; x++) {
        const colorIndex = pixels[y][x];
        if (colorIndex === -1) continue; // Skip transparent

        const color = palette[colorIndex];
        if (!color) {
          console.warn('[TileCard] No color at index', colorIndex, 'in palette of length', palette.length);
        }
        ctx.fillStyle = color || '#FF00FF'; // Magenta fallback
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  }, [tile, tile.pixels, palette]);

  return (
    <button
      className={`tile-card ${isSelected ? 'active' : ''}`}
      onClick={onClick}
      title={`${tile.name} (ID: ${tile.id})`}
    >
      <canvas ref={canvasRef} />
    </button>
  );
}
