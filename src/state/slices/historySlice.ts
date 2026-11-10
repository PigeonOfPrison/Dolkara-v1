import type { StateCreator } from "zustand";
import type { EditorState, HistoryActions } from "../types";
import Project from "../../model/Project";


export const createHistorySlice: StateCreator<EditorState, [["zustand/immer", never]], [], HistoryActions> = (set, get) => ({

    pushHistory: () => {
        const { project, historyIndex, maxHistory } = get();
        if (!project) return;

        const snapshot = JSON.stringify(project.toJSON());

        set((state) => {

            // discard any redo history if we push a new state after undoing
            state.history = state.history.slice(0, state.historyIndex + 1);

            // push the new snapshot
            state.history.push(snapshot);

            // trim if we exceed max size
            if (state.history.length > maxHistory) 
                state.history.shift();
            else 
                state.historyIndex++;
        });
    },

    undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex <= 0) return;

        const prevSnapshot = history[historyIndex - 1];
        const project = Project.fromJSON(JSON.parse(prevSnapshot));

        set((state) => {
            state.project = project;
            state.historyIndex--;
            state.hasUnsavedChanges = true;
        });
    },

    redo: () => {
        const { history, historyIndex } = get();
        // if we're at the end of the history, we can't redo
        if (historyIndex >= history.length - 1) return;

        const nextSnapshot = history[historyIndex + 1];
        const project = Project.fromJSON(JSON.parse(nextSnapshot));

        set((state) => {
            state.project = project;
            state.historyIndex++;
            state.hasUnsavedChanges = true;
        });
    },

    canUndo: () => get().historyIndex > 0,
    canRedo: () => get().historyIndex < get().history.length - 1,
});