import type { WritableDraft } from 'immer';
import type { StateCreator } from 'zustand';
import type { EditorState, SpawnExitActions } from '../types';

import Scene from '../../model/Scene';
import SpawnPoint from '../../model/SpawnPoint';
import Exit from '../../model/Exit';


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

export const createSpawnExitSlice: StateCreator<EditorState, [["zustand/immer", never]], [], SpawnExitActions> = (set, get) => ({

    addSpawnPoint: (spawnPoint: SpawnPoint) => {
        return withCurrentScene(get, set, (scene) => scene.addSpawnPoint(spawnPoint));
    },

    deleteSpawnPoint: (spawnPointId: number) => {
        const success = withCurrentScene(get, set, (scene) => scene.deleteSpawnPoint(spawnPointId));

        if (success) {
            set((state) => {
                if (state.selectedSpawnPointId === spawnPointId) 
                    state.selectedSpawnPointId = null;
            });
        }
        return success;
    },

    updateSpawnPoint: (spawnPointId: number, spawnPoint: SpawnPoint) => {
        return withCurrentScene(get, set, (scene) => scene.setSpawnPointById(spawnPointId, spawnPoint));
    },

    // EXITS
    addExit: (exit: Exit) => {
        return withCurrentScene(get, set, (scene) => scene.addExit(exit));
    },

    deleteExit: (exitId: number) => {
        const success = withCurrentScene(get, set, (scene) => scene.deleteExit(exitId));

        if (success) {
            set((state) => {
                if (state.selectedExitId === exitId) 
                    state.selectedExitId = null;
            });
        }
        return success;
    },

    updateExit: (exitId: number, exit: Exit) => {
        return withCurrentScene(get, set, (scene) => scene.setExitById(exitId, exit));
    },  
});

