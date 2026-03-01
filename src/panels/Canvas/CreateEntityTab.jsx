import React, { useEffect, useRef, useMemo } from 'react';
import DrawTab from '../../components/DrawTab';
import useEditorStore from '../../state/editorStore';
import { CHARACTER_SIZE } from '../../constants/hardwareLimits';

/**
 * CreateEntityTab - Interface for editing entity pixels using pixel editor
 * Used for both default animation and animation editor frame editing
 */
export default function CreateEntityTab() {
  const selectedEntityId = useEditorStore(state => state.selectedEntityId);
  const scenes = useEditorStore(state => state.scenes);
  const currentSceneId = useEditorStore(state => state.currentSceneId);
  const selectedAnimationId = useEditorStore(state => state.selectedAnimationId);
  const editingFrameIndex = useEditorStore(state => state.editingFrameIndex);
  const updateAnimationFrame = useEditorStore(state => state.updateAnimationFrame);
  const updateScene = useEditorStore(state => state.updateScene);
  const updateEntity = useEditorStore(state => state.updateEntity);
  
  const lastPixelsRef = useRef(null);
  const isPaintingRef = useRef(false);
  const [remountKey, setRemountKey] = React.useState(0);
  
  // Get selected entity from current scene
  const currentScene = scenes.find(s => s.id === currentSceneId);
  const selectedEntity = currentScene?.entities.find(e => e.id === selectedEntityId);

  // Determine which frame to load
  let pixels1D;
  let isEditingAnimationFrame = editingFrameIndex !== null && selectedAnimationId !== null;
  
  console.log('[CreateEntityTab] editingFrameIndex:', editingFrameIndex);
  console.log('[CreateEntityTab] selectedAnimationId:', selectedAnimationId);
  console.log('[CreateEntityTab] isEditingAnimationFrame:', isEditingAnimationFrame);
  
  if (isEditingAnimationFrame && selectedAnimationId) {
    // Editing animation frame from animation editor
    const animation = selectedEntity?.animations[selectedAnimationId];
    const frameIndex = animation?.frameIds[editingFrameIndex];
    
    console.log('[CreateEntityTab] Loading animation frame');
    console.log('[CreateEntityTab] animation:', animation);
    console.log('[CreateEntityTab] editingFrameIndex:', editingFrameIndex);
    console.log('[CreateEntityTab] frameIndex from animation:', frameIndex);
    console.log('[CreateEntityTab] characterFrames length:', currentScene?.characterFrames.length);
    
    if (frameIndex !== undefined && currentScene?.characterFrames[frameIndex]) {
      pixels1D = currentScene.characterFrames[frameIndex];
      console.log('[CreateEntityTab] Loaded pixels from frame', frameIndex, 'length:', pixels1D.length);
    } else {
      pixels1D = new Array(CHARACTER_SIZE * CHARACTER_SIZE).fill(-1);
      console.log('[CreateEntityTab] Using empty pixels (frameIndex:', frameIndex, 'available:', frameIndex !== undefined && currentScene?.characterFrames[frameIndex], ')');
    }
  } else {
    // Default behavior: editing default animation first frame
    const defaultAnim = selectedEntity?.animations[selectedEntity?.defaultAnimation];
    
    if (defaultAnim?.frameIds.length > 0 && currentScene?.characterFrames[defaultAnim.frameIds[0]]) {
      // Load existing frame from scene.characterFrames
      pixels1D = currentScene.characterFrames[defaultAnim.frameIds[0]];
    } else {
      // No frame yet - create empty
      pixels1D = new Array(CHARACTER_SIZE * CHARACTER_SIZE).fill(-1);
    }
  }
  
  // Convert 1D pixels to 2D for DrawTab (16x16 = 256 pixels)
  const initialData = [];
  for (let y = 0; y < CHARACTER_SIZE; y++) {
    initialData.push(pixels1D.slice(y * CHARACTER_SIZE, (y + 1) * CHARACTER_SIZE));
  }

  // Create stable string representation of pixels
  const pixelsString = useMemo(() => pixels1D.join(','), [pixels1D.join(',')]);

  // Detect if pixels changed externally (e.g., flip operation) but not during painting
  useEffect(() => {
    if (lastPixelsRef.current !== null && lastPixelsRef.current !== pixelsString && !isPaintingRef.current) {
      // Pixels changed externally (not by user painting), force remount
      setRemountKey(prev => prev + 1);
    }
    lastPixelsRef.current = pixelsString;
  }, [pixelsString]);

  if (!selectedEntity) {
    return (
      <div style={{ padding: '16px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
        <p>No entity selected.</p>
        <p>Select an entity from the Character Set to edit.</p>
      </div>
    );
  }

  return (
    <DrawTab 
      size={CHARACTER_SIZE} 
      initialData={initialData}
      key={`${selectedEntityId}-${selectedAnimationId}-${editingFrameIndex}-${remountKey}`}
      minCellSize={20}
      onPaintStart={() => { isPaintingRef.current = true; }}
      onPaintEnd={() => { isPaintingRef.current = false; }}
    />
  );
}
