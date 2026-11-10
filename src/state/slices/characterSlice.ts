import type { StateCreator } from "zustand";
import type { EditorState, CharacterActions } from "../types";
import type { WritableDraft } from "immer";

import Character from "../../model/Character";
import Scene from "../../model/Scene";

type ImmerSet = (fn: (state: WritableDraft<EditorState>) => void) => void;
type ImmerGet = () => EditorState;

function withCurrentScene(
    get: ImmerGet, 
    set: ImmerSet,
    // what if i change the project type from any to Project? 
    // what will happen now that i have changed the scene type to Scene from any?
    // will it cause any issues with the existing code that uses this function? 
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

export const createCharacterSlice: StateCreator<EditorState, [["zustand/immer", never]], [], CharacterActions> = (set, get) => ({

    addCharacter: (character: Character) => {
        return withCurrentScene(get, set, (scene) => scene.addCharacter(character));
    },

    deleteCharacter: (characterId: number) => {
        const success = withCurrentScene(get, set, (scene) => scene.deleteCharacter(characterId));

        if (success) {
            set((state) => {
                if (state.selectedCharacterId === characterId) 
                    state.selectedCharacterId = null;
            });
        }
        return success;
    },

    duplicateCharacter: (characterId: number) => {
        const { project } = get();
        if (!project) return false;

        const sceneId = get().currentSceneId;
        if (sceneId === null) return false;

        const scene = project.getSceneById(sceneId);
        if (!scene) return false;

        const character = scene.getCharacterById(characterId);
        if (!character) return false;

        const newChar = character.clone();
        newChar.setId(scene.nextCharacterId());
        newChar.setName(character.getName() + ' _Copy');

        return get().addCharacter(newChar);
    },

    updateCharacter: (characterId: number, character: Character) => {
        return withCurrentScene(get, set, (scene) => scene.setCharacterById(characterId, character));
    },

    // placing and removing characters will not push to history immediately since we don't want to flood the history with paint strokes, 
    // we will push to history after the user finishes painting (eg on mouse up)
    placeCharacter: (row: number, col: number, characterid: number) => {
        return withCurrentScene(get, set, (scene) => scene.setCharacterAt(row, col, characterid), false);
    },

    removeCharacterAt: (row: number, col: number) => {
        return withCurrentScene(get, set, (scene) => scene.removeCharacterAt(row, col), false);
    }


});
