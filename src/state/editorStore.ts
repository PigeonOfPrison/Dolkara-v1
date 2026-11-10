import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createProjectSlice } from './slices/projectSlice';
import { createSceneSlice } from './slices/sceneSlice';
import { createTileSlice } from './slices/tileSlice';
import { createCharacterSlice } from './slices/characterSlice';
import { createCollectibleSlice } from './slices/collectibleSlice';
import { createSpawnExitSlice } from './slices/spawnExitSlice';
import { createPaletteSlice } from './slices/paletteSlice';
import { createUISlice } from './slices/uiSlice';
import { createHistorySlice } from './slices/historySlice';

import type { EditorState } from './types';

// TODO: update the slices to use clone() so as to force rerenders
export const useEditorStore = create<EditorState>()(
    immer((...args) => ({

        // ---------------------------------------------------------------------------------
        // DEFAULT STATE
        // ---------------------------------------------------------------------------------

        project: null,
        currentFilePath: null,
        hasUnsavedChanges: false,

        currentSceneId: 0,
        canvasTab: 'tilemap',
        inspectorTab: 'scene',
        characterTab: 'character-set',
        tileTab: 'tile-set',
        activeTool: 'select',
        selectedColourIndex: 0,
        currentLayer: 0,
        showGrid: true,
        zoom: 1,

        selectedTileId: null,
        selectedCharacterId: null,
        selectedCharacterTemplateId: null,
        selectedCollectibleId: null,
        selectedPaletteId: null,
        selectedSpawnPointId: null,
        selectedExitId: null,

        clipboard: { type: null, data: null },

        history: [],
        historyIndex: -1,
        maxHistory: 50,

        // ---------------------------------------------------------------------------------
        // SLICES
        // ---------------------------------------------------------------------------------

        ...createProjectSlice(...args),
        ...createSceneSlice(...args),
        ...createTileSlice(...args),
        ...createCharacterSlice(...args),
        ...createCollectibleSlice(...args),
        ...createSpawnExitSlice(...args),   
        ...createPaletteSlice(...args),
        ...createUISlice(...args),
        ...createHistorySlice(...args),
    }))
);