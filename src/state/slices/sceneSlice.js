import Scene from "../../model/Scene";

export const createSceneSlice = (set, get) => ({

    // ========================================
    // SCENES STATE
    // ========================================
    scenes: [], // Array of Scene objects
    currentSceneId: null,
    selectedSpawnPointId: null,
    selectedExitId: null,

    // ========================================
    // ACTIONS - Scenes
    // ========================================
    createScene: (scene) => set((state) => ({
        scenes: [...state.scenes, scene],
        currentSceneId: scene.id,
        isDirty: true
    })),
    
    deleteScene: (sceneId) => set((state) => ({
        scenes: state.scenes.filter(s => s.id !== sceneId),
        currentSceneId: state.currentSceneId === sceneId ? null : state.currentSceneId,
        isDirty: true
    })),
    
    setCurrentScene: (sceneId) => set({ currentSceneId: sceneId }),
    
    updateScene: (sceneId, updates) => set((state) => {
        const scene = state.scenes.find(s => s.id === sceneId);
        if (!scene) return state;
        
        // Apply updates to the scene instance directly
        Object.keys(updates).forEach(key => {
            scene[key] = updates[key];
        });
        
        // Create new array reference to trigger re-renders
        return {
            scenes: [...state.scenes],
            isDirty: true
        };
    }),

    exportCurrentScene: async () => {
        const { getCurrentScene } = get();
        const scene = getCurrentScene();
        if (!scene) {
            console.warn('No scene selected to export');
            return null;
        }
        
        // TODO: Validate tilemap before export
        // - Check if all tiles in terrainLayer are valid (no -1/empty cells)
        // - Show error popup if validation fails
        // - Prevent export until tilemap is fully covered
        
        try {
            const sceneJSON = scene.toJSON();
            const filePath = await exportSceneJSON(sceneJSON, scene.name);
            if (filePath) {
            console.log('Scene exported:', filePath);
            }
            return filePath;
        } catch (error) {
            console.error("Failed to export scene:", error);
            return null;
        }
    },

    // SELECTOR
    getCurrentScene: () => {
        const state = get();
        return state.scenes.find(s => s.id === state.currentSceneId);
    }
});