import React, { useEffect, useRef, useMemo } from 'react';
import DrawTab from '../../components/DrawTab';
import useEditorStore from '../../state/editorStore';
import { COLLECTIBLE_SIZE } from '../../constants/hardwareLimits';

/**
 * CreateCollectibleTab - Interface for editing collectible pixels using pixel editor
 */
export default function CreateCollectibleTab() {
  const selectedCollectibleId = useEditorStore(state => state.selectedCollectibleId);
  const scenes = useEditorStore(state => state.scenes);
  const currentSceneId = useEditorStore(state => state.currentSceneId);
  const lastPixelsRef = useRef(null);
  const isPaintingRef = useRef(false);
  const [remountKey, setRemountKey] = React.useState(0);
  
  // Get selected collectible from current scene
  const currentScene = scenes.find(s => s.id === currentSceneId);
  const selectedCollectible = currentScene?.collectibles.find(c => c.id === selectedCollectibleId);

  // Convert 1D pixels to 2D for DrawTab (8x8 = 64 pixels)
  const initialData = selectedCollectible?.getAllPixels2D() || [];

  // Create stable string representation of pixels
  const pixelsData = selectedCollectible?.pixels || [];
  const pixelsString = useMemo(() => pixelsData.join(','), [pixelsData.join(',')]);

  // Detect if pixels changed externally (e.g., flip operation) but not during painting
  useEffect(() => {
    if (selectedCollectible && lastPixelsRef.current !== null && lastPixelsRef.current !== pixelsString && !isPaintingRef.current) {
      // Pixels changed externally (not by user painting), force remount
      setRemountKey(prev => prev + 1);
    }
    lastPixelsRef.current = pixelsString;
  }, [pixelsString, selectedCollectible]);

  if (!selectedCollectible) {
    return (
      <div style={{ padding: '16px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
        <p>No collectible selected.</p>
        <p>Select a collectible from the Collectibles panel or create a new one.</p>
      </div>
    );
  }

  return (
    <DrawTab 
      size={COLLECTIBLE_SIZE} 
      initialData={initialData}
      key={`${selectedCollectibleId}-${remountKey}`}
      onPaintStart={() => { isPaintingRef.current = true; }}
      onPaintEnd={() => { isPaintingRef.current = false; }}
    />
  );
}
