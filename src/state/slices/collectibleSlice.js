
export const createCollectibleSlice = (set, get) => ({

    // STATE
    selectedCollectibleId: null,
    
    // ========================================
    // ACTIONS - Collectibles
    // ========================================
    addCollectibleToCurrentScene: (collectible) => set((state) => {
        const scene = state.scenes.find(s => s.id === state.currentSceneId);
        if (!scene) return state;
        
        scene.addCollectible(collectible);
        return { 
            scenes: [...state.scenes], 
            selectedCollectibleId: collectible.id,
            inspectorTab: 'collectible',
            isDirty: true 
        };
    }),
    
    updateCollectible: (collectibleId, updates) => set((state) => {
        const scene = state.scenes.find(s => s.id === state.currentSceneId);
        if (!scene) return state;
        
        const collectible = scene.collectibles.find(c => c.id === collectibleId);
        if (!collectible) return state;
        
        try {
            // Use Collectible class setters for validation
            if (updates.name !== undefined) collectible.setName(updates.name);
            if (updates.tag !== undefined) collectible.setTag(updates.tag);
            if (updates.value !== undefined) collectible.value = updates.value;
            if (updates.inventorySlot !== undefined) collectible.inventorySlot = updates.inventorySlot;
            if (updates.pixels !== undefined) collectible.pixels = updates.pixels;
            return { scenes: [...state.scenes], isDirty: true };
        } catch (error) {
            console.error('Failed to update collectible:', error.message);
            return state;
        }
    }),
    
    deleteCollectible: (collectibleId) => set((state) => {
        const scene = state.scenes.find(s => s.id === state.currentSceneId);
        if (!scene) return state;
        
        const index = scene.collectibles.findIndex(c => c.id === collectibleId);
        if (index !== -1) {
            scene.deleteCollectible(index);
        }
        return { scenes: [...state.scenes], selectedCollectibleId: null, isDirty: true };
    }),

    // SELECTOR
    getSelectedCollectible: () => {
        const state = get();
        const scene = state.getCurrentScene();
        return scene?.collectibles.find(c => c.id === state.selectedCollectibleId);
    },

    selectCollectible: (collectibleId) => set((state) => {
        const currentCanvasTab = state.canvasTab;
        
        // Switch to tilemap if not already on collectibles or tilemap tabs
        // collectibles/tilemap tabs should remain, all other tabs (tiles, entities, create*) switch to tilemap
        const shouldSwitchToTilemap = 
            currentCanvasTab !== 'collectibles' && 
            currentCanvasTab !== 'tilemap';
        
        return {
            selectedCollectibleId: collectibleId,
            selectedTileId: null,
            selectedEntityId: null,
            canvasTab: shouldSwitchToTilemap ? "tilemap" : currentCanvasTab,
            inspectorTab: 'collectible'
        };
    })
});