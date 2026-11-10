import type { WritableDraft } from 'immer';
import type { StateCreator } from 'zustand';
import type { EditorState, PaletteActions } from '../types';

import Scene from '../../model/Scene';

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

export const createPaletteSlice: StateCreator<EditorState, [["zustand/immer", never]], [], PaletteActions> = (set, get) => ({

    setColourAt: (index: number, colour: string) => {
        return withCurrentScene(get, set, (scene) => {
            const palette = scene.getPalette();
            if (!palette) return false;

            const success = palette.setColourAt(index, colour);
            if (success) scene.setPalette(palette);
            return success;
        });
    },

    addColour: (colour: string, index?: number) => {
        return withCurrentScene(get, set, (scene) => {
            const palette = scene.getPalette();
            if (!palette) return false;

            const success = palette.addColour(colour, index);
            if (success) scene.setPalette(palette);
            return success;
         });
    },

    deleteColour: (index: number) => {
        return withCurrentScene(get, set, (scene) => {
            const palette = scene.getPalette();
            if (!palette) return false;

            const success = palette.removeColour(index);
            if (success) scene.setPalette(palette);
            return success;
         });
    },
});