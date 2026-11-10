import type { StateCreator } from "zustand";
import type { EditorState, SceneActions } from "../types";
import Scene from "../../model/Scene";


export const createSceneSlice: StateCreator<EditorState, [["zustand/immer", never]], [], SceneActions> = (set, get) => ({
    // This will be spread into the main store — only return the actions here.
    // State defaults are in editorStore.ts

    addScene: () => {
        const { project } = get();
        if(!project) return false;

        // should i create a function in Project to get the next scene id instead of relying on array length?
        const newScene = new Scene(project.getScenes().length);
        const success = project.addScene(newScene);

        if(success) {
            set((state) => {state.project = project; state.hasUnsavedChanges = true; });
            get().pushHistory();
        }

        return success;
    },

    deleteScene: (sceneId: number) => {
        const { project } = get();
        if(!project) return false;

        const success = project.deleteScene(sceneId);

        if(success) {
            set((state) => {state.project = project; state.hasUnsavedChanges = true; });
            get().pushHistory();
        }
        return success;
    },

    duplicateScene: (sceneId: number) => {
        const { project } = get();
        if(!project) return false;

        const scene = project.getSceneById(sceneId);
        if(!scene) return false;

        const clone = scene.clone();
        clone.setId(project.getScenes().length);
        clone.setName(scene.getName() + ' (Copy)');

        const success = project.addScene(clone);

        if(success) {
            set((state) => {state.project = project; state.hasUnsavedChanges = true; });
            get().pushHistory();
        }
        return success;
    },

    setCurrentScene: (sceneId: number) => {
        const { project } = get();
        if(!project) return false;

        //const success = project.setCurrentSceneId(sceneId);
        const success = project.getSceneById(sceneId) !== null; // check if the scene exists before setting it

        if(success) {
            set((state) => {
                state.project = project; 
                state.currentSceneId = sceneId; 
                state.hasUnsavedChanges = true; 
            });
            get().pushHistory();
        }
        return success;
    },

    renameScene: (sceneId: number, newName: string) => {
        const { project } = get();
        if(!project) return false;

        const scene = project.getSceneById(sceneId);
        if(!scene) return false;

        scene.setName(newName);
        const success = project.setSceneById(sceneId, scene);

        if(success) {
            set((state) => {state.project = project; state.hasUnsavedChanges = true; });
            get().pushHistory();
        }
        return success;
    },

    setSceneTag: (sceneId: number, tags: string) => {
        const { project } = get();
        if(!project) return false;

        const scene = project.getSceneById(sceneId);
        if(!scene) return false;

        scene.setTag(tags);
        const success = project.setSceneById(sceneId, scene);

        if(success) {
            set((state) => {state.project = project; state.hasUnsavedChanges = true; });
            get().pushHistory();
        }
        return success;
    },

    resizeScene: (sceneId: number, newWidth: number, newHeight: number) => {
        const { project } = get();
        if(!project) return false;

        const scene = project.getSceneById(sceneId);
        if(!scene) return false;

        scene.resize(newWidth, newHeight);
        const success = project.setSceneById(sceneId, scene);

        if(success) {
            set((state) => {state.project = project; state.hasUnsavedChanges = true; });
            get().pushHistory();
        }
        return success;
    }
});