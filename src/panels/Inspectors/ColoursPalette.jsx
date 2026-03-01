import React from 'react';
import useEditorStore from '../../state/editorStore';
import ColourPicker from '../../components/ColourPicker';
import Button from '../../components/Button';
import { MAX_PALETTE_COLOURS } from '../../constants/hardwareLimits';
import '../../css/ColoursPalette.css';

/**
 * ColoursPalette - Dedicated palette editor with 30 colors (5×6 grid)
 */
export default function ColoursPalette() {
  const currentSceneId = useEditorStore(state => state.currentSceneId);
  const scenes = useEditorStore(state => state.scenes);
  const setPaletteColor = useEditorStore(state => state.setPaletteColor);
  const resetPalette = useEditorStore(state => state.resetPalette);
  const selectedColourId = useEditorStore(state => state.selectedColourId);
  const setSelectedColourId = useEditorStore(state => state.setSelectedColourId);

  const currentScene = scenes.find(s => s.id === currentSceneId);
  const palette = currentScene?.palette?.colours || [];

  if (!currentScene) {
    return (
      <div style={{ padding: '16px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
        <p>No scene selected.</p>
      </div>
    );
  }

  const handleColorChange = (index, color) => {
    try {
      console.log('[ColoursPalette] Color changed:', index, color);
      setPaletteColor(index, color);
    } catch (error) {
      console.error('Failed to update palette color:', error);
    }
  };

  const handleResetPalette = () => {
    try {
      console.log('[ColoursPalette] Resetting palette');
      resetPalette();
    } catch (error) {
      console.error('Failed to reset palette:', error);
    }
  };

  return (
    <div className="colours-palette">
      <section>
        <h2 className="scene-inspector-section-title">Scene Palette</h2>
        <p className="palette-info-text">
          {palette.length}/{MAX_PALETTE_COLOURS} colors (Index 0 is reserved for transparency)
        </p>
        
        <ColourPicker
          mode="scene"
          palette={palette}
          selectedIndex={selectedColourId}
          onColorSelect={(index) => {
            console.log('[ColoursPalette] Color selected:', index);
            setSelectedColourId(index);
          }}
          onColorChange={handleColorChange}
        />

        <Button
          variant="secondary"
          size="small"
          onClick={handleResetPalette}
          className="inspector-add-button"
          style={{ marginTop: '12px' }}
        >
          Reset to Default
        </Button>
      </section>
    </div>
  );
}
