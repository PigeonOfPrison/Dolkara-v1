import React from 'react';
import useEditorStore from '../state/editorStore';
import Entity from '../model/Entity';
import { CHARACTER_SIZE } from '../constants/hardwareLimits';
import { PreviewCard } from '../components/PreviewCard';
import '../css/CharacterSet.css';

/**
 * CharacterSet - Grid display of all entities with create button
 */
export default function CharacterSet() {
  const currentSceneId = useEditorStore(state => state.currentSceneId);
  const scenes = useEditorStore(state => state.scenes);
  const selectedEntityId = useEditorStore(state => state.selectedEntityId);
  const selectEntity = useEditorStore(state => state.selectEntity);
  const setCanvasTab = useEditorStore(state => state.setCanvasTab);
  const addEntityToCurrentScene = useEditorStore(state => state.addEntityToCurrentScene);

  const currentScene = scenes.find(s => s.id === currentSceneId);
  const entities = currentScene?.entities || [];
  const palette = currentScene?.palette?.colours || [];

  const handleCreateEntity = () => {
    if (!currentScene) return;
    
    // Use array length as ID - it will always match the index after insertion
    const entityId = currentScene.entities.length;
    const draftEntity = new Entity(entityId, 'New Entity');
    
    // Add entity to scene - this also selects it and switches inspector
    addEntityToCurrentScene(draftEntity);
    
    // Switch canvas to edit view
    setCanvasTab('createEntity');
  };

  const handleSelectEntity = (entityId) => {
    selectEntity(entityId);
  };

  return (
    <div className="characterset-container">
      {/* Create New Entity Button */}
      <button
        className="characterset-create-btn"
        onClick={handleCreateEntity}
        title="Create New Entity"
      >
        +
      </button>

      {/* Entity Cards */}
      {entities.map(entity => (
        <PreviewCard
          key={`${entity.id}-${entity.pixels.join(',').substring(0, 50)}`}
          type="character"
          entity={entity}
          size={CHARACTER_SIZE}
          scale={4}
          palette={palette}
          isSelected={entity.id === selectedEntityId}
          onClick={() => handleSelectEntity(entity.id)}
        />
      ))}
    </div>
  );
}

/**
 * EntityCard - Individual entity preview card with canvas rendering
 * Shows the first frame of the default animation from scene.characterFrames
 */
// function EntityCard({ entity, palette, isSelected, onClick }) {
//   const canvasRef = useRef(null);
//   const scenes = useEditorStore(state => state.scenes);
//   const currentSceneId = useEditorStore(state => state.currentSceneId);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const ctx = canvas.getContext('2d');
//     const scale = 4; // Scale to fit card
//     canvas.width = CHARACTER_SIZE * scale;
//     canvas.height = CHARACTER_SIZE * scale;

//     // Draw checkerboard pattern background for transparency
//     for (let y = 0; y < CHARACTER_SIZE; y++) {
//       for (let x = 0; x < CHARACTER_SIZE; x++) {
//         const isLight = (x + y) % 2 === 0;
//         ctx.fillStyle = isLight ? '#2a2a2a' : '#1e1e1e';
//         ctx.fillRect(x * scale, y * scale, scale, scale);
//       }
//     }

//     // Draw entity's first animation frame from scene.characterFrames
//     const currentScene = scenes.find(s => s.id === currentSceneId);
//     if (!currentScene) return;
    
//     const defaultAnim = entity.animations[entity.defaultAnimation];
//     if (defaultAnim.frameIds.length > 0) {
//       const frameIndex = defaultAnim.frameIds[0];
//       const framePixels = currentScene.characterFrames[frameIndex];
      
//       if (framePixels && framePixels.length === CHARACTER_SIZE * CHARACTER_SIZE) {
//         framePixels.forEach((colorIndex, index) => {
//           if (colorIndex === -1 || colorIndex < 0) return; // Skip transparent
          
//           const x = index % CHARACTER_SIZE;
//           const y = Math.floor(index / CHARACTER_SIZE);
//           const color = palette[colorIndex];
          
//           if (color) {
//             ctx.fillStyle = color;
//             ctx.fillRect(x * scale, y * scale, scale, scale);
//           }
//         });
//       }
//     }
//   }, [entity, palette, scenes, currentSceneId]);

//   return (
//     <button
//       className={`characterset-card ${isSelected ? 'active' : ''}`}
//       onClick={onClick}
//       title={`${entity.name} (ID: ${entity.id})`}
//     >
//       <canvas ref={canvasRef} />
//     </button>
//   );
// }
