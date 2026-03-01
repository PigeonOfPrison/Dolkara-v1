import React, { useEffect, useRef } from 'react';
import useEditorStore from '../state/editorStore';
import Collectible from '../model/Collectible';
import { COLLECTIBLE_SIZE } from '../constants/hardwareLimits';
import '../css/TileSet.css';
import { PreviewCard } from '../components/PreviewCard';

/**
 * CollectibleSet - Grid display of all collectibles with create button
 */
export default function CollectibleSet() {
  const currentSceneId = useEditorStore(state => state.currentSceneId);
  const scenes = useEditorStore(state => state.scenes);
  const selectedCollectibleId = useEditorStore(state => state.selectedCollectibleId);
  const selectCollectible = useEditorStore(state => state.selectCollectible);
  const setCanvasTab = useEditorStore(state => state.setCanvasTab);
  const addCollectibleToCurrentScene = useEditorStore(state => state.addCollectibleToCurrentScene);

  const currentScene = scenes.find(s => s.id === currentSceneId);
  const collectibles = currentScene?.collectibles || [];
  const palette = currentScene?.palette?.colours || [];

  const handleCreateCollectible = () => {
    if (!currentScene) return;
    
    // Use array length as ID - it will always match the index after insertion
    const collectibleId = currentScene.collectibles.length;
    const draftCollectible = new Collectible(collectibleId, 'New Item');
    
    // Add collectible to scene - this also selects it and switches inspector
    addCollectibleToCurrentScene(draftCollectible);
    
    // Switch canvas to edit view
    setCanvasTab('createCollectible');
  };

  const handleSelectCollectible = (collectibleId) => {
    selectCollectible(collectibleId);
  };

  return (
    <div className="tileset-container">
      {/* Create New Collectible Button */}
      <button
        className="tileset-create-btn"
        onClick={handleCreateCollectible}
        title="Create New Collectible"
      >
        +
      </button>

      {/* Collectible Cards */}
      {collectibles.map(collectible => (
        // <CollectibleCard
        //   key={`${collectible.id}-${collectible.pixels.join(',')}`}
        //   collectible={collectible}
        //   palette={palette}
        //   isSelected={collectible.id === selectedCollectibleId}
        //   onClick={() => handleSelectCollectible(collectible.id)}
        // />
        <PreviewCard
            key={`${collectible.id}-${collectible.pixels.join(',')}`}
            type="collectible"
            entity={collectible}
            size={COLLECTIBLE_SIZE}
            scale={8}
            palette={palette}
            isSelected={collectible.id === selectedCollectibleId}
            onClick={() => handleSelectCollectible(collectible.id)}
        />
      ))}
    </div>
  );
}

/**
 * CollectibleCard - Individual collectible preview card with canvas rendering
 */
// function CollectibleCard({ collectible, palette, isSelected, onClick }) {
//   const canvasRef = useRef(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const ctx = canvas.getContext('2d');
//     const scale = 8; // Same scale as tiles
//     canvas.width = COLLECTIBLE_SIZE * scale;
//     canvas.height = COLLECTIBLE_SIZE * scale;

//     // Draw checkerboard pattern background for transparency
//     for (let y = 0; y < COLLECTIBLE_SIZE; y++) {
//       for (let x = 0; x < COLLECTIBLE_SIZE; x++) {
//         const isLight = (x + y) % 2 === 0;
//         ctx.fillStyle = isLight ? '#2a2a2a' : '#1e1e1e';
//         ctx.fillRect(x * scale, y * scale, scale, scale);
//       }
//     }

//     // Draw collectible pixels
//     collectible.pixels.forEach((colorIndex, index) => {
//       if (colorIndex === -1 || colorIndex < 0) return; // Skip transparent
      
//       const x = index % COLLECTIBLE_SIZE;
//       const y = Math.floor(index / COLLECTIBLE_SIZE);
//       const color = palette[colorIndex];
      
//       if (color) {
//         ctx.fillStyle = color;
//         ctx.fillRect(x * scale, y * scale, scale, scale);
//       }
//     });
//   }, [collectible, palette]);

//   return (
//     <button
//       className={`tile-card ${isSelected ? 'active' : ''}`}
//       onClick={onClick}
//       title={`${collectible.name} (ID: ${collectible.id})`}
//     >
//       <canvas ref={canvasRef} />
//     </button>
//   );
// }