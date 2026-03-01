
export const createUISlice = (set, get) => ({

    // ========================================
    // UI STATE
    // ========================================
    showGrid: true,
    zoom: 1,
    inspectorTab: "scene", // scene, tile, entity, collectible
    canvasTab: "tilemap",   // tilemap or entitymap 
    currentTool: "brush", // brush, eraser, eyedropper, patrol
    currentMode: "tilemap", // tilemap, entity, collectible, pixel-editor
    selectedLayer: 0, // Current terrain layer being edited (0 to MAX_LAYERS - 3)
    
    // Patrol Path Recording
    isRecordingPatrolPath: false,
    patrolPathWaypoints: [],
    patrolPathStartPosition: null,
    patrolPathEntityId: null,
    
    // Character Area Tab
    characterAreaTab: 'characters', // 'characters' or 'animation'
    
    // Animation Editor State
    selectedAnimationId: null, // Current animation being edited (e.g., 'idle', 'running')
    editingFrameIndex: null, // Which frame slot is being edited (-1 for new frame)
    
    // ========================================
    // ACTIONS - UI
    // ========================================
    toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
    setZoom: (zoom) => set({ zoom }),
    setInspectorTab: (tab) => {
        console.log('[UISlice] Setting inspectorTab to:', tab);
        set({ inspectorTab: tab });
    },
    setCanvasTab: (tab) => {
        console.log('[UISlice] setCanvasTab called with:', tab);
        
        // Don't clear selections when going to createTile/createEntity/createCollectible
        // because we need to keep the selected item to edit it
        const shouldClearSelection = !['createTile', 'createEntity', 'createCollectible'].includes(tab);
        
        set({ 
            canvasTab: tab,
            // Only clear selection when switching to views that don't need it
            ...(shouldClearSelection && {
                selectedTileId: null,
                selectedEntityId: null,
                selectedCollectibleId: null,
                selectedSpawnPointId: null,
                selectedExitId: null
            })
        });
        console.log('[UISlice] canvasTab set to:', tab);
    },

    setCurrentTool: (tool) => set({ currentTool: tool }),
    setCurrentMode: (mode) => set({ currentMode: mode }),
    setSelectedLayer: (layer) => {
        console.log('[UISlice] Setting selected layer to:', layer);
        set({ selectedLayer: layer });
    },
    
    // Patrol Path Recording Actions
    startPatrolPathRecording: (entityId, startPosition) => {
        console.log('[UISlice] Starting patrol path recording for entity:', entityId, 'at', startPosition);
        set({
            isRecordingPatrolPath: true,
            patrolPathWaypoints: [startPosition],
            patrolPathStartPosition: startPosition,
            patrolPathEntityId: entityId,
            canvasTab: 'entities'
        });
    },
    
    addPatrolPathWaypoint: (position) => {
        const state = get();
        if (!state.isRecordingPatrolPath) return;
        
        const waypoints = [...state.patrolPathWaypoints, position];
        console.log('[UISlice] Added waypoint:', position, 'Total:', waypoints.length);
        set({ patrolPathWaypoints: waypoints });
    },
    
    savePatrolPath: () => {
        const state = get();
        if (!state.isRecordingPatrolPath || !state.patrolPathEntityId) return;
        
        const entity = state.scenes
            .find(s => s.id === state.currentSceneId)
            ?.entities.find(e => e.id === state.patrolPathEntityId);
        
        if (entity && state.patrolPathWaypoints.length > 1) {
            console.log('[UISlice] Saving patrol path with', state.patrolPathWaypoints.length, 'waypoints');
            entity.createDeltaPath(state.patrolPathStartPosition, state.patrolPathWaypoints);
            state.updateEntity(state.patrolPathEntityId, { patrolPath: entity.patrolPath });
        }
        
        set({
            isRecordingPatrolPath: false,
            patrolPathWaypoints: [],
            patrolPathStartPosition: null,
            patrolPathEntityId: null
        });
    },
    
    discardPatrolPath: () => {
        console.log('[UISlice] Discarding patrol path');
        set({
            isRecordingPatrolPath: false,
            patrolPathWaypoints: [],
            patrolPathStartPosition: null,
            patrolPathEntityId: null
        });
    },
    
    // Character Area Tab Actions
    setCharacterAreaTab: (tab) => {
        console.log('[UISlice] Setting character area tab to:', tab);
        set({ characterAreaTab: tab });
    },
    
    // Animation Editor Actions
    setSelectedAnimation: (animationId) => {
        console.log('[UISlice] Setting selected animation to:', animationId);
        set({ selectedAnimationId: animationId, editingFrameIndex: null });
    },
    
    startEditingFrame: (frameIndex) => {
        console.log('[UISlice] Starting to edit frame:', frameIndex);
        set({ editingFrameIndex: frameIndex, canvasTab: 'createEntity' });
    },
    
    clearFrameEditing: () => {
        console.log('[UISlice] Clearing frame editing');
        set({ editingFrameIndex: null });
    },
});