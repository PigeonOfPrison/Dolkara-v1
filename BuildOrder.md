# Dolkaraa Editor - Build Order

This document outlines the complete build order for the Dolkaraa game editor, organized by phases to ensure a logical, incremental development process.

---

## Phase 1: Foundation (Data Layer)

Build the core data structures first. Everything else depends on these.

### 1.1 Hardware Limits Constants

**File**: `src/constants/hardwareLimits.js`

**Purpose**: Define all ESP32 hardware constraints in one place for consistent validation across the app.

**Contents**:
```javascript
// Tilemap constraints
export const TILE_SIZE = 8; // 8x8 pixels
export const CHARACTER_SIZE = 16; // 16x16 pixels
export const MAX_TILEMAP_WIDTH = 64;
export const MAX_TILEMAP_HEIGHT = 64;

// Scene constraints
export const MAX_TILES_PER_SCENE = 256;
export const MAX_ENTITIES_PER_SCENE = 32;
export const MAX_COLLECTIBLES = 64;
export const MAX_PALETTE_COLORS = 16;

// Navigation constraints
export const MAX_EXITS = 8;
export const MAX_SPAWN_POINTS = 8;
export const MAX_PATROL_WAYPOINTS = 32;

// Animation constraints
export const MAX_ANIMATION_FRAMES = 256;
export const MAX_FPS = 30;

// Game state
export const MAX_CURRENCY = 4294967295; // 32-bit unsigned max
export const INVENTORY_SLOTS = 64; // 8 bytes = 64 bits

// Rendering
export const LOGICAL_TO_PHYSICAL_TILE = 20; // 8x8 logical -> 160x160 physical
export const LOGICAL_TO_PHYSICAL_CHAR = 10; // 16x16 logical -> 160x160 physical
```

**Why First**: Every component will import these for validation. Prevents magic numbers scattered throughout code.

---

### 1.2 Palette Model

**File**: `src/model/Palette.js`

**Purpose**: Manage the 16-color palette for each scene. Handle sRGB to RGB565 conversion.

**Key Features**:
- Store 16 colors (hex strings for editor, RGB565 for export)
- Validate color count (exactly 16)
- Conversion methods: `hexToRgb565()`, `rgb565ToHex()`
- Default palette (grayscale or common colors)

**Data Structure**:
```javascript
class Palette {
  constructor() {
    this.colors = [
      { index: 0, hex: "#000000" },  // Black
      { index: 1, hex: "#FFFFFF" },  // White
      { index: 2, hex: "#FF0000" },  // Red
      // ... 13 more colors
    ];
  }
  
  setColor(index, hexColor) { /* validate & set */ }
  getColor(index) { /* return hex */ }
  toRGB565() { /* convert all to RGB565 */ }
  toJSON() { /* export format */ }
}
```

**Dependencies**: `hardwareLimits.js` (MAX_PALETTE_COLORS)

**Used By**: Scene, SceneInspector, PaletteEditor, TileSet, CharacterSet
  
---

### 1.3 Tile Model

**File**: `src/model/Tile.js`

**Purpose**: Represent an 8×8 tile with pixel data and properties.

**Key Features**:
- 64-element pixel array (indices 0-15 referencing palette)
- Properties: name, solid, damage, health, opacity, tag, collectValue
- Validation: pixel indices must be 0-15
- Methods: `clone()`, `toJSON()`, `isEmpty()`

**Data Structure**:
```javascript
class Tile {
  constructor(id, name = "New Tile") {
    this.id = id;
    this.name = name;
    this.pixels = new Array(64).fill(0); // 8x8 = 64 pixels
    this.solid = false;
    this.damage = 0;
    this.health = -1; // -1 = unbreakable
    this.opacity = 0; // 0 = opaque, 255 = transparent
    this.tag = "ground"; // ground, hazard, decor, collectible
    this.collectValue = 0; // for currency, 0 = not collectible
  }
  
  setPixel(index, colorIndex) { /* validate 0-15, set */ }
  getPixel(index) { /* return color index */ }
  setPixelAt(x, y, colorIndex) { /* 2D access */ }
  getPixelAt(x, y) { /* 2D access */ }
  toJSON() { /* export format */ }
}
```

**Dependencies**: `hardwareLimits.js` (TILE_SIZE, MAX_PALETTE_COLORS)

**Used By**: Scene, TileSet, TileInspector, PixelEditor, Canvas

---

### 1.4 Entity Model

**File**: `src/model/Entity.js`

**Purpose**: Represent characters (player/enemies) with animations and AI.

**Key Features**:
- 256-element pixel array for static representation (16×16)
- Stats: health, damage, speed, canJump
- Animation system: frameIds, fps, loop
- Patrol path for enemies
- Moveset index (predefined pool)

**Data Structure**:
```javascript
class Entity {
  constructor(id, name = "New Entity", tag = "enemy") {
    this.id = id;
    this.name = name;
    this.tag = tag; // "player" or "enemy"
    
    // Stats
    this.health = 100;
    this.damage = 10;
    this.speed = 5;
    this.canJump = true;
    this.movesetIndex = 0; // predefined movesets
    
    // Animations
    this.animations = {
      idle: { frameIds: [], fps: 6, loop: true },
      walk: { frameIds: [], fps: 8, loop: true },
      attack: { frameIds: [], fps: 10, loop: false }
    };
    this.defaultAnimation = "idle";
    
    // Enemy-specific
    this.patrolPath = []; // Array of {x, y} waypoints
    this.dropCurrency = 0;
    this.dropChance = 0; // 0-100 percentage
  }
  
  addFrame(animationName, frameId) { /* add to animation */ }
  setPatrolPath(waypoints) { /* validate & set */ }
  toJSON() { /* export format */ }
}
```

**Dependencies**: `hardwareLimits.js` (CHARACTER_SIZE, MAX_ENTITIES_PER_SCENE, MAX_PATROL_WAYPOINTS)

**Used By**: Scene, CharacterSet, EntityInspector, AnimationEditor, Canvas

---

### 1.5 Scene Model

**File**: `src/model/Scene.js`

**Purpose**: The main data structure that ties everything together. Represents one game level.

**Key Features**:
- Contains palette, tile definitions, entity definitions
- Tilemap layer (2D array of tile indices)
- Entity layer (2D array of entity placements)
- Collectibles layer (2D array)
- Spawn points and exits
- Character frame pool for animations

**Data Structure**:
```javascript
class Scene {
  constructor(id, width = 16, height = 12) {
    this.id = id;
    this.name = `Scene ${id}`;
    this.width = width; // tilemap width
    this.height = height; // tilemap height
    
    // Color management
    this.palette = new Palette();
    
    // Asset pools
    this.tiles = []; // Array of Tile objects
    this.entities = []; // Array of Entity objects
    this.collectibles = []; // Array of collectible definitions
    this.characterFrames = []; // Array of 16x16 pixel arrays (256 values each)
    
    // Layers (2D arrays)
    this.terrainLayer = this.createEmptyLayer(width, height);
    this.entityLayer = this.createEmptyLayer(width, height);
    this.collectibleLayer = this.createEmptyLayer(width, height);
    
    // Navigation
    this.spawnPoints = [
      { id: "default", x: 0, y: 0 }
    ];
    this.exits = [];
  }
  
  createEmptyLayer(width, height) {
    return Array(height).fill(null).map(() => Array(width).fill(0));
  }
  
  setTileAt(x, y, tileIndex) { /* validate & set */ }
  setEntityAt(x, y, entityIndex) { /* validate & set */ }
  
  addTile(tile) { /* add to tiles array */ }
  addEntity(entity) { /* add to entities array */ }
  addSpawnPoint(name, x, y) { /* add spawn */ }
  addExit(x, y, width, height, targetScene, targetSpawn, requirement) { /* add exit */ }
  
  resize(newWidth, newHeight) { /* recreate layers */ }
  
  toJSON() { /* export format matching your spec */ }
}
```

**Dependencies**: Palette, Tile, Entity, `hardwareLimits.js`

**Used By**: Everything! This is the central data structure.

---

### 1.6 State Management

**File**: `src/state/editorStore.js`

**Purpose**: Global state management using Zustand or Context API.

**State Structure**:
```javascript
{
  // Project state
  projectName: "My Game",
  scenes: [], // Array of Scene objects
  currentSceneId: null,
  
  // Selection state
  selectedTileId: null,
  selectedEntityId: null,
  selectedSpawnPointId: null,
  selectedExitId: null,
  
  // Tool state
  currentTool: "brush", // brush, eraser, eyedropper, patrol
  currentMode: "tilemap", // tilemap, entity, collectible, pixel-editor
  
  // UI state
  showGrid: true,
  zoom: 1.0,
  inspectorTab: "tile", // tile, entity, scene
}
```

**File**: `src/state/actions.js`

**Purpose**: Actions to modify state.

**Key Actions**:
- `createScene(width, height)`
- `deleteScene(sceneId)`
- `setCurrentScene(sceneId)`
- `addTileToCurrentScene(tile)`
- `updateTile(tileId, updates)`
- `selectTile(tileId)`
- `setToolMode(mode)`
- `placeTileAt(x, y, tileIndex)`
- `placeEntityAt(x, y, entityIndex)`
- `undo()`, `redo()` (future)

**Dependencies**: Scene, Tile, Entity, Palette

**Used By**: All components that modify or read state

---

### 1.7 Utility Functions

**File**: `src/utils/colour.js`

**Purpose**: Color conversion utilities.

**Functions**:
```javascript
export function hexToRgb(hex) { /* return {r, g, b} */ }
export function rgbToHex(r, g, b) { /* return "#RRGGBB" */ }
export function hexToRgb565(hex) { /* return 16-bit int */ }
export function rgb565ToHex(rgb565) { /* return "#RRGGBB" */ }
export function isValidHex(hex) { /* validate hex string */ }
```

**File**: `src/utils/grid.js`

**Purpose**: Grid calculations and conversions.

**Functions**:
```javascript
export function screenToGrid(screenX, screenY, cellSize, offsetX, offsetY) {
  /* return {gridX, gridY} */
}

export function gridToScreen(gridX, gridY, cellSize, offsetX, offsetY) {
  /* return {screenX, screenY} */
}

export function isInBounds(x, y, width, height) {
  /* return boolean */
}

export function index1DTo2D(index, width) {
  /* return {x, y} */
}

export function index2DTo1D(x, y, width) {
  /* return index */
}
```

**File**: `src/utils/id.js`

**Purpose**: Generate unique IDs.

**Functions**:
```javascript
let counter = 0;
export function generateId(prefix = "id") {
  return `${prefix}_${Date.now()}_${counter++}`;
}
```

**File**: `src/utils/math.js`

**Purpose**: Math utilities.

**Functions**:
```javascript
export function clamp(value, min, max) { /* clamp value */ }
export function lerp(start, end, t) { /* linear interpolation */ }
```

---

## Phase 2: Core Components (Reusable UI)

Build reusable UI components before building panels. Prevents duplication.

### 2.1 Grid Component

**File**: `src/components/Grid.jsx`

**Purpose**: Reusable grid component for Canvas, TileSet, CharacterSet, PixelEditor.

**Props**:
- `width` - number of columns
- `height` - number of rows
- `cellSize` - pixel size of each cell
- `data` - 2D array of values to render
- `palette` - Palette object for color lookup
- `onCellClick(x, y)` - callback
- `onCellRightClick(x, y)` - callback
- `showGrid` - boolean to show grid lines
- `selectedCell` - {x, y} to highlight

**Features**:
- Render grid using Canvas API for performance
- Handle mouse events (click, drag, hover)
- Grid snapping
- Zoom support (future)

**Used By**: Canvas, TileSet, CharacterSet, PixelEditor

---

### 2.2 ColorPicker Component

**File**: `src/components/ColorPicker.jsx`

**Purpose**: Color selection UI for palette editing.

**Props**:
- `color` - current hex color
- `onChange(hexColor)` - callback
- `disabled` - boolean

**Features**:
- Color wheel or swatch picker
- Hex input field
- RGB sliders (optional)
- Preview square

**Used By**: PaletteEditor (inside SceneInspector)

---

### 2.3 Button Component

**File**: `src/components/Button.jsx`

**Purpose**: Consistent button styling across app.

**Props**:
- `variant` - "primary", "secondary", "danger", "icon"
- `size` - "small", "medium", "large"
- `onClick` - callback
- `disabled` - boolean
- `icon` - optional icon component
- `children` - button text

**Used By**: All panels

---

### 2.4 NumberInput Component

**File**: `src/components/NumberInput.jsx`

**Purpose**: Number input with built-in validation against hardware limits.

**Props**:
- `value` - current number
- `onChange(number)` - callback
- `min` - minimum value
- `max` - maximum value (from hardwareLimits)
- `step` - increment step
- `label` - input label

**Features**:
- Arrow buttons for increment/decrement
- Keyboard input
- Auto-clamp to min/max
- Visual feedback if at limit

**Used By**: TileInspector, EntityInspector, SceneInspector

---

### 2.5 Dropdown Component

**File**: `src/components/Dropdown.jsx`

**Purpose**: Dropdown select menu.

**Props**:
- `options` - array of {value, label}
- `value` - current selection
- `onChange(value)` - callback
- `placeholder` - text when nothing selected
- `disabled` - boolean

**Used By**: EntityInspector (moveset, animation), SceneInspector (target scene, spawn)

---

### 2.6 List Component

**File**: `src/components/List.jsx`

**Purpose**: Display list of items with add/remove functionality.

**Props**:
- `items` - array of objects
- `renderItem(item, index)` - render function
- `onAdd` - callback for add button
- `onRemove(index)` - callback
- `onSelect(index)` - callback for selection
- `selectedIndex` - currently selected item
- `maxItems` - max length (from hardwareLimits)

**Features**:
- Scrollable list
- Add button (+ icon)
- Delete button per item
- Selection highlight
- Disable add button when at max

**Used By**: TileSet, CharacterSet, ScenesMenu, palette display, spawn points list, exits list

---

### 2.7 Modal Component

**File**: `src/components/Modal.jsx`

**Purpose**: Dialog for creating new tiles/characters/scenes.

**Props**:
- `isOpen` - boolean
- `onClose` - callback
- `title` - modal title
- `children` - modal content
- `onConfirm` - callback for confirm button
- `onCancel` - callback for cancel button

**Used By**: TileSet, CharacterSet, ScenesMenu (when clicking + button)

---

## Phase 3: Layout Shell

Build the 5-column grid layout to see the structure.

### 3.1 Editor Layout

**File**: `src/Layout/EditorLayout.jsx`

**Purpose**: Main 5×5 grid layout container.

**Structure**:
```
┌─────────┬──────────────────────────────┬─────────┐
│         │                              │         │
│ Tile    │                              │         │
│ Area    │      CanvasArea              │Inspector│
│         │                              │ Area    │
├─────────┤                              │         │
│ Scenes  │                              │         │
│ Menu    ├──────────────────────────────┤         │
│         │    CharacterArea             │         │
└─────────┴──────────────────────────────┴─────────┘
```

**Layout Details**:
- **5 columns × 5 rows**
- **Column 1 (200px)**: TileArea (3 rows) + ScenesMenu (2 rows)
- **Columns 2-4 (3 columns, flex 1fr each)**: CanvasArea (4 rows) + CharacterArea (1 row)
- **Column 5 (300px)**: InspectorArea (full 5 rows)

**CSS Grid**:
```css
.editor-layout {
  display: grid;
  grid-template-columns: 200px 1fr 1fr 1fr 300px;
  grid-template-rows: repeat(5, 1fr);
  height: 100vh;
}

.tile-area { grid-column: 1; grid-row: 1 / 4; }      /* 3 rows */
.scenes-menu { grid-column: 1; grid-row: 4 / 6; }    /* 2 rows */
.canvas-area { grid-column: 2 / 5; grid-row: 1 / 5; } /* 3 cols, 4 rows */
.character-area { grid-column: 2 / 5; grid-row: 5; }  /* 3 cols, 1 row */
.inspector-area { grid-column: 5; grid-row: 1 / 6; }  /* 5 rows */
```

**Used By**: App.jsx (main container)

---

### 3.2 Area Components (Empty Placeholders)

**Files**: 
- `src/Layout/TileArea.jsx` - Container for TileSet panel
- `src/Layout/CanvasArea.jsx` - Container for Canvas panel + tabs
- `src/Layout/CharacterArea.jsx` - Container for CharacterSet panel
- `src/Layout/InspectorArea.jsx` - Container for Inspector panels

**Purpose**: Layout containers that will hold the actual panels. Start with just colored divs to verify layout works.

---

## Phase 4: Build Panels (Workflow Order)

Build panels in the order users will interact with them.

### 4.1 Scenes Menu

**File**: `src/panels/ScenesMenu.jsx`

**Purpose**: Create and switch between scenes.

**Features**:
- List of all scenes (use List component)
- + button to create new scene
- Click scene to switch to it
- Highlight current scene
- Delete scene button

**State Used**: 
- `scenes` array
- `currentSceneId`

**Actions Called**:
- `createScene(width, height)`
- `setCurrentScene(sceneId)`
- `deleteScene(sceneId)`

**Order**: Build first so users can create a scene before doing anything else.

---

### 4.2 Scene Inspector

**File**: `src/panels/Inspectors/SceneInspector.jsx`

**Purpose**: Edit scene properties (name, dimensions, palette, spawn points, exits).

**Sections**:
1. **Scene Info**
   - Name input
   - Width/Height inputs (NumberInput, max 64)
   
2. **Palette Editor** (import PaletteEditor component)
   - Display 16 color swatches
   - Click to open ColorPicker
   - Each color index labeled 0-15
   
3. **Spawn Points**
   - List of spawn points
   - Add/remove buttons
   - Edit x, y coordinates
   
4. **Exits**
   - List of exits
   - Add/remove buttons
   - Edit x, y, width, height
   - Target scene dropdown
   - Target spawn dropdown
   - Requirement dropdown (0 = none, 1-64 = inventory items)

**State Used**: 
- `currentScene`

**Actions Called**:
- `updateScene(sceneId, updates)`
- `addSpawnPoint(name, x, y)`
- `addExit(...)`

**Order**: Build second. Users need to set up palette before creating tiles.

---

### 4.3 Palette Editor Sub-Component

**File**: `src/panels/Inspectors/PaletteEditor.jsx`

**Purpose**: Manage 16 colors for current scene.

**Layout**:
- 4×4 grid of color swatches
- Each swatch shows index (0-15)
- Click swatch to open ColorPicker
- Reset to default button

**Props**:
- `palette` - Palette object
- `onChange(index, hexColor)` - callback

**Used By**: SceneInspector

---

### 4.4 TileSet Panel

**File**: `src/panels/TileSet.jsx`

**Purpose**: Display and manage all tiles for current scene.

**Features**:
- Grid of tiles (use Grid component with fixed 8×8 cells)
- Render tiles using their pixel data + palette
- Left click to select tile (for painting on canvas)
- + button to create new tile
- Right click on tile → shows context menu (edit, delete)
- Filter dropdown by tag (ground, hazard, decor, collectible)
- Show tile count (X / 256)

**State Used**:
- `currentScene.tiles`
- `currentScene.palette`
- `selectedTileId`

**Actions Called**:
- `addTileToCurrentScene(tile)`
- `selectTile(tileId)`
- `deleteTile(tileId)`

**Modal on + Click**:
- Prompt for tile name
- Create empty Tile object
- Switch to PixelEditor mode

**Order**: Build third. Users create tiles here.

---

### 4.5 Tile Inspector

**File**: `src/panels/Inspectors/TileInspector.jsx`

**Purpose**: Edit properties of selected tile.

**Shown When**: A tile is selected from TileSet.

**Fields**:
- Name (text input)
- Tag (dropdown: ground, hazard, decor, collectible)
- Solid (checkbox)
- Damage (NumberInput, 0-255)
- Health (NumberInput, -1 to 255, -1 = unbreakable)
- Opacity (slider, 0-255)
- Collect Value (NumberInput, shown if tag = collectible)
- [Edit Pixels] button → switches canvas to PixelEditor mode
- [Delete] button → removes tile

**State Used**:
- `selectedTile`

**Actions Called**:
- `updateTile(tileId, updates)`
- `setCurrentMode("pixel-editor")`

**Order**: Build fourth, right after TileSet.

---

### 4.6 Pixel Editor Mode (Canvas Switch)

**File**: `src/panels/PixelEditor.jsx` or part of `Canvas.jsx`

**Purpose**: 8×8 or 16×16 grid for editing individual pixels.

**Features**:
- When editing tile: 8×8 grid
- When editing entity: 16×16 grid
- Color palette display (16 colors from scene palette)
- Click color to select it
- Click grid cell to paint with selected color
- Right click to erase (set to color 0)
- [Save] button → exit pixel editor mode
- [Cancel] button → discard changes

**State Used**:
- `currentMode` (should be "pixel-editor")
- `selectedTile` or `selectedEntity`
- `currentScene.palette`

**Order**: Build fifth. Needed to actually draw tiles.

---

### 4.7 Canvas (Tilemap Mode)

**File**: `src/panels/Canvas.jsx`

**Purpose**: Main drawing area. Displays tilemap and handles tile placement.

**Modes**:
1. **Tilemap Mode** (default)
   - Display scene terrain layer
   - Left click to place selected tile
   - Right click to erase (set to 0)
   - Grid snapping
   - Show grid lines
   
2. **Entity Mode**
   - Display entity layer
   - Place entities on grid
   
3. **Collectible Mode**
   - Display collectibles layer
   
4. **Pixel Editor Mode**
   - Switch to 8×8 or 16×16 grid

**Features**:
- Tab bar at top: "Tilemap" | "Entities" | "Collectibles"
- Zoom controls (future)
- Minimap (future)
- Undo/Redo (future)

**State Used**:
- `currentScene`
- `selectedTileId` or `selectedEntityId`
- `currentMode`

**Actions Called**:
- `placeTileAt(x, y, tileIndex)`
- `placeEntityAt(x, y, entityIndex)`

**Order**: Build sixth. This is where the level comes together.

---

### 4.8 Character Set Panel

**File**: `src/panels/CharacterSet.jsx`

**Purpose**: Display and manage entities (player & enemies).

**Features**:
- Grid of entities (16×16 preview)
- Player always listed first
- + button to create new entity
- Left click to select entity (for placement on canvas)
- Right click → context menu (edit, delete)
- Show entity count (X / 32)

**State Used**:
- `currentScene.entities`
- `selectedEntityId`

**Actions Called**:
- `addEntityToCurrentScene(entity)`
- `selectEntity(entityId)`
- `deleteEntity(entityId)`

**Order**: Build seventh. Entities come after basic level structure.

---

### 4.9 Entity Inspector

**File**: `src/panels/Inspectors/EntityInspector.jsx`

**Purpose**: Edit entity properties and stats.

**Shown When**: An entity is selected from CharacterSet.

**Sections**:

1. **Basic Info**
   - Name (text input)
   - Tag (dropdown: player, enemy)
   
2. **Stats**
   - Health (NumberInput)
   - Damage (NumberInput)
   - Speed (NumberInput)
   - Can Jump (checkbox)
   - Moveset (dropdown: melee, ranged, lobbed)
   
3. **Enemy Specific** (only if tag = enemy)
   - Drop Currency (NumberInput)
   - Drop Chance (NumberInput, 0-100)
   - [Record Patrol Path] button → enables patrol mode
   
4. **Animations**
   - [Edit Animations] button → opens AnimationEditor
   
5. **Actions**
   - [Edit Pixels] button → switches to 16×16 PixelEditor
   - [Delete] button

**Patrol Path Mode**:
- When recording, entity can be moved with arrow keys or WASD
- Click grid cells to add waypoint
- Path completes when returning to start
- Store as array of {x, y}
- Or: use bitpacked format (2 bits each for x/y direction)

**State Used**:
- `selectedEntity`

**Actions Called**:
- `updateEntity(entityId, updates)`
- `setPatrolPath(entityId, waypoints)`

**Order**: Build eighth, after CharacterSet.

---

### 4.10 Animation Editor

**File**: `src/panels/AnimationEditor.jsx`

**Purpose**: Create animation sequences for entities.

**Layout**:
- Timeline at top with columns for frames
- Preview area showing current frame
- Frame table on left (list of all character frames)
- Animation list: Idle, Walk, Attack, Death

**Features**:
1. **Character Frame Pool**
   - List showing all 16×16 frames (max 256)
   - Thumbnail preview of each
   - + button to create new frame → opens PixelEditor
   
2. **Animation Timeline**
   - Tabs for each animation type (idle, walk, attack)
   - Columns representing frame sequence
   - Drag frames from pool into timeline
   - Set FPS for animation
   - Loop checkbox
   
3. **Preview**
   - Play/Pause button
   - Scrub through frames
   - Shows animation in real-time

**State Used**:
- `selectedEntity.animations`
- `currentScene.characterFrames`

**Actions Called**:
- `addCharacterFrame(pixelData)`
- `updateEntityAnimation(entityId, animationType, frameIds, fps, loop)`

**Order**: Build ninth. Most complex panel, save for later.

---

## Phase 5: Export System

### 5.1 JSON Generator

**File**: `src/utils/export/jsonGenerator.js`

**Purpose**: Convert Scene objects to the JSON format specified in DOWN-SCALED.md.

**Functions**:

```javascript
export function generateMetadataJSON(projectName, scenes, playerState) {
  // Return metadata.json structure
}

export function generateSceneJSON(scene) {
  // Convert Scene object to scene.json format
  // Include: palette, tiles, entities, layers, spawnPoints, exits
}

export function packPixelArray(pixels) {
  // Convert pixel indices to 4bpp format
  // Pack 2 pixels per byte
}

export function convertPaletteToRGB565(palette) {
  // Convert all hex colors to RGB565 format
}
```

**Order**: Build tenth. After all panels work.

---

### 5.2 Scene Exporter

**File**: `src/utils/export/sceneExporter.js`

**Purpose**: Package all scenes and trigger download or API call.

**Functions**:

```javascript
export function exportProject(projectName, scenes) {
  const metadata = generateMetadataJSON(projectName, scenes);
  const sceneFiles = scenes.map(scene => generateSceneJSON(scene));
  
  return {
    metadata,
    scenes: sceneFiles
  };
}

export function downloadAsJSON(data, filename) {
  // Create blob and trigger browser download
}

export function exportToBackend(data) {
  // Call kafkaClient or apiClient
}
```

**Order**: Build eleventh.

---

### 5.3 API Client

**File**: `src/utils/export/kafkaClient.js` or `apiClient.js`

**Purpose**: Send JSON to backend via REST API or Kafka stream.

**Functions**:

```javascript
export async function pushToKafka(topic, data) {
  // POST to backend endpoint
  // Backend handles Kafka publishing
}

export async function validateJSON(data) {
  // Optional: call backend validation endpoint first
}
```

**Order**: Build last when backend is ready.

---

## Phase 6: Polish & Future Features

After core functionality works, add these:

### 6.1 New Project Modal
**File**: `src/panels/NewProject.jsx`
- Project name input
- Initial scene dimensions
- Create button

### 6.2 Undo/Redo System
- Track action history in state
- Implement undo/redo stack

### 6.3 Keyboard Shortcuts
- Ctrl+Z / Ctrl+Y for undo/redo
- Arrow keys for entity patrol recording
- Hotkeys for tool switching

### 6.4 Zoom Controls
- Zoom in/out buttons
- Fit to screen
- 50%, 100%, 200% presets

### 6.5 Scene Graph Visualizer
- Visual diagram of scene connections
- Show broken entry/exit references in red
- Click to navigate between scenes

### 6.6 Flood Fill Tool
- Paint large areas with one click

### 6.7 Minimap
- Small overview of entire tilemap in corner

### 6.8 Import/Export Tile Sets
- Save/load tile libraries for reuse across projects

---

## Development Tips

### Testing Strategy
- Build incrementally: each component should be testable in isolation
- Use mock data for testing UI before state management is complete
- Test with hardware limits (max tiles, max entities)

### State Management Options
- **Zustand**: Simple, minimal boilerplate
- **React Context + useReducer**: Built-in, good for smaller apps
- **Redux**: Overkill for this project

### Performance Considerations
- Use Canvas API for grid rendering (not DOM elements)
- Memoize expensive computations (React.memo, useMemo)
- Debounce state updates during dragging/painting

### File Organization Tips
- Keep related files together (Inspector.jsx + InspectorArea.jsx)
- Use barrel exports (index.js) for cleaner imports
- Separate business logic from UI components

---

## Summary Checklist

### Phase 1: Foundation ✓
- [ ] hardwareLimits.js
- [ ] Palette.js
- [ ] Tile.js
- [ ] Entity.js
- [ ] Scene.js
- [ ] editorStore.js + actions.js
- [ ] colour.js, grid.js, id.js, math.js

### Phase 2: Components ✓
- [ ] Grid.jsx
- [ ] ColorPicker.jsx
- [ ] Button.jsx
- [ ] NumberInput.jsx
- [ ] Dropdown.jsx
- [ ] List.jsx
- [ ] Modal.jsx

### Phase 3: Layout ✓
- [ ] EditorLayout.jsx
- [ ] TileArea.jsx, CanvasArea.jsx, CharacterArea.jsx, InspectorArea.jsx

### Phase 4: Panels ✓
- [ ] ScenesMenu.jsx
- [ ] SceneInspector.jsx + PaletteEditor.jsx
- [ ] TileSet.jsx
- [ ] TileInspector.jsx
- [ ] PixelEditor.jsx
- [ ] Canvas.jsx
- [ ] CharacterSet.jsx
- [ ] EntityInspector.jsx
- [ ] AnimationEditor.jsx

### Phase 5: Export ✓
- [ ] jsonGenerator.js
- [ ] sceneExporter.js
- [ ] kafkaClient.js / apiClient.js

### Phase 6: Polish 🎨
- [ ] NewProject.jsx
- [ ] Undo/Redo
- [ ] Keyboard shortcuts
- [ ] Zoom controls
- [ ] Scene graph visualizer
- [ ] Flood fill
- [ ] Minimap

---

**Total Estimated Time**: 4-6 weeks for core functionality (Phases 1-5)

Good luck! 🚀
