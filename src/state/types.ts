import Project from '../model/Project';
import Tile from '../model/Tile';
import Character from '../model/Character';
import Collectible from '../model/Collectible';
import type SpawnPoint from '../model/SpawnPoint';
import type Exit from '../model/Exit';


// -----------------------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------------------

export type EntityType = 'tile' | 'character' | 'collectible';
export type CanvasTab = 'tilemap' | 'tile-editor' | 'character-editor' | 'collectible-editor' | 'characters-isolated' | 'tiles-isolated' | 'collectibles-isolated';
export type InspectorTab = 'scene' | 'tile' | 'character' | 'collectible';
export type CharacterTab = 'character-set' | 'animation-editor';
export type TileTab = 'tile-set' | 'collectible-set';
export type Tool = 'select' | 'erase';

export interface EditorState extends 
    ProjectState,
    UIState,
    SelectionState,
    ClipboardState,
    HistoryState,
    ProjectActions,
    SceneActions,
    TileActions,
    CharacterActions,
    CollectibleActions,
    SpawnExitActions,
    PaletteActions,
    UIActions,
    SelectionActions,
    ClipboardActions,
    HistoryActions {}

export interface ProjectState {
    project: Project | null;
    currentFilePath: string | null;
    hasUnsavedChanges: boolean;
}

export interface UIState {
    currentSceneId: number;
    canvasTab: CanvasTab;
    inspectorTab: InspectorTab;
    characterTab: CharacterTab;
    tileTab: TileTab;
    activeTool: Tool;
    selectedColourIndex: number;
    currentLayer: number;
    showGrid: boolean;
    zoom: number
}

export interface SelectionState {
    //selectedSceneId: string | null;
    selectedTileId: number | null;
    selectedCharacterId: number | null;
    selectedCharacterTemplateId: number | null;
    selectedCollectibleId: number | null;
    selectedSpawnPointId: number | null;
    selectedExitId: number | null;
    selectedPaletteId: number | null;
}

// to be able to copy/paste tiles, characters, collectibles
// could we have use the generic entity type here instead of seperate ones? maybe, but this is more explicit and easier to work with for now
// TODO: look for ways to use entity and to also allow copy pasting scenes
export interface ClipboardState {
    clipboard: {
        type: EntityType | null;
        data: Tile | Character | Collectible | null;
    };
}

export interface HistoryState {
    history: string[]; // Array of serialized project states
    historyIndex: number; // Current position in the history
    maxHistory: number; // Maximum number of history states to keep
}

// -----------------------------------------------------------------------------------------
// ACTION INTERFACES
// -----------------------------------------------------------------------------------------

export interface ProjectActions {
    createNewProject: (name?: string, author?: string) => void; // what if we return boolean here to indicate if project was created or not (eg if user cancels out of creating new project with unsaved changes)
    loadProject: (projectData: any) => void;
    setCurrentFilePath: (path: string | null) => void;
    saveProject: () => Promise<string | null>; // returns saved file path or null if cancelled
    saveProjectAs: () => Promise<string | null>; // always opens save dialog, returns saved file path or null if cancelled
    exportScene: (sceneId: number) => Promise<string | null>; // exports single scene as JSON, returns saved file path or null if cancelled
    markUnsaved: () => void;
    markSaved: () => void;
}

export interface SceneActions {
    addScene: () => boolean;
    deleteScene: (sceneId: number) => boolean;
    duplicateScene: (sceneId: number) => boolean;
    setCurrentScene: (sceneId: number) => boolean;
    renameScene: (sceneId: number, newName: string) => boolean;
    setSceneTag: (sceneId: number, newTag: string) => boolean;
    resizeScene: (sceneId: number, newWidth: number, newHeight: number) => boolean;
}

export interface TileActions {
    addTile: (tile: Tile) => boolean;
    deleteTile: (tileId: number) => boolean;
    duplicateTile: (tileId: number) => boolean;
    updateTile: (tileId: number, tile: Tile) => boolean;
    paintTile: (layer: number, row: number, col: number, tileId: number) => boolean;
    fillTiles: (layer: number, row: number, col: number, tileId: number) => boolean;
    eraseTile: (layer: number, row: number, col: number) => boolean;
}

export interface CharacterActions {
    addCharacter: (character: Character) => boolean;
    deleteCharacter: (characterId: number) => boolean;
    duplicateCharacter: (characterId: number) => boolean;
    updateCharacter: (characterId: number, character: Character) => boolean;
    placeCharacter: (row: number, col: number, characterId: number) => boolean;
    removeCharacterAt: (row: number, col: number) => boolean;
}

export interface CollectibleActions {
    addCollectible: (collectible: Collectible) => boolean;
    deleteCollectible: (collectibleId: number) => boolean;
    duplicateCollectible: (collectibleId: number) => boolean;
    updateCollectible: (collectibleId: number, collectible: Collectible) => boolean;
    placeCollectible: (row: number, col: number, collectibleId: number) => boolean;
    removeCollectibleAt: (row: number, col: number) => boolean;
}

export interface SpawnExitActions {
    // can we use the object SpawnPoint and Exit here instead of the individual properties?
    addSpawnPoint: (spawnPoint: SpawnPoint) => boolean;
    deleteSpawnPoint: (spawnPointId: number) => boolean;
    updateSpawnPoint: (spawnPointId: number, spawnPoint: SpawnPoint) => boolean;
    addExit: (exit: Exit) => boolean;
    deleteExit: (exitId: number) => boolean;
    updateExit: (exitId: number, exit: Exit) => boolean;
}

export interface PaletteActions {
    setColourAt: (index: number, colour: string) => boolean;
    addColour: (colour: string) => boolean;
    deleteColour: (index: number) => boolean;
}

export interface UIActions {
    setCurrentScene: (sceneId: number) => boolean;
    setCanvasTab: (tab: CanvasTab) => void;
    setInspectorTab: (tab: InspectorTab) => void;
    setCharacterTab: (tab: CharacterTab) => void;
    setTileTab: (tab: TileTab) => void;
    setCurrentTool: (tool: Tool) => void;
    setSelectedColour: (index: number) => void;
    setCurrentLayer: (layer: number) => void;
    toggleGrid: () => void;
    setZoom: (zoom: number) => void;
}

export interface SelectionActions {
    selectTile: (tileId: number | null) => void;
    selectCharacter: (characterId: number | null) => void;
    selectCharacterTemplate: (templateId: number | null) => void;
    selectCollectible: (collectibleId: number | null) => void;
    selectSpawnPoint: (spawnPointId: number | null) => void;
    selectExit: (exitId: number | null) => void;
    clearSelection: () => void;
}

export interface ClipboardActions {
    copyToClipboard: (type: EntityType, data: Tile | Character | Collectible) => void;
    pasteFromClipboard: () => Tile | Character | Collectible | null;
    clearClipboard: () => void;
}

export interface HistoryActions {
    pushHistory: () => void;
    undo: () => void;
    redo: () => void;
    canUndo: () => boolean;
    canRedo: () => boolean;
}

export interface Tab {
    id: string;
    label: string;
    active: boolean;
}

export type ProjectSlice = ProjectState & ProjectActions;
export type SceneSlice = SceneActions;
export type TileSlice = TileActions;
export type CharacterSlice = CharacterActions;
export type CollectibleSlice = CollectibleActions;
export type SpawnExitSlice = SpawnExitActions;
export type PaletteSlice = PaletteActions;
export type UISlice = UIActions & SelectionActions & ClipboardActions;
export type SelectionSlice = SelectionState & SelectionActions;
export type ClipboardSlice = ClipboardState & ClipboardActions;
export type HistorySlice = HistoryState & HistoryActions;




