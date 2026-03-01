import React, { useState } from 'react';
import Button from '../../components/Button';
import Dropdown from '../../components/Dropdown';
import ColourPicker from '../../components/ColourPicker';
import { FiSave, FiTrash2, FiCopy } from 'react-icons/fi';
import useEditorStore from '../../state/editorStore';

/**
 * Example Inspector - Demonstrates all components in action
 * This is a sample to visualize the design system
 */
export default function ExampleInspector() {
  const [name, setName] = useState('Example Entity');
  const [tag, setTag] = useState('enemy');
  const [health, setHealth] = useState(100);
  const [damage, setDamage] = useState(10);
  const [animation, setAnimation] = useState('idle');
  const [isSolid, setIsSolid] = useState(true);
  
  // Get color picker state from store
  const selectedColorIndex = useEditorStore(state => state.selectedColorIndex);
  const setSelectedColorIndex = useEditorStore(state => state.setSelectedColorIndex);
  const getCurrentPalette = useEditorStore(state => state.getCurrentPalette);
  const setPaletteColor = useEditorStore(state => state.setPaletteColor);
  const setCanvasTab = useEditorStore(state => state.setCanvasTab);
  
  // Get palette from current scene
  const palette = getCurrentPalette()?.colours || [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00',
    '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#808080', '#C0C0C0', '#800000', '#008000',
    '#000080', '#808000', '#800080', '#008080'
  ];
  
  // Separate local state for tile color demo (since we're showing two pickers)
  const [tileColorIndex, setTileColorIndex] = useState(0);

  const tagOptions = ['player', 'enemy', 'neutral', 'boss'];
  
  const animationOptions = [
    { value: 'idle', label: 'Idle Animation' },
    { value: 'walk', label: 'Walking' },
    { value: 'run', label: 'Running' },
    { value: 'attack', label: 'Attack' },
    { value: 'death', label: 'Death' }
  ];

  const inputRowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px'
  };

  const labelStyle = {
    fontSize: '11px',
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    minWidth: '80px',
    flexShrink: 0
  };

  const sectionHeaderStyle = {
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    marginBottom: '6px',
    paddingBottom: '4px',
    borderBottom: '1px solid var(--color-border-subtle)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const sectionStyle = {
    paddingBottom: '12px',
    marginBottom: '12px',
    borderBottom: '1px solid var(--color-border-subtle)'
  };

  return (
    <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      
      {/* Section 1: Basic Properties */}
      <section style={sectionStyle}>
        <h2 style={sectionHeaderStyle}>Properties</h2>
        
        {/* Name Input */}
        <div style={inputRowStyle}>
          <label style={labelStyle}>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>

        {/* Tag Dropdown - inline without label since Dropdown has its own */}
        <div style={inputRowStyle}>
          <label style={labelStyle}>Tag</label>
          <div style={{ flex: 1 }}>
            <Dropdown
              options={tagOptions}
              value={tag}
              onChange={setTag}
              size="small"
            />
          </div>
        </div>

        {/* Solid Checkbox */}
        <div style={{ ...inputRowStyle, paddingLeft: '88px' }}>
          <input
            type="checkbox"
            id="solid-check"
            checked={isSolid}
            onChange={(e) => setIsSolid(e.target.checked)}
          />
          <label 
            htmlFor="solid-check"
            style={{ fontSize: '11px', color: 'var(--color-text-primary)', cursor: 'pointer' }}
          >
            Solid / Collidable
          </label>
        </div>
      </section>

      {/* Section 2: Stats */}
      <section style={sectionStyle}>
        <h2 style={sectionHeaderStyle}>Stats</h2>
        
        {/* Health */}
        <div style={inputRowStyle}>
          <label style={labelStyle}>Health</label>
          <input
            type="number"
            min="0"
            max="255"
            value={health}
            onChange={(e) => setHealth(Number(e.target.value))}
            style={{ flex: 1 }}
          />
        </div>

        {/* Damage */}
        <div style={inputRowStyle}>
          <label style={labelStyle}>Damage</label>
          <input
            type="number"
            min="0"
            max="255"
            value={damage}
            onChange={(e) => setDamage(Number(e.target.value))}
            style={{ flex: 1 }}
          />
        </div>
      </section>

      {/* Section 3: Animation */}
      <section style={sectionStyle}>
        <h2 style={sectionHeaderStyle}>Animation</h2>
        
        <div style={inputRowStyle}>
          <label style={labelStyle}>Default</label>
          <div style={{ flex: 1 }}>
            <Dropdown
              options={animationOptions}
              value={animation}
              onChange={setAnimation}
              placeholder="Select..."
              size="small"
            />
          </div>
        </div>
      </section>

      {/* Section 4: Palette (Scene Mode - Full Editor) */}
      <section style={sectionStyle}>
        <h2 style={sectionHeaderStyle}>Scene Palette</h2>
        <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Mode: Scene (can edit colors)</p>
        
        <ColourPicker
          mode="scene"
          palette={palette}
          selectedIndex={selectedColorIndex}
          onColorSelect={(index) => {
            console.log('[Example Inspector] Color selected:', index);
            setSelectedColorIndex(index);
          }}
          onColorChange={(index, color) => {
            console.log('[Example Inspector] Color changed:', index, color);
            setPaletteColor(index, color);
          }}
        />
      </section>

      {/* Section 5: Color Selection (Select Mode - Picker Only) */}
      <section style={sectionStyle}>
        <h2 style={sectionHeaderStyle}>Tile Color</h2>
        <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Mode: Select (read-only palette)</p>
        
        <ColourPicker
          mode="select"
          palette={palette}
          selectedIndex={tileColorIndex}
          onColorSelect={(index) => {
            setTileColorIndex(index);
            setSelectedColorIndex(index); // Also update store for DrawTab
            console.log('Select mode: Selected color index', index);
          }}
        />
      </section>

      {/* Section 5: Actions */}
      <section style={sectionStyle}>
        <h2 style={sectionHeaderStyle}>Actions</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {/* Create Tile Button */}
          <Button 
            variant="primary" 
            size="small"
            onClick={() => {
              console.log('[Example Inspector] Opening Create Tile tab');
              setCanvasTab('createTile');
            }}
            style={{ width: '100%' }}
          >
            Create New Tile
          </Button>

          {/* Action Buttons in compact rows */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <Button 
              variant="primary" 
              size="small"
              icon={<FiSave />}
              onClick={() => console.log('Saved!', { name, tag, health, damage, animation, isSolid })}
              style={{ flex: 1 }}
            >
              Save
            </Button>
            
            <Button 
              variant="secondary" 
              size="small"
              icon={<FiCopy />}
              onClick={() => console.log('Duplicated!')}
              style={{ flex: 1 }}
            >
              Duplicate
            </Button>
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            <Button 
              variant="danger" 
              size="small"
              icon={<FiTrash2 />}
              onClick={() => console.log('Deleted!')}
              style={{ flex: 1 }}
            >
              Delete
            </Button>
            
            <Button 
              variant="secondary" 
              size="small"
              disabled
              style={{ flex: 1 }}
            >
              Disabled
            </Button>
          </div>

          {/* Icon-only buttons */}
          <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
            <Button 
              variant="icon" 
              size="small"
              icon={<FiSave />}
              title="Quick Save"
              onClick={() => console.log('Quick saved!')}
            />
            <Button 
              variant="icon" 
              size="small"
              icon={<FiCopy />}
              title="Copy"
              onClick={() => console.log('Copied!')}
            />
            <Button 
              variant="icon" 
              size="small"
              icon={<FiTrash2 />}
              title="Delete"
              onClick={() => console.log('Delete icon clicked!')}
            />
          </div>
        </div>
      </section>

    </div>
  );
}
