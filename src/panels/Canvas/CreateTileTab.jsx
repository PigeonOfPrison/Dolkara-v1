import React, { useEffect, useRef, useMemo } from 'react';
import DrawTab from '../../components/DrawTab';
import useEditorStore from '../../state/editorStore';
import { TILE_SIZE } from '../../constants/hardwareLimits';

/**
 * CreateTileTab - Interface for creating/editing tiles using pixel editor
 */
export default function CreateTileTab() {
  const selectedTileId = useEditorStore(state => state.selectedTileId);
  const scenes = useEditorStore(state => state.scenes);
  const currentSceneId = useEditorStore(state => state.currentSceneId);
  const lastPixelsRef = useRef(null);
  const isPaintingRef = useRef(false);
  const [remountKey, setRemountKey] = React.useState(0);
  
  console.log('[CreateTileTab] selectedTileId:', selectedTileId);
  
  // Get selected tile from current scene
  const currentScene = scenes.find(s => s.id === currentSceneId);
  const selectedTile = currentScene?.tiles.find(t => t.id === selectedTileId);
  
  console.log('[CreateTileTab] selectedTile:', selectedTile);

  // Convert 1D pixels to 2D for DrawTab
  const initialData = selectedTile?.getAllPixels2D() || [];
  
  // Create stable string representation of pixels
  const pixelsData = selectedTile?.pixels || [];
  const pixelsString = useMemo(() => pixelsData.join(','), [pixelsData.join(',')]);

  // Detect if pixels changed externally (e.g., flip operation) but not during painting
  useEffect(() => {
    if (selectedTile && lastPixelsRef.current !== null && lastPixelsRef.current !== pixelsString && !isPaintingRef.current) {
      // Pixels changed externally (not by user painting), force remount
      setRemountKey(prev => prev + 1);
    }
    lastPixelsRef.current = pixelsString;
  }, [pixelsString, selectedTile]);

  if (!selectedTile) {
    return (
      <div style={{ padding: '16px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
        <p>No tile selected.</p>
        <p>Select a tile from the Tile Set to edit.</p>
      </div>
    );
  }
  
  return (
    <DrawTab 
      size={TILE_SIZE} 
      initialData={initialData}
      cellSize={50}
      key={`${selectedTileId}-${remountKey}`}
      onPaintStart={() => { isPaintingRef.current = true; }}
      onPaintEnd={() => { isPaintingRef.current = false; }}
    />
  );
}
