import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import Scene from '../model/Scene';
import { saveProjectToFile, quickSaveProject, loadProjectFromFile, exportSceneJSON } from '../utils/fileIO';
import { readTextFile } from '@tauri-apps/plugin-fs';

import { createUISlice } from './slices/uiSlice';
import { createPaletteSlice } from './slices/paletteSlice';
import { createSceneSlice } from './slices/sceneSlice';
import { createTileSlice } from './slices/tileSlice';
import { createEntitySlice } from './slices/entitySlice';
import { createCollectibleSlice } from './slices/collectibleSlice';


const useEditorStore = create(
  devtools(
    persist(
      (set, get) => ({
        // ========================================
        // PROJECT STATE
        // ========================================
        projectName: "Untitled Game",
        lastSavedPath: null,
        autoLoadOnStart: true,
		isDirty: false,

		...createSceneSlice(set, get),
		...createUISlice(set, get),
		...createPaletteSlice(set, get),
		...createTileSlice(set, get),
		...createEntitySlice(set, get),
		...createCollectibleSlice(set, get),


        newProject: async () => {
            const state = get();
            
            // Auto-save if there's content and a path exists
            if (state.isDirty && state.lastSavedPath) {
                console.log('Auto-saving current project before creating new one...');
                await state.quickSave();
            } else if (state.isDirty && !state.lastSavedPath && state.scenes.length > 0) {
                // Has content but never saved - prompt for save location
                console.log('Prompting to save unsaved project...');
                const saved = await state.saveProject();
                if (!saved) {
                    // User cancelled save dialog, abort new project
                    console.log('New project cancelled - user declined to save');
                    return false;
                }
            }
            
            // CRITICAL: Clear lastSavedPath immediately to prevent accidental overwrites
            set({ lastSavedPath: null });
            
            // Create a default scene
            // Scene constructor: (id, name, width, height)
            const defaultScene = new Scene("scene_1", "Main Scene", 32, 12);
            
            // Reset everything
            set({
                projectName: "Untitled Game",
                scenes: [defaultScene],
                currentSceneId: defaultScene.id,
                selectedTileId: null,
                selectedEntityId: null,
                selectedCollectibleId: null,
                selectedSpawnPointId: null,
                selectedExitId: null,
                currentTool: "brush",
                currentMode: "tilemap",
                showGrid: true,
                zoom: 1,
                inspectorTab: "scene",
                canvasTab: "tilemap",
                isDirty: false,
                lastSavedPath: null
            });
            
            console.log('New project created with default scene:', defaultScene.id);
            return true;
        },

        // exporting the current state of the project to the json file
        exportProjectData: () => {
            const state = get();

            return {
                projectName: state.projectName,
                scenes: state.scenes.map(scene => scene.toJSON()),
                version: "1.0.0"
            };
        },

        loadProjectData: (data) => set({
            projectName: data.projectName,
            scenes: data.scenes.map(sceneData => Scene.fromJSON(sceneData)),
            currentSceneId: data.scenes[0]?.id || null,
            isDirty: false
        }),

        // ========================================
        // ACTIONS - Project
        // ========================================
        setProjectName: (name) => set({ projectName: name, isDirty: true }),

        clearSelection: () => set({
          selectedTileId: null,
          selectedEntityId: null,
          selectedCollectibleId: null,
          selectedSpawnPointId: null,
          selectedExitId: null
        }),

        // Paint selected color on the tilemap grid
        paintColorOnGrid: (x, y) => {
            const { currentSceneId, scenes, selectedColorIndex } = get();
            if (!currentSceneId) return;

            const scene = scenes.find(s => s.id === currentSceneId);
            if (!scene) return;

            // Paint the color index on the tilemap at position (x, y)
            if (scene.tilemap && scene.tilemap[y] && scene.tilemap[y][x] !== undefined) {
                const updatedScenes = scenes.map(s => {
                    if (s.id === currentSceneId) {
                        const newTilemap = s.tilemap.map((row, rowIdx) => 
                            rowIdx === y ? row.map((cell, colIdx) => 
                                colIdx === x ? selectedColorIndex : cell
                            ) : row
                        );
                        return { ...s, tilemap: newTilemap };
                    }
                    return s;
                });

                set({ scenes: updatedScenes, isDirty: true });
            }
        },

        // TODO: Implement tile painting when tile system is ready
        // paintTileOnGrid: (x, y) => {
        //     const { currentSceneId, scenes, selectedTileId } = get();
        //     if (!currentSceneId || !selectedTileId) return;
        //
        //     const scene = scenes.find(s => s.id === currentSceneId);
        //     if (!scene) return;
        //
        //     // Paint the tile ID on the tilemap at position (x, y)
        //     if (scene.tilemap && scene.tilemap[y] && scene.tilemap[y][x] !== undefined) {
        //         const updatedScenes = scenes.map(s => {
        //             if (s.id === currentSceneId) {
        //                 const newTilemap = s.tilemap.map((row, rowIdx) => 
        //                     rowIdx === y ? row.map((cell, colIdx) => 
        //                         colIdx === x ? selectedTileId : cell
        //                     ) : row
        //                 );
        //                 return { ...s, tilemap: newTilemap };
        //             }
        //             return s;
        //         });
        //
        //         set({ scenes: updatedScenes, isDirty: true });
        //     }
        // },

        // Quick save to existing file (no dialog)
        quickSave: async () => {
            const { lastSavedPath, exportProjectData } = get();
            
            // If no previous save path, use Save As dialog
            if (!lastSavedPath) {
                return get().saveProject();
            }
            
            const data = exportProjectData();
            
            try {
                await quickSaveProject(data, lastSavedPath);
                set({ isDirty: false });
                console.log('Project quick saved to:', lastSavedPath);
                return lastSavedPath;
            } catch (error) {
                console.error("Failed to quick save project:", error);
                return null;
            }
        },

        // Save As - always opens dialog to choose location
        saveProject: async () => {
            const { projectName, exportProjectData } = get();
            const data = exportProjectData();

            try {
                const filePath = await saveProjectToFile(data, projectName);
                if (filePath) {
                // track last saved path (useful for "Save" vs "Save As")
                set({ lastSavedPath: filePath, isDirty: false });
                console.log('Project saved:', filePath);
                }
                return filePath;
            }
            catch (error) {
                console.error("Failed to save project:", error);
                return null;
            }
        },

        loadProject: async () => {
            try {
                const res = await loadProjectFromFile();
                if (res) {
                const { loadProjectData } = get();
                loadProjectData(res.data);
                set({ lastSavedPath: res.path, isDirty: false });

                console.log('Project loaded:', res.data.projectName);
                return true;
                }
                return false;
            }
            catch (error) {
                console.log("Failed to load project:", error);
                return false;
            }
        },

        loadLastProject: async () => {
            const { lastSavedPath, autoLoadOnStart} = get();

            // if lastSavedPath == null ie no prev path
            if (!autoLoadOnStart || !lastSavedPath)
                return false;
            
            try {
                const content = await readTextFile(lastSavedPath);
                const data = JSON.parse(content);

                const { loadProjectData } = get();
                loadProjectData(data);

                console.log('Auto-loaded last project: ', data.projectName);
                return true;
            }
            catch (error) {
                console.log('Failed to auto-load last project: ', error);

                // this will happen when the file is deleted or moved, so delete the now invalid path
                set ({ lastSavedPath: null});
                return false;
            }
        },
      }),

      { 
        name: 'dolkaraa-editor-storage', // LocalStorage key
        partialize: (state) => ({
            // Only persist these (not UI state)
            showGrid: state.showGrid,
            zoom: state.zoom,
            currentTool: state.currentTool,
            currentMode: state.currentMode,
            inspectorTab: state.inspectorTab,
            // Don't persist canvasTab - always reset to default on load
            lastSavedPath: state.lastSavedPath,
            autoLoadOnStart: state.autoLoadOnStart
        }) 
      }
    )
  )
);

export default useEditorStore;