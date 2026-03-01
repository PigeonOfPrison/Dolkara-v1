
export const createEntitySlice = (set, get) => ({
    // STATE
    selectedEntityId: null,
    
    // ========================================
    // ACTIONS - Entities
    // ========================================
    addEntityToCurrentScene: (entity) => set((state) => {
        const scene = state.scenes.find(s => s.id === state.currentSceneId);
        if (!scene) return state;
        
        scene.addEntity(entity);
        return { 
            scenes: [...state.scenes], 
            selectedEntityId: entity.id,
            inspectorTab: 'entity',
            isDirty: true 
        };
    }),
    
    updateEntity: (entityId, updates) => set((state) => {
        const scene = state.scenes.find(s => s.id === state.currentSceneId);
        if (!scene) return state;
        
        const entity = scene.entities.find(e => e.id === entityId);
        if (!entity) return state;
        
        try {
            // Use Entity class setters for validation
            if (updates.name !== undefined) entity.setName(updates.name);
            if (updates.tag !== undefined) entity.setTag(updates.tag);
            if (updates.health !== undefined) entity.setHealth(updates.health);
            if (updates.damage !== undefined) entity.setDamage(updates.damage);
            if (updates.speed !== undefined) entity.setSpeed(updates.speed);
            if (updates.canJump !== undefined) entity.setCanJump(updates.canJump);
            if (updates.canFly !== undefined) entity.setCanFly(updates.canFly);
            if (updates.moves !== undefined) entity.setMoves(updates.moves);
            if (updates.defaultAnimation !== undefined) entity.setDefaultAnimation(updates.defaultAnimation);
            if (updates.patrolPath !== undefined) entity.setPatrolPath(updates.patrolPath);
            if (updates.dropCurrency !== undefined) entity.setDropCurrency(updates.dropCurrency);
            if (updates.dropChance !== undefined) entity.setDropChance(updates.dropChance);
            if (updates.animations !== undefined) entity.animations = updates.animations;
            return { scenes: [...state.scenes], isDirty: true };
        } catch (error) {
            console.error('Failed to update entity:', error.message);
            return state;
        }
    }),
    
    deleteEntity: (entityId) => set((state) => {
        const scene = state.scenes.find(s => s.id === state.currentSceneId);
        if (!scene) return state;
        
        const index = scene.entities.findIndex(e => e.id === entityId);
        if (index !== -1) {
            scene.deleteEntity(index);
        }
        return { scenes: [...state.scenes], selectedEntityId: null, isDirty: true };
    }),

    // SELECTORS
    getSelectedEntity: () => {
        const state = get();
        const scene = state.getCurrentScene();
        return scene?.entities.find(e => e.id === state.selectedEntityId);
    },

    selectEntity: (entityId) => set((state) => {
        const currentCanvasTab = state.canvasTab;
        
        // Switch to tilemap if not already on entities or tilemap tabs
        // entities/tilemap tabs should remain, all other tabs (tiles, collectibles, create*) switch to tilemap
        const shouldSwitchToTilemap = 
            currentCanvasTab !== 'entities' && 
            currentCanvasTab !== 'tilemap';
        
        return {
            selectedEntityId: entityId,
            selectedTileId: null,
            selectedCollectibleId: null,
            inspectorTab: "entity",
            canvasTab: shouldSwitchToTilemap ? "tilemap" : currentCanvasTab
        };
    }),

    // Animation Frame Management
    addAnimationFrame: (entityId, animationId, pixelData) => set((state) => {
        const scene = state.getCurrentScene();
        if (!scene) return state;

        const entity = scene.entities.find(e => e.id === entityId);
        if (!entity) return state;

        // Add frame to scene's characterFrames pool
        const frameIndex = scene.characterFrames.length;
        scene.characterFrames.push(pixelData);

        // Add frame index to entity's animation
        if (!entity.animations[animationId]) {
            entity.animations[animationId] = { frameIds: [], fps: 6, loop: false };
        }
        entity.animations[animationId].frameIds.push(frameIndex);

        // Update preview pixels if this is the first frame of default animation
        if (animationId === entity.defaultAnimation && entity.animations[animationId].frameIds.length === 1) {
            entity.updatePreviewPixels(scene.characterFrames);
        }

        console.log(`[EntitySlice] Added frame ${frameIndex} to ${animationId}`);
        return { scenes: [...state.scenes], isDirty: true };
    }),

    updateAnimationFrame: (entityId, animationId, frameSlotIndex, pixelData) => set((state) => {
        const scene = state.getCurrentScene();
        if (!scene) return state;

        const entityIndex = scene.entities.findIndex(e => e.id === entityId);
        if (entityIndex === -1) return state;
        
        const entity = scene.entities[entityIndex];
        if (!entity.animations[animationId]) return state;

        const frameIds = entity.animations[animationId].frameIds;
        if (frameSlotIndex < 0 || frameSlotIndex >= frameIds.length) return state;

        // Update the frame in scene's characterFrames pool
        const frameIndex = frameIds[frameSlotIndex];
        scene.characterFrames[frameIndex] = pixelData;

        // Update preview pixels if this is the first frame of default animation
        if (animationId === entity.defaultAnimation && frameSlotIndex === 0) {
            entity.updatePreviewPixels(scene.characterFrames);
            // Replace entity with a new reference to trigger React re-render
            scene.entities[entityIndex] = entity.clone();
        }

        console.log(`[EntitySlice] Updated frame ${frameIndex} at slot ${frameSlotIndex} in ${animationId}`);
        return { scenes: [...state.scenes], isDirty: true };
    }),

    removeAnimationFrame: (entityId, animationId, frameSlotIndex) => set((state) => {
        const scene = state.getCurrentScene();
        if (!scene) return state;

        const entity = scene.entities.find(e => e.id === entityId);
        if (!entity || !entity.animations[animationId]) return state;

        const frameIds = entity.animations[animationId].frameIds;
        if (frameSlotIndex < 0 || frameSlotIndex >= frameIds.length) return state;

        // Remove frame reference from animation
        const frameIndex = frameIds[frameSlotIndex];
        entity.animations[animationId].frameIds.splice(frameSlotIndex, 1);

        // Note: We don't remove from characterFrames pool to avoid index shifting
        // The frame stays in the pool but is no longer referenced

        console.log(`[EntitySlice] Removed frame ${frameIndex} from slot ${frameSlotIndex} in ${animationId}`);
        return { scenes: [...state.scenes], isDirty: true };
    }),

    updateAnimationSettings: (entityId, animationId, settings) => set((state) => {
        const scene = state.getCurrentScene();
        if (!scene) return state;

        const entity = scene.entities.find(e => e.id === entityId);
        if (!entity || !entity.animations[animationId]) return state;

        if (settings.fps !== undefined) {
            entity.animations[animationId].fps = settings.fps;
        }
        if (settings.loop !== undefined) {
            entity.animations[animationId].loop = settings.loop;
        }

        console.log(`[EntitySlice] Updated settings for ${animationId}`);
        return { scenes: [...state.scenes], isDirty: true };
    })
});