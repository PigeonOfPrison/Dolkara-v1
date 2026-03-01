// use a switch case for using the hardware type as the case

// Tilemap constraints
export const TILE_SIZE = 8; // 8x8 pixels
export const COLLECTIBLE_SIZE = 8;
export const CHARACTER_SIZE = 16; // 16x16 pixels
export const MAX_TILEMAP_WIDTH = 64;
export const MAX_TILEMAP_HEIGHT = 64;

// Scene constraints
export const MAX_TILES_PER_SCENE = 256;
export const MAX_ENTITIES_PER_SCENE = 32;
export const MAX_COLLECTIBLES = 64;
export const MAX_PALETTE_COLOURS = 30; // 5 columns × 6 rows - all usable colors 0-29
export const MAX_HEALTH = 65535;
export const MAX_SPEED = 255;
export const MAX_DAMAGE = 255;
export const MAX_LAYERS = 4;

// Navigation constraints
export const MAX_EXITS = 8;
export const MAX_SPAWN_POINTS = 8;
export const MAX_PATROL_WAYPOINTS = 32;
export const MAX_ENTITY_MOVES = 8

// Animation constraints
export const MAX_ANIMATION_FRAMES = 256; // for ALL the entitites combined***
export const MAX_ANIMATION_FRAMES_PER_ANIMATION = 8; // Max frames per individual animation
export const MAX_FPS = 30;

// Game state
export const MAX_CURRENCY = 4294967295; // 32-bit unsigned max
export const INVENTORY_SLOTS = 64; // 8 bytes = 64 bits