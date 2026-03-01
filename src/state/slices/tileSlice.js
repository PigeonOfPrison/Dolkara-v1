
export const createTileSlice = (set, get) => ({
    // STATE
    selectedTileId: null,
    
    // ========================================
    // ACTIONS - Tiles
    // ========================================
    addTileToCurrentScene: (tile) => set((state) => {
        const scene = state.scenes.find(s => s.id === state.currentSceneId);
        if (!scene) return state;
        
        console.log('[TileSlice] Before addTile - tiles:', scene.tiles.map(t => t.id));
        scene.addTile(tile);
        console.log('[TileSlice] After addTile - tiles:', scene.tiles.map(t => t.id));
        console.log('[TileSlice] Setting selectedTileId to:', tile.id);
        
        return { 
            scenes: [...state.scenes], 
            selectedTileId: tile.id,
            inspectorTab: 'tile',
            isDirty: true 
        };
    }),
    
    updateTile: (tileId, updates) => set((state) => {
        const scene = state.scenes.find(s => s.id === state.currentSceneId);
        if (!scene) return state;
        
        const tile = scene.tiles.find(t => t.id === tileId);
        if (!tile) return state;
        
        console.log('[TileSlice] updateTile called for tile:', tileId, 'with updates:', Object.keys(updates));
        
        try {
            // Use Tile class setters for validation
            if (updates.name !== undefined) tile.setName(updates.name);
            if (updates.solid !== undefined) tile.setSolid(updates.solid);
            if (updates.opacity !== undefined) tile.setOpacity(updates.opacity);
            if (updates.damage !== undefined) tile.setDamage(updates.damage);
            if (updates.tag !== undefined) tile.setTag(updates.tag);
            if (updates.layer !== undefined) tile.setLayer(updates.layer);
            if (updates.pixels !== undefined) {
                console.log('[TileSlice] Updating pixels for tile:', tileId);
                tile.pixels = updates.pixels;
            }
            console.log('[TileSlice] Tile updated, returning new scenes array');
            return { scenes: [...state.scenes], isDirty: true };
        } catch (error) {
            console.error('Failed to update tile:', error.message);
            return state;
        }
    }),
    
    deleteTile: (tileId) => set((state) => {
        const scene = state.scenes.find(s => s.id === state.currentSceneId);
        if (!scene) return state;
        
        const index = scene.tiles.findIndex(t => t.id === tileId);
        if (index !== -1) {
            scene.deleteTile(index);
        }
        return { scenes: [...state.scenes], selectedTileId: null, isDirty: true };
    }),

    // SELECTORS 
    getSelectedTile: () => {
        const state = get();
        const scene = state.getCurrentScene();
        console.log('[TileSlice] getSelectedTile - selectedTileId:', state.selectedTileId);
        console.log('[TileSlice] getSelectedTile - scene:', scene?.id);
        console.log('[TileSlice] getSelectedTile - tiles:', scene?.tiles.map(t => t.id));
        const tile = scene?.tiles.find(t => t.id === state.selectedTileId);
        console.log('[TileSlice] getSelectedTile - found tile:', tile?.id);
        return tile;
    },

    selectTile: (tileId) => {
        console.log('[TileSlice] selectTile called with:', tileId);
        const currentCanvasTab = get().canvasTab;
        
        // Switch to tilemap if not already on tiles or tilemap tabs
        // tiles/tilemap tabs should remain, all other tabs (entities, collectibles, create*) switch to tilemap
        const shouldSwitchToTilemap = 
            currentCanvasTab !== 'tiles' && 
            currentCanvasTab !== 'tilemap';
        
        set({ 
            selectedTileId: tileId,
            selectedEntityId: null,
            selectedCollectibleId: null,
            inspectorTab: "tile",
            canvasTab: shouldSwitchToTilemap ? "tilemap" : currentCanvasTab
        });
    }
});