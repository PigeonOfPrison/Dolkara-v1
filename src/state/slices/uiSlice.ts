import type { StateCreator } from "zustand";
import type { EditorState, UISlice } from "../types";


export const createUISlice: StateCreator<EditorState, [["zustand/immer", never]], [], UISlice> = (set, get) => ({

    // the types comes from the UIState interface in types.ts. we can use this to ensure type safety and autocompletion when setting the state.
    setCurrentScene: (sceneId) => {
        const project = get().project;
        if (!project) return false;
        const sceneExists = project.getSceneById(sceneId) !== null;
        if (sceneExists) {
            set((state) => { state.currentSceneId = sceneId; });
            return true;
        }
        console.warn(`Scene with id ${sceneId} does not exist in the project.`);
        return false;
    },
    setCanvasTab: (tab) => set((state) => { state.canvasTab = tab; }),
    setInspectorTab: (tab) => set((state) => { state.inspectorTab = tab; }),
    setCharacterTab: (tab) => set((state) => { state.characterTab = tab; }),
    setTileTab: (tab) => set((state) => { state.tileTab = tab; }),
    setCurrentTool: (tool) => set((state) => { state.activeTool = tool; }),
    setSelectedColour: (index) => set((state) => { state.selectedColourIndex = index; }),
    setCurrentLayer: (layer) => set((state) => { state.currentLayer = layer; }),
    toggleGrid: () => set((state) => { state.showGrid = !state.showGrid; }),

    // remove the hardcoded zoom limits and make it more flexible. perhaps adding this to hardware limits file?
    setZoom: (zoom) => set((state) => { state.zoom = Math.max(1, Math.min(5, zoom)); }),

    // ---------------------------------------------------------------------------------
    // SELECTION
    // ---------------------------------------------------------------------------------


    selectTile: (tileId) => set((state) => { state.selectedTileId = tileId; }),
    selectCharacter: (characterId) => set((state) => { state.selectedCharacterId = characterId; }),
    selectCharacterTemplate: (templateId) => set((state) => { state.selectedCharacterTemplateId = templateId; }),
    selectCollectible: (collectibleId) => set((state) => { state.selectedCollectibleId = collectibleId; }),
    selectSpawnPoint: (spawnPointId) => set((state) => { state.selectedSpawnPointId = spawnPointId; }),
    selectExit: (exitId) => set((state) => { state.selectedExitId = exitId; }),

    clearSelection: () => set((state) => { 
        state.selectedTileId = null; 
        state.selectedCharacterId = null; 
        state.selectedCharacterTemplateId = null;
        state.selectedCollectibleId = null;
        state.selectedSpawnPointId = null;
        state.selectedExitId = null;
     }),

     // ---------------------------------------------------------------------------------
     // CLIPBOARD
     // ---------------------------------------------------------------------------------

    copyToClipboard: (type, data) => set((state) => { state.clipboard = { type, data: data.clone() }; }),
    
    pasteFromClipboard: () => {
        const { clipboard } = get();

        if (!clipboard.data) return null;
        return clipboard.data.clone();
    },

    clearClipboard: () => set((state) => { state.clipboard = {type : null, data : null}; }),
});