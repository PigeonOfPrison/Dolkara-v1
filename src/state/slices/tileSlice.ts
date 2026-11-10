import type { StateCreator } from 'zustand';
import type { EditorState, TileActions } from '../types';
import type { WritableDraft } from 'immer';

import { MAX_TILES_PER_SCENE } from '../../utils/HardwareLimits';
import Scene from '../../model/Scene';
import Tile from '../../model/Tile';
import Project from '../../model/Project';

/**
 * Helper: gets the current scene from the project, performs an operation,
 * then writes it back. Returns the scene or null.
 */
type ImmerSet = (fn: (state: WritableDraft<EditorState>) => void) => void;
type ImmerGet = () => EditorState;

function withCurrentScene(
    get: ImmerGet, 
    set: ImmerSet, 
    operation: (scene: Scene, project: Project) => boolean, 
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

export const createTileSlice: StateCreator<EditorState, [["zustand/immer", never]], [], TileActions> = (set, get) => ({

    addTile: (tile: Tile) => {
        return withCurrentScene(get, set, (scene) => scene.addTile(tile));
    },

    deleteTile: (tileId: number) => {
        const success = withCurrentScene(get, set, (scene) => scene.deleteTile(tileId));

        if (success) {
            set((state) => {
                if (state.selectedTileId === tileId) 
                    state.selectedTileId = null;
            });
        }
        return success;
    },

    duplicateTile: (tileId: number) => {
        const { project } = get();
        if (!project) return false;

        const sceneId = get().currentSceneId;
        if (sceneId === null) return false;

        const scene = project.getSceneById(sceneId);
        if (!scene) return false;

        const tile = scene.getTileById(tileId);
        if (!tile) return false;

        const newTile = tile.clone();

        // create a function in the scene that returns the length of the tiles array
        // getTiles() clones the array, so it is quite inefficient to call it multiple times. This is a workaround.
        newTile.setId(scene.nextTileId());
        newTile.setName(tile.getName() + ' _Copy');

        return get().addTile(newTile);
    },

    updateTile: (tileId: number, tile: Tile) => {
        return withCurrentScene(get, set, (scene) => scene.setTileById(tileId, tile));
    },

    paintTile: (layer: number, row: number, col: number, tileId: number) => {
        // no history push for individual paint strokes, we will push history after the user finishes painting (eg on mouse up)
        return withCurrentScene(get, set, (scene) => scene.setTileAt(layer, row, col, tileId), false);
    }, 

    fillTiles: (layer: number, row: number, col: number, tileId: number) => {
        return withCurrentScene(get, set, (scene) => {
            const targetTile = scene.getTileById(tileId);
            // create a function in tile to get the id for no-tile, instead of using MAX_TILES_PER_SCENE
            const targetId = targetTile ? targetTile.getId() : MAX_TILES_PER_SCENE;

            return scene.fillTiles(layer, row, col, targetId);
        });
    },

    eraseTile: (layer: number, row: number, col: number) => {
        // no history push for individual erase strokes, we will push history after the user finishes erasing (eg on mouse up)
        return withCurrentScene(get, set, (scene) => scene.eraseTileAt(layer, row, col, ), false);
    },
});