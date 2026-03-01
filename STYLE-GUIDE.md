# Dolkaraa Editor - Style Guide

Dark theme inspired by VS Code and IntelliJ Dracula mode.

---

## Table of Contents
1. [Color Palette](#color-palette)
2. [Panel Layout & Colors](#panel-layout--colors)
3. [Canvas & Grid](#canvas--grid)
4. [Typography](#typography)
5. [Spacing & Sizing](#spacing--sizing)
6. [Components](#components)
7. [DO's & DON'Ts](#dos--donts)

---

## Color Palette

### **Primary Colors**
```css
/* Actions & Highlights */
--color-primary: #4A90E2;        /* Blue - main actions */
--color-primary-hover: #357ABD;  /* Darker blue - hover */
--color-primary-active: #2C5AA0; /* Even darker - active/pressed */

/* Status Colors */
--color-success: #2ECC71;        /* Green - confirmations */
--color-warning: #F39C12;        /* Orange - cautions */
--color-danger: #E74C3C;         /* Red - destructive actions */

/* Text Colors */
--color-text-primary: #ECEFF1;   /* Main text - almost white */
--color-text-secondary: #B0BEC5; /* Secondary text - muted */
--color-text-muted: #78909C;     /* Tertiary text - very muted */
--color-text-disabled: #546E7A;  /* Disabled text */

/* Interactive States */
--color-border-focus: #4A90E2;   /* Same as primary for focus */
--color-border-normal: #37474F;  /* Dark border */
--color-border-hover: #455A64;   /* Slightly lighter border */
```

### **Background Colors - 6 Panels**
Each panel gets a subtle gradient with barely-perceptible color tinting. Think "pure black with a whisper of color" — the color is not obvious, but adds sophistication and helps differentiate panels.

```css
/* 1. SIDEBAR - Neutral anchor (pure black with subtle warmth) */
--bg-sidebar: linear-gradient(180deg, #1A1E23 0%, #1C1E26 100%);

/* 2. TILE AREA - Purple whisper (black with hint of purple) */
--bg-tile-area: linear-gradient(135deg, #1E1F26 0%, #1D212A 100%);

/* 3. SCENES MENU - Red whisper (black with hint of red) */
--bg-scenes-menu: linear-gradient(135deg, #1E2128 0%, #21201F 100%);

/* 4. CANVAS AREA - Slightly warmer (focal point, nearly same as sidebar) */
--bg-canvas: linear-gradient(135deg, #252A31 0%, #2B2F38 100%);

/* 5. CHARACTER AREA - Blue whisper (black with hint of blue) */
--bg-character-area: linear-gradient(135deg, #1E2128 0%, #1E212C 100%);

/* 6. INSPECTOR AREA - Cyan whisper (black with hint of cyan) */
--bg-inspector: linear-gradient(90deg, #1F2937 0%, #212230 100%);
```

### **Why Subtle Gradients?**
- **Barely noticeable** - color is more felt than seen
- **Professional appearance** - adds sophistication without being gamey
- **Clear differentiation** - subtle enough that it doesn't distract from content
- **Canvas is focal point** - slightly brighter, draws attention
- **Depth perception** - gradient creates subtle 3D effect
- **Reduces cognitive load** - easier to scan between sections without obvious colors shouting at you
- **Not jarring** - gradients feel natural, not "forced colors"

---

## Panel Layout & Colors

```
┌─────────────────────────────────────────────────────────────┐
│ SIDEBAR          TileArea    CANVAS                Inspector │
│ #1A1E23          #1E1F26     #252A31                #1F2937  │
│ ────────────────────────────────────────────────────────────│
│ [🏠] ┌─────────┐                                   ┌────────┐│
│ [🗂️] │ Tiles   │                                   │        ││
│ [💾] │ Grid    │      Tilemap/Entity Editor        │Insp.  ││
│ [📤] │ Preview │      (Main Canvas)                │Panel  ││
│ [⚙️] │         │      - Larger, lighter bg         │        ││
│ [❓] └─────────┘                                   │        ││
│      ┌─────────┐                                   │        ││
│      │ Scenes  │      ┌──────────────────────────┐│        ││
│      │ List    │      │  Character Area          ││        ││
│      │ +Add    │      │  Horizontal entity list  ││        ││
│      └─────────┘      └──────────────────────────┘└────────┘│
└─────────────────────────────────────────────────────────────┘
```

### **Panel Backgrounds Quick Reference**
| Panel | Gradient | Color Tint | Use For |
|-------|----------|-----------|----------|
| Sidebar | 180deg, top-bottom | Neutral | Icon navigation - anchor |
| Tile Area | 135deg, diagonal | Purple whisper | Tile grid preview |
| Scenes Menu | 135deg, diagonal | Red whisper | Scene list |
| Canvas | 135deg, diagonal | Warm neutral | Main editor - focal point |
| Character Area | 135deg, diagonal | Blue whisper | Entity preview list |
| Inspector | 90deg, left-right | Cyan whisper | Properties panel |

**Gradient Tips:**
- `180deg` = top to bottom (vertical)
- `135deg` = diagonal (top-left to bottom-right)
- `90deg` = left to right (horizontal)
- Use `90deg` for Inspector to create horizontal flow accent

---

## Canvas & Grid

### **Grid Lines - SAME COLOR FOR ALL GRIDS**

```css
/* Grid lines (both tileset preview AND canvas) */
--grid-color-major: #455A64;     /* Visible grid lines */
--grid-color-minor: #37474F;     /* Subtle dividers (if multi-level) */
--grid-color-hover: #546E7A;     /* Highlight on hover */

/* Canvas checkerboard (for transparency) */
--grid-checker-light: #2D3139;   /* Slightly lighter squares */
--grid-checker-dark: #23272E;    /* Slightly darker squares */
--grid-checker-opacity: 0.3;     /* Subtle pattern */
```

### **Why Same Grid Color?**
- **Consistency** - users recognize the grid pattern everywhere
- **Visual coherence** - ties tileset and canvas together
- **Less mental overhead** - only learn one grid appearance

### **Canvas Specifics**
```css
/* Tilemap/Canvas Background */
--bg-canvas: #252A31;            /* Lighter than panels to focus attention */

/* Pixel Editor Grid (when editing 8x8 or 16x16) */
--pixel-grid-color: #546E7A;     /* Slightly brighter for small grids */
--pixel-grid-thickness: 2px;     /* Visible borders between pixels */
```

### **Grid Opacity Guidelines**
- **Canvas grid**: 0.3-0.5 opacity (subtle)
- **Pixel editor grid**: 0.6-0.8 opacity (very visible, needs clarity)
- **Tileset preview grid**: 0.4 opacity (moderate visibility)

---

## Typography

### **Font Stack**
```css
/* UI Font */
--font-ui: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
           'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
font-family: var(--font-ui);

/* Monospace (for coordinates, values, hex codes) */
--font-mono: 'Fira Code', 'Consolas', 'Monaco', monospace;
```

### **Font Sizes & Weights**
```css
/* Headings */
--font-h1: 18px / 600;  /* Section titles in inspector */
--font-h2: 14px / 600;  /* Subsection titles */

/* Body Text */
--font-body: 13px / 400; /* Default UI text */
--font-small: 11px / 400; /* Hints, secondary labels */

/* Monospace */
--font-mono-body: 12px / 400; /* Code, coordinates, IDs */
```

---

## Spacing & Sizing

### **Base Unit: 4px**
All spacing derives from multiples of 4px.

```css
--spacing-xs: 4px;    /* Tight spacing, element internals */
--spacing-sm: 8px;    /* Small gaps between elements */
--spacing-md: 12px;   /* Default component spacing */
--spacing-lg: 16px;   /* Panel section spacing */
--spacing-xl: 24px;   /* Major sections */
--spacing-xxl: 32px;  /* Large gaps, panel margins */
```

### **Component Sizing**
```css
/* Buttons */
--btn-small-height: 28px;
--btn-medium-height: 36px;
--btn-large-height: 44px;

/* Input Fields */
--input-height: 32px;
--input-padding: 8px 12px;

/* Icons */
--icon-small: 16px;
--icon-medium: 20px;
--icon-large: 24px;
--icon-xlarge: 32px;

/* Grid */
--tile-preview-size: 40px;   /* In tileset preview */
--character-preview-size: 60px; /* In character area */
```

---

## Components

### **Canvas & Panels (Sharp Corners - No Rounding)**
```css
/* Main canvas and panels - sharp edges like Unity/VS Code */
.canvas-area,
.tile-area,
.scenes-menu,
.character-area,
.inspector-area {
  border-radius: 0px;  /* Sharp corners - professional tool style */
}

/* Tile grid - with spacing between items */
.tile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 40px);
  gap: 8px;  /* Space between tiles prevents visual sticking */
  padding: var(--spacing-md);
}

.tile-item {
  width: 40px;
  height: 40px;
  border-radius: 2px;  /* Minimal rounding for individual tiles */
  border: 1px solid var(--color-border-normal);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tile-item:hover {
  border-color: var(--color-primary);
  box-shadow: 0 0 6px rgba(74, 144, 226, 0.3);
}

.tile-item.selected {
  border-color: var(--color-primary);
  box-shadow: 0 0 8px rgba(74, 144, 226, 0.5);
  background: rgba(74, 144, 226, 0.1);
}

/* Character grid - with spacing */
.character-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 60px);
  gap: 12px;  /* More space for larger items */
  padding: var(--spacing-md);
}

.character-item {
  width: 60px;
  height: 60px;
  border-radius: 2px;  /* Minimal rounding */
  border: 1px solid var(--color-border-normal);
  cursor: pointer;
  transition: all 0.2s ease;
}

.character-item:hover {
  border-color: var(--color-primary);
  box-shadow: 0 0 6px rgba(74, 144, 226, 0.3);
}

.character-item.selected {
  border-color: var(--color-primary);
  box-shadow: 0 0 8px rgba(74, 144, 226, 0.5);
  background: rgba(74, 144, 226, 0.1);
}
```
```css
/* Primary Button - minimal border radius for professional look */
.btn-primary {
  background: var(--color-primary);      /* #4A90E2 */
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 2px;  /* Professional: minimal rounding */
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-hover); /* #357ABD */
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
}

.btn-primary:active:not(:disabled) {
  background: var(--color-primary-active); /* #2C5AA0 */
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(74, 144, 226, 0.2);
}

/* Secondary Button */
.btn-secondary {
  background: var(--bg-inspector);  /* #1F2937 - blend with panel */
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-normal);
  padding: 8px 16px;
  border-radius: 2px;  /* Professional: minimal rounding */
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-border-hover);
  color: var(--color-text-primary);
  border-color: var(--color-border-hover);
}
```

### **Input Fields (Professional, Minimal Rounding)**
```css
input[type="text"],
input[type="number"],
textarea,
select {
  background: var(--bg-sidebar);  /* #1A1E23 - slightly darker */
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-normal);
  border-radius: 2px;  /* Professional: minimal rounding */
  padding: 8px 12px;
  font-family: var(--font-ui);
  font-size: 13px;
  transition: border 0.2s ease;
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

input:disabled,
textarea:disabled {
  background: var(--color-border-normal);
  color: var(--color-text-disabled);
  cursor: not-allowed;
}
```

### **Scrollbars**
```css
/* Webkit browsers (Chrome, Safari, Edge) */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: var(--bg-inspector);
}

::-webkit-scrollbar-thumb {
  background: var(--color-border-normal);
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-border-hover);
}

::-webkit-scrollbar-thumb:active {
  background: var(--color-border-focus);
}
```

### **Sidebar Icons (VS Code Style - Icon-Only Highlight)**
Only the icon glows, NO background highlight. Hover effect is subtle (color + glow on icon only).

```css
.sidebar {
  width: 80px;
  display: flex;
  flex-direction: column;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--color-border-normal);
}

.sidebar-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: transparent;  /* NO background change on hover */
  border-left: 3px solid transparent;
  transition: border 0.2s ease;
  position: relative;
}

.sidebar-icon svg {
  width: 24px;
  height: 24px;
  color: var(--color-text-muted);
  transition: all 0.2s ease;
}

/* Hover: ONLY icon changes, NOT background */
.sidebar-icon:hover svg {
  color: var(--color-text-secondary);
  filter: drop-shadow(0 0 6px rgba(74, 144, 226, 0.2));
}

/* Active: left border + icon highlight */
.sidebar-icon.active {
  border-left-color: var(--color-primary);
}

.sidebar-icon.active svg {
  color: var(--color-primary);
  filter: drop-shadow(0 0 8px rgba(74, 144, 226, 0.4));
}

/* Tooltip on hover */
.sidebar-icon[title]:hover::after {
  content: attr(title);
  position: absolute;
  left: 90px;
  background: rgba(0, 0, 0, 0.95);
  color: var(--color-text-primary);
  padding: 6px 10px;
  border-radius: 2px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;
}
```

**How to use with React Icons:**
```jsx
import { FiHome, FiFolder, FiSave, FiDownload, FiSettings } from 'react-icons/fi';

export function Sidebar() {
  return (
    <aside className="sidebar">
      <button className="sidebar-icon" title="Dashboard">
        <FiHome />
      </button>
      <button className="sidebar-icon" title="Open Project">
        <FiFolder />
      </button>
      <button className="sidebar-icon" title="Save Project">
        <FiSave />
      </button>
      <button className="sidebar-icon" title="Export JSON">
        <FiDownload />
      </button>
      <button className="sidebar-icon" title="Settings">
        <FiSettings />
      </button>
    </aside>
  );
}
```

---

## DO's & DON'Ts

### **DO ✓**

- ✓ **Use the 6 background colors** - gives visual structure
- ✓ **Keep canvas background lighter** - focuses attention on content
- ✓ **Use grid lines with 0.3-0.5 opacity** - subtle, not distracting
- ✓ **Maintain 4px spacing base unit** - clean alignment
- ✓ **Use color consistently** - same meaning everywhere (blue = primary action)
- ✓ **Add hover/focus states** - essential for tool usability
- ✓ **Test contrast ratios** - text should be easily readable (WCAG AA minimum)
- ✓ **Keep animations fast** - 0.2s or less for interactions
- ✓ **Use box-shadows sparingly** - for focus indicators and depth only
- ✓ **Match VS Code colors** - users are familiar with them
- ✓ **Use 2px border radius** - professional, minimal rounding (not 4px)
- ✓ **Sharp corners for panels** - 0px border-radius like Unity/VS Code
- ✓ **Add gap to grids** - prevents tiles from appearing to stick together
- ✓ **Only highlight icon on sidebar** - no background, just glow effect

### **DON'T ✗**

- ✗ **Don't use pure white or pure black** - use near-white/near-black instead
- ✗ **Don't add too many background colors** - stick to the 6 defined ones
- ✗ **Don't use bright colors for body text** - reserve bright colors for interactive elements
- ✗ **Don't add unnecessary gradients** - flat design is cleaner for tools
- ✗ **Don't animate non-interactive elements** - only buttons, hovers, transitions
- ✗ **Don't use rounded corners >4px** - except modals (8px max)
- ✗ **Don't make grid lines too bright** - they should be subtle, not competing with content
- ✗ **Don't override focus indicators** - accessibility is critical
- ✗ **Don't use red/green for color-only coding** - colorblind accessibility
- ✗ **Don't make panels look identical** - subtle color differences help navigation
- ✗ **Don't ignore dark mode** - this is dark mode only, no light theme needed
- ✗ **Don't over-round corners** - 2px max for buttons, 0px for panels
- ✗ **Don't use large background highlights** - only icon glow on sidebar
- ✗ **Don't forget grid gaps** - spacing prevents visual stickiness

### **Accessibility Reminders**
- Text contrast: Minimum 4.5:1 ratio for normal text
- Focus indicators: Always visible (2px solid outline minimum)
- Color alone: Don't rely on color to convey information
- Icons: Always pair with text labels or clear tooltips

---

## Implementation Checklist

- [ ] Create `:root` CSS variables with this palette
- [ ] Apply background colors to each of 6 panels
- [ ] Style grid lines (canvas, tileset, pixel editor)
- [ ] Create button variants (primary, secondary, danger)
- [ ] Style input fields with focus states
- [ ] Create sidebar icon styles
- [ ] Add scrollbar styling
- [ ] Test contrast ratios
- [ ] Test on actual layout (ensure colors work in context)

---

## Example CSS Variables File

```css
:root {
  /* Primary Colors */
  --color-primary: #4A90E2;
  --color-primary-hover: #357ABD;
  --color-primary-active: #2C5AA0;
  --color-success: #2ECC71;
  --color-warning: #F39C12;
  --color-danger: #E74C3C;
  
  /* Text Colors */
  --color-text-primary: #ECEFF1;
  --color-text-secondary: #B0BEC5;
  --color-text-muted: #78909C;
  --color-text-disabled: #546E7A;
  
  /* Borders */
  --color-border-focus: #4A90E2;
  --color-border-normal: #37474F;
  --color-border-hover: #455A64;
  
  /* Backgrounds - 6 Panels (with subtle gradients) */
  --bg-sidebar: linear-gradient(180deg, #1A1E23 0%, #1C1E26 100%);
  --bg-tile-area: linear-gradient(135deg, #1E1F26 0%, #1D212A 100%);
  --bg-scenes-menu: linear-gradient(135deg, #1E2128 0%, #21201F 100%);
  --bg-canvas: linear-gradient(135deg, #252A31 0%, #2B2F38 100%);
  --bg-character-area: linear-gradient(135deg, #1E2128 0%, #1E212C 100%);
  --bg-inspector: linear-gradient(90deg, #1F2937 0%, #212230 100%);
  
  /* Grid Lines */
  --grid-color-major: #455A64;
  --grid-color-minor: #37474F;
  --grid-color-hover: #546E7A;
  --grid-checker-light: #2D3139;
  --grid-checker-dark: #23272E;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 24px;
  --spacing-xxl: 32px;
}
```

---

## References

- **VS Code Theme**: Based on default dark theme
- **Dracula Theme**: Inspiration for color choices
- **Accessibility**: WCAG 2.1 AA standards
- **Design System**: Inspired by professional tool UIs (Figma, Aseprite, IntelliJ)
