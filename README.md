# Dolkaraa Editor

A desktop-native level editor for designing retro-style 2D games that run on microcontrollers. Built with React and Tauri — opinionated by hardware, but configurable by design.

---

## What It Does

Dolkaraa Editor gives you a full game-authoring workflow within the constraints of embedded hardware:

- **Draw tiles** pixel by pixel on an 8×8 grid using a 16-colour scene palette
- **Paint tilemaps** up to 64×64 tiles on a canvas with grid snapping
- **Design enemies** with stats, movesets, looping patrol paths, and animation sequences
- **Manage scenes** with typed spawn points, exits, and scene-to-scene navigation requirements
- **Export JSON** — a metadata file and per-scene files — ready for a backend pipeline that generates C++ source files and compiles them for the target device via PlatformIO

---

## Target Hardware (Default: ESP32)

The editor ships pre-configured for the ESP32 microcontroller, which imposes strict limits that shape every design decision:

| Constraint | Default Value | Notes |
|---|---|---|
| Palette colours per scene | 16 | Indexed at 4 bits per pixel |
| Tile size | 8 × 8 px | 64 pixels → 32 bytes at 4bpp |
| Character size | 16 × 16 px | 256 pixels → 128 bytes at 4bpp |
| Max tilemap | 64 × 64 tiles | 4 KB per layer |
| Max unique tiles per scene | 256 | |
| Max entities per scene | 32 | |
| Max patrol waypoints | 32 per enemy | |
| Max spawn points | 8 | |
| Max exits | 8 | |
| Max collectible types | 64 | |
| Max animation frames (shared pool) | 256 | Reusable across entities |
| Inventory | 64 slots | 8-byte bitfield |
| Currency | 0 – 4,294,967,295 | 32-bit unsigned |

> **These limits are not hardcoded.** They are centralised in `src/constants/hardwareLimits.js`. As more target devices are supported in the future, profiles with different constraints can be swapped in without touching the rest of the codebase.

---

## Graphics System

- **Colour model**: sRGB in the editor → RGB565 on device (conversion handled by the backend)
- **Pixel encoding**: 4bpp — 2 pixels packed per byte, stored as 1D arrays
- **Tile pixels**: index into the scene's 16-colour palette
- **Physical scale**: tiles render at 20× (logical pixel = 20 physical px); characters at 10×

---

## Export Pipeline

```
Dolkaraa Editor
  ↓  metadata.json + scene_*.json
Kafka Stream
  ↓  Validate
Backend Service
  ↓  Generate .cpp / .h files
PlatformIO
  ↓  Compile → .pack
ESP32 Flash / SD Card
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 19 |
| Build tool | Vite |
| Desktop shell | Tauri v2 (Rust) |
| State management | Zustand |
| Rendering | HTML5 Canvas API |
| File I/O | Tauri FS + Dialog plugins |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://www.rust-lang.org/tools/install) (stable toolchain)
- [Tauri prerequisites](https://tauri.app/start/prerequisites/) for your OS

### Development

```bash
# Install dependencies
npm install

# Start dev server (hot reload)
npm run tauri:dev
```

### Production Build

```bash
npm run tauri build
```

Outputs:
- `src-tauri/target/release/bundle/nsis/` — Windows installer (`.exe`)
- `src-tauri/target/release/bundle/msi/` — Windows MSI package

> Cross-platform builds (macOS `.dmg`, Linux `.AppImage`) require running the build command on the respective OS. Use a CI matrix (e.g. GitHub Actions) for multi-platform distribution.

---

## Project Structure

```
src/
  components/       # Reusable UI components
  constants/        # Hardware limit profiles ← change device constraints here
  css/              # Scoped stylesheets
  Layout/           # Panel layout wrappers
  model/            # Data models (Scene, Tile, Entity, Palette, …)
  panels/           # Feature panels (TileSet, Canvas, AnimationEditor, …)
  state/            # Zustand store + slices + actions
  utils/            # Colour conversion, grid math, file I/O, export
src-tauri/          # Rust backend (Tauri)
```

---

## Roadmap

- [ ] Undo / redo
- [ ] Zoom controls
- [ ] Flood fill
- [ ] Audio system
- [ ] Parallax background layers
- [ ] Playtest mode (run game in editor)
- [ ] Scene graph visualiser
- [ ] Import / export tile and character sets
- [ ] Multiple device profiles (configurable hardware limits)
- [ ] Particle system (presets)
- [ ] Animated tiles
- [ ] Marketplace for assets, levels, and games

---

## Author

**Mohammad Hammad**  
Version 0.1.0 — March 2026
