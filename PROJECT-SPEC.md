# Dolkaraa Editor - Technical Specification

A level editor for ESP32-based retro games with extreme hardware constraints.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Hardware Constraints](#hardware-constraints)
4. [Data Formats](#data-formats)
5. [Color & Graphics System](#color--graphics-system)
6. [Entity System](#entity-system)
7. [Scene Navigation](#scene-navigation)
8. [Animation System](#animation-system)
9. [UI/UX Layout](#uiux-layout)
10. [Component Specifications](#component-specifications)
11. [JSON Output Format](#json-output-format)
12. [Future Features](#future-features)

---

## Project Overview

### Purpose
Build a web-based level editor that generates optimized game data for ESP32 microcontrollers running a custom game engine.

### Workflow
```
Editor (React + Vite)
  ↓ Generate JSON
Kafka Stream
  ↓ Validate
Backend Service
  ↓ Generate C++ files
PlatformIO
  ↓ Compile .pack file
ESP32 (4MB flash) + SD Card
```

### Supported Genres
- **Phase 1**: 2D Platformer
- **Phase 2**: Top-down adventure

---

## Architecture

### Technology Stack
- **Frontend**: React 19 + Vite
- **State Management**: Zustand / Context API
- **Rendering**: HTML5 Canvas API
- **Export**: JSON → Kafka Stream → Backend

### Data Flow
```
User Input → EditorStore → Scene Model → JSON Export → Backend Validation
```

---

## Hardware Constraints

### ESP32 Specifications
| Resource | Limit | Notes |
|----------|-------|-------|
| Flash Memory | 4 MB | Shared with game engine |
| RAM | 420 KB | After system overhead |
| CPU | 240 MHz | Dual-core Xtensa |
| Frame Budget | 8M cycles @ 30 FPS | 99%+ headroom available |

### Editor Limits (Per Scene)
| Asset Type | Maximum | Size Impact |
|------------|---------|-------------|
| Tilemap Size | 64 × 64 | 4 KB (terrain layer) |
| Unique Tiles | 256 | ~10 KB definitions |
| Entities | 32 | ~4 KB |
| Palette Colors | 16 | Fixed per scene |
| Spawn Points | 8 | ~256 bytes |
| Exits | 8 | ~512 bytes |
| Patrol Waypoints | 32 per enemy | ~128 bytes |
| Collectibles | 64 unique types | ~2 KB |
| Animation Frames | 256 (shared pool) | ~4 KB |
| Currency | 4,294,967,295 | 32-bit unsigned |
| Inventory Slots | 64 | 8-byte bitfield |

**Total Scene Size**: ~26 KB (16 scenes fit in RAM simultaneously)

---

## Data Formats

### Pixel Encoding (4bpp)
- **Bits per pixel**: 4 (palette index 0-15)
- **Packing**: 2 pixels per byte
- **Example**: Pixels `[3, 7]` → `0x37` (1 byte)
- **Tile (8×8)**: 64 pixels → 32 bytes
- **Character (16×16)**: 256 pixels → 128 bytes

### 1D Array Layout
For an 8×8 tile:
- Row 0: indices 0-7
- Row 1: indices 8-15
- Row i: indices `(8 × i)` to `(8 × i + 7)`

For a 16×16 character:
- Row i: indices `(16 × i)` to `(16 × i + 15)`

---

## Color & Graphics System

### Color Palette (Per Scene)
- **Count**: Exactly 16 colors
- **Format (Editor)**: sRGB hex (`#RRGGBB`)
- **Format (ESP32)**: RGB565 (16-bit)
- **Conversion**: Backend handles sRGB → RGB565

### Color Index Benefits
- 4-bit indices (0-15) save memory
- Easy palette swaps for day/night cycles
- Reduces scene size by 75% vs full RGB

### Logical vs Physical Pixels
| Type | Logical Size | Physical Size | Scale Factor |
|------|--------------|---------------|--------------|
| Tile | 8 × 8 | 160 × 160 | 20× |
| Character | 16 × 16 | 160 × 160 | 10× |

**Note**: Characters must scale at 10× to avoid being 4× larger than tiles.

---

## Entity System

### Entity Types
1. **Player** (tag: `"player"`)
   - One per scene (placed in entity layer)
   - Stats: health, damage, speed, canJump
   - Moveset index (predefined attacks)
   
2. **Enemies** (tag: `"enemy"`)
   - Patrol paths (looping waypoints)
   - Drop currency + chance percentage
   - AI behavior determined by moveset index

### Moveset Pool (Predefined)
| Index | Type | Description |
|-------|------|-------------|
| 0 | Melee | Close-range attack |
| 1 | Ranged | Projectile attack |
| 2 | Lobbed | Arc projectile |
| 3+ | Custom | Future expansion |

### Patrol Path Encoding (2 bits per axis)
| Value | X-axis | Y-axis |
|-------|--------|--------|
| `00` | No change | No change |
| `01` | +1 | +1 |
| `10` | -1 | -1 |
| `11` | Special move | Special move |

**Example Path**: `[{00, 11}, {01, 10}, {10, 01}]`
- Move 1: Stay, special move down
- Move 2: Right, left
- Move 3: Left, up

---

## Scene Navigation

### Spawn Points
- **Purpose**: Entry locations when entering from another scene
- **Properties**: `id` (string), `x`, `y`
- **Default**: Always include `"default"` spawn (fallback)

```javascript
{
  "id": "main_entrance",
  "x": 5,
  "y": 10
}
```

### Exits
- **Purpose**: Trigger scene transitions
- **Properties**: `x`, `y`, `width`, `height`, `targetScene`, `targetSpawn`, `requirement`
- **Requirements**: 
  - `"no"` = unlocked
  - `1-64` = inventory item index needed

```javascript
{
  "x": 63,
  "y": 10,
  "width": 1,
  "height": 3,
  "targetScene": "level_2",
  "targetSpawn": "main_entrance",
  "requirement": 3  // Needs key item #3
}
```

---

## Animation System

### Structure
- **Character Frames Pool**: Shared array of 16×16 pixel arrays (max 256)
- **Animations**: Reference frame IDs from pool
- **Reusability**: Multiple entities use same frames (e.g., all slimes share frames)

### Animation Definition
```javascript
{
  "idle": { 
    "frameIds": [10, 11],  // References frames #10 and #11
    "fps": 6, 
    "loop": true 
  },
  "walk": { 
    "frameIds": [12, 13, 14, 15], 
    "fps": 8, 
    "loop": true 
  },
  "attack": { 
    "frameIds": [16, 17], 
    "fps": 10, 
    "loop": false  // Play once
  }
}
```

### Typical Frame Counts
| Entity | Idle | Walk | Attack | Total |
|--------|------|------|--------|-------|
| Player | 2 | 4 | 2-3 | ~10 frames (1.3 KB) |
| Enemy | 2 | 2 | 1-2 | ~5 frames (640 bytes) |

**Optimization**: Use frame duplication for symmetrical sprites (flip horizontally in engine).

---

## UI/UX Layout

### 5×5 Grid Structure

```
┌─────────┬──────────────────────────────┬─────────┐
│ ░░░░░░░ │                              │ ▓▓▓▓▓▓▓ │
│ ░ Tile  │                              │ ▓       │
│ ░ Area  │      Canvas Area             │ ▓ Insp. │
│ ░       │                              │ ▓ Area  │
├─────────┤                              │ ▓       │
│ ░░░░░░░ │                              │ ▓       │
│ ░Scenes ├──────────────────────────────┤ ▓       │
│ ░ Menu  │   Character Area             │ ▓       │
└─────────┴──────────────────────────────┴─────────┘
```

### Grid Breakdown
- **Column 1 (200px)**: TileArea (3 rows) + ScenesMenu (2 rows)
- **Columns 2-4 (flexible)**: CanvasArea (4 rows) + CharacterArea (1 row)
- **Column 5 (300px)**: InspectorArea (5 rows)

### CSS Grid Template
```css
grid-template-columns: 200px 1fr 1fr 1fr 300px;
grid-template-rows: repeat(5, 1fr);
```

---

## Component Specifications

### 1. Tile Set Panel
**Location**: Left column, top 3 rows

**Features**:
- Grid display of all tiles (8×8 preview)
- Left click: Select tile for painting
- Right click: Context menu (edit, delete)
- `+` button: Create new tile → opens PixelEditor
- Filter dropdown by tag (ground, hazard, decor, collectible)
- Counter: "X / 256 tiles"

**Interactions**:
- Selecting tile → highlights in grid + shows TileInspector
- Creating tile → switches canvas to 8×8 pixel editor mode

---

### 2. Scenes Menu Panel
**Location**: Left column, bottom 2 rows

**Features**:
- List of all scenes (scrollable)
- `+` button: Create new scene (prompts for name, dimensions)
- Click scene: Switch to it
- Highlight current scene
- Right click: Delete scene (with confirmation)

**Interactions**:
- Creating scene → shows SceneInspector
- Switching scene → loads new tilemap, palette, entities

---

### 3. Canvas Panel
**Location**: Middle 3 columns, top 4 rows

**Modes**:
1. **Tilemap Mode** (default)
   - Display terrain layer
   - Paint selected tile on click
   - Grid snapping enabled
   
2. **Entity Mode**
   - Display entity layer
   - Place selected entity on click
   
3. **Collectible Mode**
   - Display collectibles layer
   
4. **Pixel Editor Mode**
   - 8×8 grid (tiles) or 16×16 grid (characters)
   - Color palette selector
   - Paint with selected color

**Features**:
- Tab bar: `Tilemap | Entities | Collectibles`
- Zoom controls (future)
- Grid toggle
- Undo/redo (future)
- Minimap (future)

**Interactions**:
- Left click: Place tile/entity
- Right click: Erase
- Hover: Show grid coordinates

---

### 4. Character Set Panel
**Location**: Middle 3 columns, bottom 1 row

**Features**:
- Horizontal scrolling list of entities
- Player always shown first
- 16×16 preview thumbnails
- `+` button: Create new entity
- Left click: Select for placement
- Right click: Edit/delete menu
- Counter: "X / 32 entities"

**Interactions**:
- Selecting entity → shows EntityInspector
- Creating entity → switches canvas to 16×16 pixel editor

---

### 5. Inspector Panel
**Location**: Right column, full height

**Dynamic Content** (based on selection):

#### A. Tile Inspector
Shown when tile selected from TileSet.

**Fields**:
- Name (text input)
- Tag (dropdown: ground, hazard, decor, collectible)
- Solid (checkbox)
- Damage (number input, 0-255)
- Health (number input, -1 to 255, -1 = unbreakable)
- Opacity (slider, 0-255)
- Collect Value (number input, if tag = collectible)

**Actions**:
- `[Edit Pixels]` button → switches to PixelEditor
- `[Delete Tile]` button

---

#### B. Entity Inspector
Shown when entity selected from CharacterSet.

**Sections**:

**Basic Info**:
- Name (text input)
- Tag (dropdown: player, enemy)

**Stats**:
- Health (number input)
- Damage (number input)
- Speed (number input)
- Can Jump (checkbox)
- Moveset (dropdown: melee, ranged, lobbed)

**Enemy-Specific** (if tag = enemy):
- Drop Currency (number input)
- Drop Chance (0-100 slider)
- `[Record Patrol Path]` button → enables waypoint recording mode

**Animations**:
- `[Edit Animations]` button → opens AnimationEditor

**Actions**:
- `[Edit Pixels]` button → 16×16 PixelEditor
- `[Delete Entity]` button

---

#### C. Scene Inspector
Shown when scene selected from ScenesMenu.

**Sections**:

**Scene Properties**:
- Name (text input)
- Width (number input, max 64)
- Height (number input, max 64)

**Palette Editor**:
- 4×4 grid of color swatches (indices 0-15)
- Click swatch → ColorPicker modal
- `[Reset to Default]` button

**Spawn Points**:
- List component showing all spawn points
- `+` button to add new
- Each item editable: `id`, `x`, `y`
- Delete button per item

**Exits**:
- List component showing all exits
- `+` button to add new
- Each item editable:
  - Position: `x`, `y`
  - Size: `width`, `height`
  - Target Scene (dropdown)
  - Target Spawn (dropdown)
  - Requirement (dropdown: none, or item 1-64)
- Delete button per item

---

### 6. Pixel Editor (Canvas Mode)
**Triggered by**: `[Edit Pixels]` button in TileInspector or EntityInspector

**Layout**:
- Large grid (8×8 or 16×16)
- Palette selector (16 colors from scene palette)
- Current color indicator
- `[Save]` button → returns to tilemap mode
- `[Cancel]` button → discards changes

**Interactions**:
- Click palette color → select it
- Click grid cell → paint with selected color
- Right click grid → erase (set to color 0)
- Middle mouse → eyedropper tool

---

### 7. Animation Editor
**Triggered by**: `[Edit Animations]` button in EntityInspector

**Layout**:

**Left Sidebar**: Character Frames Pool
- Scrollable list of all frames (thumbnails)
- `+` button → create new frame (opens PixelEditor)
- Counter: "X / 256 frames"

**Center**: Timeline
- Tabs: `Idle | Walk | Attack | Death`
- Horizontal timeline with frame slots
- Drag frames from pool into slots
- Reorder frames by dragging
- Right click frame → remove from timeline

**Right**: Animation Settings
- FPS slider (1-30)
- Loop checkbox
- `[Preview]` button → plays animation

**Bottom**: Preview Window
- Shows current frame
- Play/pause controls
- Frame scrubber

---

### 8. Patrol Path Editor (Canvas Mode)
**Triggered by**: `[Record Patrol Path]` button in EntityInspector (enemy only)

**Mode Description**:
Canvas switches to waypoint recording mode.

**Method 1: Click Selection**
- Click grid cells to add waypoints
- Path draws line connecting waypoints
- Double-click to finish path
- Must return to start position (loop validation)

**Method 2: WASD Recording**
- Press `W/A/S/D` or arrow keys to move entity
- Each move records waypoint
- Path completes when returning to start
- Shows trail of visited cells

**Validation**:
- Max 32 waypoints
- Path must loop (start = end)
- Path must be continuous (no gaps)

---

## JSON Output Format

### Metadata JSON (Project-Level)

```json
{
  "gameId": "my-game",
  "version": "0.1.0",
  
  "target": {
    "platform": "esp32",
    "board": "esp32dev",
    "framework": "arduino"
  },
  
  "tileSize": {
    "width": 8,
    "height": 8
  },
  
  "characterSize": {
    "width": 16,
    "height": 16
  },
  
  "startScene": "level_1",
  
  "scenes": [
    { "id": "level_1", "file": "scene_level_1.json" },
    { "id": "level_2", "file": "scene_level_2.json" }
  ],
  
  "build": {
    "optimize": "size",
    "profile": "release"
  },
  
  "playerState": {
    "currency": 0,
    "inventory": "0x0000000000000000",
    "health": 100,
    "currentScene": 0,
    "abilities": [
      { "id": 1, "unlocked": false},
      { "id": 2, "unlocked": true}
    ]
  }
}
```

---

### Scene JSON (Per Level)

```json
{
  "sceneId": "level_1",
  
  "size": {
    "width": 16,
    "height": 12
  },
  
  "palette": {
    "format": "indexed",
    "colors": [
      { "index": 0, "rgb": "#000000" },
      { "index": 1, "rgb": "#FFFFFF" },
      { "index": 2, "rgb": "#3CB371" },
      { "index": 3, "rgb": "#8B4513" },
      // ... 12 more colors (16 total)
    ]
  },
  
  "tiles": [
    {
      "id": 0,
      "name": "air",
      "tag": "ground",
      "solid": false,
      "damage": 0,
      "health": -1,
      "opacity": 255,
      "collectValue": 0,
      "pixels": [0, 0, 0, 0, /* ... 64 values */]
    },
    {
      "id": 1,
      "name": "grass",
      "tag": "ground",
      "solid": true,
      "damage": 0,
      "health": -1,
      "opacity": 0,
      "collectValue": 0,
      "pixels": [2, 2, 2, 3, /* ... 64 values */]
    }
  ],
  
  "collectibles": [
    {
      "id": 0,
      "name": "none"
    },
    {
      "id": 1,
      "name": "Coin",
      "value": 10,
      "pixels": [/* ...64 values for 8x8 */]
    },
    {
      "id": 2,
      "name": "Key",
      "inventorySlot": 1,
      "pixels": [/* ... */]
    }
  ],
  
  "layers": {
    "terrain": [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 0, 0, 0, 0, 1, 0]
    ],
    "entities": [
      [0, 0, 1, 0, 0, 0],  // Player at (2, 0)
      [0, 2, 0, 0, 3, 0]   // Slime at (1, 1), Bat at (4, 1)
    ],
    "collectibles": [
      [0, 0, 1, 0, 0, 0],  // Coin at (2, 0)
      [0, 0, 0, 2, 0, 0]   // Key at (3, 1)
    ]
  },
  
  "characterFrames": [
    { "id": 0, "pixels": [/* 256 values */] },
    { "id": 1, "pixels": [/* 256 values */] },
    // ... pool of all animation frames
  ],
  
  "entities": [
    {
      "id": 1,
      "name": "Player",
      "tag": "player",
      "health": 100,
      "damage": 10,
      "speed": 5,
      "canJump": true,
      "movesetIndex": 0,
      "animations": {
        "idle": { "frameIds": [0, 1], "fps": 6, "loop": true },
        "walk": { "frameIds": [2, 3, 4, 5], "fps": 8, "loop": true },
        "attack": { "frameIds": [6, 7], "fps": 10, "loop": false }
      },
      "defaultAnimation": "idle"
    },
    {
      "id": 2,
      "name": "Slime",
      "tag": "enemy",
      "health": 20,
      "damage": 5,
      "speed": 2,
      "canJump": false,
      "movesetIndex": 0,
      "dropCurrency": 50,
      "dropChance": 30,
      "patrolPath": [
        { "x": 0, "y": 0 },
        { "x": 3, "y": 0 },
        { "x": 3, "y": 2 },
        { "x": 0, "y": 2 }
      ],
      "animations": {
        "idle": { "frameIds": [8, 9], "fps": 4, "loop": true },
        "walk": { "frameIds": [10, 11], "fps": 6, "loop": true },
        "attack": { "frameIds": [12], "fps": 8, "loop": false }
      },
      "defaultAnimation": "idle"
    }
  ],
  
  "spawnPoints": [
    {
      "id": "default",
      "x": 2,
      "y": 10
    },
    {
      "id": "main_entrance",
      "x": 1,
      "y": 5
    },
    {
      "id": "secret_door",
      "x": 15,
      "y": 1
    }
  ],
  
  "exits": [
    {
      "x": 15,
      "y": 5,
      "width": 1,
      "height": 3,
      "targetScene": "level_2",
      "targetSpawn": "main_entrance",
      "requirement": "no"
    },
    {
      "x": 0,
      "y": 8,
      "width": 1,
      "height": 2,
      "targetScene": "level_1_secret",
      "targetSpawn": "cave",
      "requirement": 1  // Needs key (inventory slot 1)
    }
  ]
}
```

---

## Future Features

### Phase 2 (Near-term)
- [ ] Audio system (music + SFX)
- [ ] Parallax background layers (2 layers)
- [ ] Scene graph visualizer (node diagram with connections)
- [ ] Playtest mode (run game in editor)
- [ ] Import/export tile sets
- [ ] Import/export character sets
- [ ] Undo/redo system
- [ ] Zoom controls (50%, 100%, 200%)
- [ ] Flood fill tool
- [ ] Minimap

### Phase 3 (Mid-term)
- [ ] Particle system (preset effects)
- [ ] Animated tiles
- [ ] Boss battle support
- [ ] Haptic feedback triggers
- [ ] Memory usage indicator
- [ ] Auto-tiling
- [ ] Prefab system
- [ ] Dual-core optimization settings

### Phase 4 (Long-term)
- [ ] Marketplace (sell/buy assets, levels, games)
- [ ] Collaboration features (real-time editing)
- [ ] Multiple microcontroller support (different limits)
- [ ] Advanced AI behaviors (state machines, pathfinding)
- [ ] Weather effects
- [ ] Crafting system
- [ ] Quest/dialog system
- [ ] Physics system configuration
- [ ] Procedural generation tools
- [ ] Local co-op setup (WiFi)
- [ ] Leaderboard integration

---

## Performance Budget

### RAM Usage (Per Scene)
| Component | Size | Notes |
|-----------|------|-------|
| Terrain Layer | 4 KB | 64×64 × 1 byte per tile |
| Entity Layer | 4 KB | Same size as terrain |
| Collectibles Layer | 4 KB | Same size as terrain |
| Tile Definitions | ~10 KB | 256 tiles × ~40 bytes each |
| Animation Frames | ~4 KB | Compressed with reuse |
| **Total** | **~26 KB** | ~6% of available RAM |

### CPU Usage (Per Frame @ 30 FPS)
| Task | Cycles | % of Budget |
|------|--------|-------------|
| Tilemap Rendering | 18,000 | 0.23% |
| Entity Rendering | 10,000 | 0.13% |
| Collision Detection | 4,500 | 0.06% |
| Entity AI/Movement | 3,500 | 0.04% |
| Animation Updates | 1,750 | 0.02% |
| **Total** | **~48,000** | **~0.6%** |

**Conclusion**: Hardware is not the bottleneck. Focus on algorithm efficiency.

---

## Development Guidelines

### Code Style
- Use functional components (React hooks)
- Keep components under 300 lines
- Extract logic into custom hooks
- Use TypeScript for type safety (optional but recommended)

### State Management
- Global state: Zustand store
- Component state: `useState` / `useReducer`
- Derived state: `useMemo` / selectors

### Performance Optimization
- Use Canvas API for grid rendering (not DOM)
- Memoize expensive calculations (`React.memo`, `useMemo`)
- Debounce state updates during painting
- Lazy-load panels (React.lazy + Suspense)

### Testing Strategy
- Unit tests for models (Tile, Entity, Scene, Palette)
- Unit tests for utilities (color conversion, grid math)
- Integration tests for state actions
- Manual testing for UI interactions

### Git Workflow
- `main` branch: stable releases
- `develop` branch: active development
- Feature branches: `feature/tile-editor`, `feature/animation-system`
- Commit frequently with clear messages

---

## Getting Started

1. **Set up environment**: `npm install` in `dolkaraa-editor/`
2. **Start dev server**: `npm run dev`
3. **Build order**: Follow [BuildOrder.md](../BuildOrder.md)
4. **Reference**: Keep this spec open while coding

---

## Questions / TODOs

- [ ] Collectible size: 4×4 icon or 8×8 tile-sized? -> 8x8
- [ ] Should patrol path use absolute coords or relative deltas? -> relative deltas from the the cood where the entity was placed
- [ ] Audio format: WAV, MP3, or custom? -> will decide in future. should be efficient
- [ ] Export format: Single JSON blob or separate files? -> 2 jsons : metadata and then all the rest
- [ ] Backend API endpoint structure? -> not created
- [ ] Kafka topic naming convention? -> not created (future scope)

---

**Last Updated**: January 13, 2026  
**Version**: 1.0  
**Author**: Mohammad Hammad
