import { useEditorStore } from "../../../../state/editorStore";
import './ColourPicker.css';

interface ColourPickerProps {
    columns?: number;
    cellSize?: number;
    gap?: number;
}

export function ColourPicker({
    columns = 4,
    cellSize = 30,
    gap = 5
}: ColourPickerProps) {
    
    const project = useEditorStore(state => state.project);
    const currSceneId = useEditorStore(state => state.currentSceneId);
    const selectedColourIndex = useEditorStore(state => state.selectedColourIndex);
    const setSelectedColour = useEditorStore(state => state.setSelectedColour);
    const setColourAt = useEditorStore(state => state.setColourAt);
    const addColour = useEditorStore(state => state.addColour);
    const deleteColour = useEditorStore(state => state.deleteColour);
    const inspectorTab = useEditorStore(state => state.inspectorTab);
    const canvasTab = useEditorStore(state => state.canvasTab);

    // logic to determine if the picker should be enabled or not
    const isEditorTab = canvasTab === 'tile-editor' || canvasTab === 'character-editor' || canvasTab === 'collectible-editor';
    const isSceneInspector = inspectorTab === 'scene';

    const isEnabled = project !== null && (isEditorTab || isSceneInspector);
    const canEditColours = isSceneInspector;

    const currScene = project?.getSceneById(currSceneId);
    const palette = currScene?.getPalette().getColours() || [];

    const handleColourSelect = (index: number) => {
        if (!isEnabled) return;
        setSelectedColour(index);
    }

    const handleColourEdit = (index: number, newColour: string) => {
        if (!canEditColours) return;
        setColourAt(index, newColour);
    }

    const handleAddColour = () => {
        if (!canEditColours) return;
        addColour('#ffffff'); // default new colour is white
    }; 

    const handleDeleteColour = (index: number) => {
        if (!canEditColours) return;
        deleteColour(index);
    };

    // there should be a better way to do this without directly manipulating the dom, but this will work for now. 
    // perhaps we can add an input below the colour picker, or above it?
    const handleDoubleClick = (index: number) => {
        if (!canEditColours) return;
        const input = document.getElementById(`colour-input-${index}`) as HTMLInputElement;
        input?.click();
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, ${cellSize}px)`,
        gap: `${gap}px`
    };

    return (
        <div className={`colour-picker ${!isEnabled ? 'colour-picker--disabled' : ''}`}>
            <div className="colour-picker__header">
                <span className="colour-picker__title">Palette</span>
                {canEditColours && (
                    <button 
                        className="colour-picker__add-btn"
                        onClick={handleAddColour}
                        title="Add colour"
                    >
                        +
                    </button>
                )}
            </div>
            
            <div className="colour-picker__grid" style={gridStyle}>
                {palette.map((colour, index) => (
                    <div
                        key={index}
                        className={`colour-picker__cell ${
                            selectedColourIndex === index ? 'colour-picker__cell--selected' : ''
                        }`}
                        style={{ 
                            width: cellSize, 
                            height: cellSize,
                            backgroundColor: colour 
                        }}
                        onClick={() => handleColourSelect(index)}
                        onDoubleClick={() => handleDoubleClick(index)}
                        title={`${colour} (Index: ${index})`}
                    >
                        {canEditColours && (
                            <>
                                <input
                                    id={`colour-input-${index}`}
                                    type="color"
                                    value={colour}
                                    onChange={(e) => handleColourEdit(index, e.target.value)}
                                    className="colour-picker__input"
                                />
                                <button
                                    className="colour-picker__delete-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteColour(index);
                                    }}
                                    title="Delete colour"
                                >
                                    ×
                                </button>
                            </>
                        )}
                        <span className="colour-picker__index">{index}</span>
                    </div>
                ))}
            </div>

            {palette.length === 0 && (
                <div className="colour-picker__empty">
                    No colours in palette
                </div>
            )}

            <div className="colour-picker__footer">
                <span className="colour-picker__info">
                    Selected: {selectedColourIndex ? palette[selectedColourIndex] : 'None'}
                </span>
            </div>
        </div>
    );
}
