import type { StateCreator } from 'zustand';
import type { EditorState, ProjectActions } from '../types';
import Project from '../../model/Project';
import Scene from '../../model/Scene';
import { saveProjectToFile, quickSaveProject, exportSceneJSON } from '../../utils/fileIO';

export const createProjectSlice: StateCreator<EditorState, [["zustand/immer", never]], [], ProjectActions> = (set, get) => ({
    // This will be spread into the main store — only return the actions here.
    // State defaults are in editorStore.ts

    createNewProject: (name = 'Untitled Project', author = '') => {
        const project = new Project(0, name, '1.0.0', author);
        project.addScene(new Scene(0));

        set((state) => {
            state.project = project;
            state.currentFilePath = null;
            state.hasUnsavedChanges = false;
            state.history = [JSON.stringify(project.toJSON())];
            state.historyIndex = 0;
            state.selectedTileId = null;
            state.selectedCharacterId = null;
            state.selectedCollectibleId = null;
        });
    },

    loadProject: (projectData: any) => {
        const project = Project.fromJSON(projectData);

        set((state) => {
            state.project = project;
            state.hasUnsavedChanges = false;
            state.history = [JSON.stringify(project.toJSON())];
            state.historyIndex = 0;
        });
    },

    setCurrentFilePath: (path: string | null) => {
        set((state) => {
            state.currentFilePath = path;
        });
    },

    saveProject: async () => {
        const { project, currentFilePath } = get();
        if (!project) return null;

        try {
            let path: string | null;
            if (currentFilePath) {
                path = await quickSaveProject(project.toJSON(), currentFilePath);
            } else {
                path = await saveProjectToFile(project.toJSON(), project.getName());
                if (path) {
                    set((state) => { state.currentFilePath = path; });
                }
            }

            if (path) {
                set((state) => { state.hasUnsavedChanges = false; });
            }
            return path;
        } catch (error) {
            console.error('Failed to save project:', error);
            return null;
        }
    },

    saveProjectAs: async () => {
        const { project } = get();
        if (!project) return null;

        try {
            const path = await saveProjectToFile(project.toJSON(), project.getName());
            if (path) {
                set((state) => {
                    state.currentFilePath = path;
                    state.hasUnsavedChanges = false;
                });
            }
            return path;
        } catch (error) {
            console.error('Failed to save project:', error);
            return null;
        }
    },

    exportScene: async (sceneId: number) => {
        const { project } = get();
        if (!project) return null;

        const scene = project.getSceneById(sceneId);
        if (!scene) return null;

        try {
            return await exportSceneJSON(scene.toJSON(), scene.getName());
        } catch (error) {
            console.error('Failed to export scene:', error);
            return null;
        }
    },

    markUnsaved: () => {
        set((state) => { state.hasUnsavedChanges = true; });
    },

    markSaved: () => {
        set((state) => { state.hasUnsavedChanges = false; });
    },
});