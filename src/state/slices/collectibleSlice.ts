import type { StateCreator } from "zustand";
import type { EditorState, CollectibleActions } from "../types";
import type { WritableDraft } from "immer";

import Collectible from "../../model/Collectible";
import Scene from "../../model/Scene";

type ImmerSet = (fn: (state: WritableDraft<EditorState>) => void) => void;
type ImmerGet = () => EditorState;

function withCurrentScene(
    get: ImmerGet, 
    set: ImmerSet, 
    operation: (scene: Scene, project: any) => boolean, 
    saveHistory: boolean = true
): boolean {
    const { project } = get();
    if (!project) return false;

    const sceneId = get().currentSceneId;
    if (sceneId === null) return false;

    const scene = project?.getSceneById(sceneId);
    if (!scene) return false;

    // perform the operation
    const success = operation(scene, project);

    if (success) {
        project.setSceneById(scene.getId(), scene);
        set((state) => { state.project = project; state.hasUnsavedChanges = true; });
        if (saveHistory) get().pushHistory();
    }

    return success;
}

export const createCollectibleSlice: StateCreator<EditorState, [["zustand/immer", never]], [], CollectibleActions> = (set, get) => ({

    addCollectible: (collectible: Collectible) => {
        return withCurrentScene(get, set, (scene) => scene.addCollectible(collectible));
    },

    deleteCollectible: (collectibleId: number) => {
        const success = withCurrentScene(get, set, (scene) => scene.deleteCollectible(collectibleId));

        if (success) {
            set((state) => {
                if (state.selectedCollectibleId === collectibleId) 
                    state.selectedCollectibleId = null;
            });
        }
        return success;
    },

    duplicateCollectible: (collectibleId: number) => {
        const { project } = get();
        if (!project) return false;

        const sceneId = get().currentSceneId;
        if (sceneId === null) return false;

        const scene = project.getSceneById(sceneId);
        if (!scene) return false;

        const collectible = scene.getCollectibleById(collectibleId);
        if (!collectible) return false;

        const newCollectible = collectible.clone();
        newCollectible.setId(scene.nextCollectibleId());
        newCollectible.setName(collectible.getName() + ' _Copy');

        return get().addCollectible(newCollectible);
    },

    updateCollectible: (collectibleId: number, collectible: Collectible) => {
        return withCurrentScene(get, set, (scene) => scene.setCollectibleById(collectibleId, collectible));
    },

    placeCollectible: (row: number, col: number, collectibleId: number) => {
        return withCurrentScene(get, set, (scene) => scene.setCollectibleAt(row, col, collectibleId));
    },

    removeCollectibleAt: (row: number, col: number) => {
        return withCurrentScene(get, set, (scene) => scene.removeCollectibleAt(row, col));
    }
});

    