
export const createPaletteSlice = (set, get) => ({

    // STATE
    selectedColourId: 0, // Default to first color

    // ========================================
    // ACTIONS - Palette Management
    // ========================================

    setSelectedColourId: (colorIndex) => set({ selectedColourId: colorIndex }),


    // Uses Scene's built-in palette methods which delegate to Palette class
    // DRY and also because they also check the validity
    setPaletteColor: (colorIndex, hexColor) => set((state) => {
        const scene = state.scenes.find(s => s.id === state.currentSceneId);
        if (!scene) return state;
        
        try {
            scene.setPaletteColor(colorIndex, hexColor);
            return { scenes: [...state.scenes], isDirty: true };
        } catch (error) {
            console.error('Failed to set palette color:', error.message);
            return state;
        }
    }),

    getPaletteColor: (colorIndex) => {
        const state = get();
        const scene = state.scenes.find(s => s.id === state.currentSceneId);
        if (!scene) return null;
        
        try {
            return scene.getPaletteColor(colorIndex);
        } catch (error) {
            console.error('Failed to get palette color:', error.message);
            return null;
        }
    },

    resetPalette: () => set((state) => {
        const scene = state.scenes.find(s => s.id === state.currentSceneId);
        if (!scene) return state;
        
        scene.resetPalette();
        return { scenes: [...state.scenes], isDirty: true };
    }),

    getCurrentPalette: () => {
        const state = get();
        const scene = state.scenes.find(s => s.id === state.currentSceneId);
        return scene ? scene.getPalette() : null;
    },

    getPaletteColours: () => {
        const state = get();
        const scene = state.scenes.find(s => s.id === state.currentSceneId);
        return scene ? scene.getPalette().getColours() : [];
    },
});