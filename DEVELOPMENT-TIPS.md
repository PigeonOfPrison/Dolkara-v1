# Development Tips & Best Practices

## 🚀 Getting Started Guide

### Phase 1: Foundation ✅ (COMPLETED)
You've completed all model classes and state management. Here's what you have:

**Data Models:**
- ✅ Palette (16 colors, fromJSON/toJSON)
- ✅ Tile (8×8 pixels, no health/collectValue - simplified)
- ✅ Entity (16×16 animations, patrol paths)
- ✅ Collectible (8×8 pixels, inventory system)
- ✅ Scene (complete CRUD for all assets)

**State Management:**
- ✅ editorStore.js (Zustand with project management)
- ✅ All CRUD actions for tiles/entities/collectibles
- ✅ Selection state & UI state

---

## 📋 What to Build Next (Phase 2)

### Step 1: Create Basic Components (1-2 days)
Build these in order - each takes ~1-2 hours:

#### 1.1 Button Component (`src/components/Button.jsx`)
```jsx
function Button({ children, onClick, variant = "primary", disabled }) {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
```

**Test it:**
```jsx
// In App.jsx temporarily
<Button onClick={() => console.log("Clicked!")}>Test Button</Button>
```

---

#### 1.2 NumberInput Component (`src/components/NumberInput.jsx`)
```jsx
import { useState } from 'react';

function NumberInput({ value, onChange, min = 0, max = 255, label }) {
  const handleChange = (e) => {
    const num = parseInt(e.target.value);
    if (!isNaN(num) && num >= min && num <= max) {
      onChange(num);
    }
  };

  return (
    <div className="number-input">
      <label>{label}</label>
      <input 
        type="number" 
        value={value} 
        onChange={handleChange}
        min={min}
        max={max}
      />
    </div>
  );
}
```

---

#### 1.3 Dropdown Component (`src/components/Dropdown.jsx`)
```jsx
function Dropdown({ options, value, onChange, placeholder }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
```

---

### Step 2: Build Layout Shell (1 day)

#### 2.1 EditorLayout (`src/Layout/EditorLayout.jsx`)
```jsx
import './EditorLayout.css';

function EditorLayout() {
  return (
    <div className="editor-layout">
      <div className="tile-area">Tile Area</div>
      <div className="scenes-menu">Scenes Menu</div>
      <div className="canvas-area">Canvas Area</div>
      <div className="character-area">Character Area</div>
      <div className="inspector-area">Inspector Area</div>
    </div>
  );
}
```

**CSS (`src/Layout/EditorLayout.css`):**
```css
.editor-layout {
  display: grid;
  grid-template-columns: 200px 1fr 1fr 1fr 300px;
  grid-template-rows: repeat(5, 1fr);
  height: 100vh;
  gap: 4px;
  background: #1e1e1e;
}

.tile-area { 
  grid-column: 1; 
  grid-row: 1 / 4; 
  background: #2d2d2d;
  border: 1px solid #444;
}

.scenes-menu { 
  grid-column: 1; 
  grid-row: 4 / 6; 
  background: #2d2d2d;
  border: 1px solid #444;
}

.canvas-area { 
  grid-column: 2 / 5; 
  grid-row: 1 / 5; 
  background: #1a1a1a;
  border: 1px solid #444;
}

.character-area { 
  grid-column: 2 / 5; 
  grid-row: 5; 
  background: #2d2d2d;
  border: 1px solid #444;
}

.inspector-area { 
  grid-column: 5; 
  grid-row: 1 / 6; 
  background: #2d2d2d;
  border: 1px solid #444;
  overflow-y: auto;
}
```

**Test it in App.jsx:**
```jsx
import EditorLayout from './Layout/EditorLayout';

function App() {
  return <EditorLayout />;
}
```

---

### Step 3: Build First Panel - Scenes Menu (2 hours)

#### 3.1 ScenesMenu (`src/panels/ScenesMenu.jsx`)
```jsx
import useEditorStore from '../state/editorStore';
import Scene from '../model/Scene';
import { generateId } from '../utils/id';

function ScenesMenu() {
  const { scenes, currentSceneId, createScene, setCurrentScene, deleteScene } = 
    useEditorStore(state => ({
      scenes: state.scenes,
      currentSceneId: state.currentSceneId,
      createScene: state.createScene,
      setCurrentScene: state.setCurrentScene,
      deleteScene: state.deleteScene
    }));

  const handleCreateScene = () => {
    const id = generateId("scene");
    const newScene = new Scene(id, "Scene_", 16, 12);
    createScene(newScene);
  };

  return (
    <div className="scenes-menu">
      <h3>Scenes</h3>
      <button onClick={handleCreateScene}>+ New Scene</button>
      
      <div className="scene-list">
        {scenes.map(scene => (
          <div 
            key={scene.id}
            className={scene.id === currentSceneId ? 'active' : ''}
            onClick={() => setCurrentScene(scene.id)}
          >
            {scene.name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🎯 Development Workflow

### Daily Routine:
1. **Pick ONE component** from BuildOrder.md
2. **Create the file** with basic structure
3. **Add console.logs** to verify it renders
4. **Test with mock data** before connecting to store
5. **Hook up Zustand** once UI works
6. **Style it** last (functionality first!)

### Example Day:
```
9:00 AM  - Create Button.jsx (30 min)
9:30 AM  - Test Button in App.jsx (15 min)
9:45 AM  - Create NumberInput.jsx (45 min)
10:30 AM - BREAK
10:45 AM - Create Dropdown.jsx (30 min)
11:15 AM - Create EditorLayout.jsx + CSS (1 hour)
12:15 PM - LUNCH
1:00 PM  - Test layout, adjust spacing (30 min)
1:30 PM  - Start ScenesMenu.jsx (1 hour)
2:30 PM  - Debug & style (30 min)
3:00 PM  - DONE for the day! ✅
```

---

## 🐛 Common Pitfalls & Solutions

### Problem 1: "Component doesn't re-render"
**Solution:** Make sure you're destructuring Zustand state:
```javascript
// ❌ WRONG - won't re-render
const state = useEditorStore();
const scenes = state.scenes;

// ✅ CORRECT - re-renders when scenes change
const scenes = useEditorStore(state => state.scenes);
```

---

### Problem 2: "Can't find module 'Scene'"
**Solution:** Check your import path:
```javascript
// If you're in src/panels/ScenesMenu.jsx
import Scene from '../model/Scene';  // ✅ Correct
import Scene from './model/Scene';   // ❌ Wrong (missing ../)
```

---

### Problem 3: "Grid/Canvas not rendering"
**Solution:** Make sure parent has dimensions:
```css
.canvas-area {
  width: 100%;
  height: 100%;  /* Must have height! */
}

canvas {
  width: 100%;
  height: 100%;
}
```

---

## 📚 Key Differences from Docs

### Tile Model (UPDATED)
**Removed from original spec:**
- ❌ `health` property (tiles are now indestructible or just use solid flag)
- ❌ `collectValue` property (moved to Collectible model)

**Current Tile properties:**
```javascript
{
  id: string,
  name: string,
  pixels: number[64],  // -1 for transparent, 0-15 for palette index
  solid: boolean,
  opacity: number,     // 0-255
  tag: string,         // "ground", "hazard", "decor"
  damage: number       // 0-255
}
```

---

### Collectible Model (NEW)
**Separate from tiles:**
```javascript
{
  id: string,
  name: string,
  tag: string,         // "coin", "key", "powerup"
  value: number,       // Currency value
  inventorySlot: number, // -1 for currency, 0-63 for items
  pixels: number[64]   // 8×8 sprite
}
```

**Why separate?** Tiles are for terrain, collectibles are for pickups.

---

### Scene Methods (UPDATED)
**addExit now uses options object:**
```javascript
// OLD (from docs)
scene.addExit("door", 10, 5, 2, 2, "scene2", "spawn1", 0);

// NEW (actual implementation)
scene.addExit({
  name: "door",
  x: 10,
  y: 5,
  width: 2,
  height: 2,
  targetScene: "scene2",
  targetSpawn: "spawn1",
  requirement: 0
});
```

---

## 🔧 Utility Files You'll Need

### `src/utils/id.js` (CREATE THIS)
```javascript
let counter = 0;

export function generateId(prefix = "id") {
  return `${prefix}_${Date.now()}_${counter++}`;
}
```

### `src/utils/math.js` (CREATE THIS)
```javascript
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
```

---

## 📖 BuildOrder.md Status

**What's accurate:**
- ✅ Phase structure (Foundation → Components → Layout → Panels)
- ✅ Order of components to build
- ✅ CSS Grid layout specs

**What needs updating:**
- ⚠️ Tile model properties (remove health/collectValue)
- ⚠️ Collectible details (needs full section)
- ⚠️ Scene.addExit signature (now uses options object)
- ⚠️ More implementation hints for each component

**Should you follow it?** **YES**, but refer to this file for accurate model properties.

---

## 🎨 Styling Tips

### Use CSS Variables for Consistency
```css
:root {
  --bg-dark: #1e1e1e;
  --bg-panel: #2d2d2d;
  --border: #444;
  --text: #e0e0e0;
  --primary: #007acc;
  --danger: #f44336;
}

button {
  background: var(--primary);
  color: var(--text);
  border: 1px solid var(--border);
}
```

### Start with Dark Theme
Easier on eyes during long dev sessions!

---

## 🚦 Next Steps Checklist

### Week 1: Components & Layout
- [ ] Create Button, NumberInput, Dropdown components
- [ ] Create EditorLayout with 5-column grid
- [ ] Create ScenesMenu panel
- [ ] Test: Can create/select scenes

### Week 2: Tile System
- [ ] Create TileSet panel (grid of tiles)
- [ ] Create TileInspector (edit tile properties)
- [ ] Create PixelEditor (8×8 grid)
- [ ] Test: Can create tile, edit pixels

### Week 3: Canvas
- [ ] Create Canvas panel with tabs
- [ ] Render terrain layer
- [ ] Handle click to place tiles
- [ ] Test: Can paint tiles on canvas

### Week 4: Entities & Export
- [ ] Create CharacterSet panel
- [ ] Create EntityInspector
- [ ] Add entity placement on canvas
- [ ] Create basic JSON export

---

## 💡 Pro Tips

1. **Use React DevTools** - Install the browser extension to inspect component tree
2. **Console.log everything** - Don't be shy, log all state changes
3. **Test in isolation** - Build components standalone before integrating
4. **Commit often** - After each working feature, commit to git
5. **Take breaks** - Step away when stuck, solutions come clearer

---

## 📞 When You Get Stuck

### Debug Checklist:
1. Check browser console for errors
2. Verify import paths are correct
3. Check that parent component has dimensions (for Canvas)
4. Confirm Zustand selector is using `state => state.X` syntax
5. Add `console.log()` before the error line

### Common Error Messages:
- **"Cannot read property 'X' of undefined"** → Check if state/prop exists before accessing
- **"Objects are not valid as React child"** → You're trying to render an object, use `.map()` or access properties
- **"Maximum update depth exceeded"** → You're calling setState in render (move to useEffect or event handler)

---

## 🎯 Goal Timeline (Realistic)

- **Week 1-2**: Components + Layout + Scenes Menu = Basic shell
- **Week 3-4**: Tile system working (create, edit, place)
- **Week 5-6**: Canvas painting & Entity system
- **Week 7-8**: Polish, Animation Editor, Export

**Total: ~2 months for MVP** (working editor that can export JSON)

---

## ✅ Definition of "Done" for Each Component

### Component is Done When:
1. ✅ Renders without errors
2. ✅ Responds to user input correctly
3. ✅ Updates Zustand state properly
4. ✅ Has basic styling (doesn't need to be perfect)
5. ✅ Works in the integrated layout

### Don't Obsess Over:
- ❌ Perfect styling (can refine later)
- ❌ Animations/transitions (phase 6)
- ❌ Edge cases (handle 80% case first)

---

Good luck! You've got a solid foundation. Just follow Phase 2 step-by-step and you'll have a working editor in no time. 🚀
