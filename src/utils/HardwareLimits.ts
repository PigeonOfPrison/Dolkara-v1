// use a switch case for using the hardware type as the case

// Tilemap constraints
export const TILE_SIZE : number = 8; // 8x8 pixels
export const COLLECTIBLE_SIZE : number = 8;
export const CHARACTER_SIZE : number = 16; // 16x16 pixels
export const MAX_TILEMAP_WIDTH : number = 64;
export const MAX_TILEMAP_HEIGHT : number = 64;

// Scene constraints
export const MAX_SCENES : number = 256;
export const MAX_TILES_PER_SCENE : number = 256;
export const MAX_CHARACTERS_PER_SCENE : number = 32;
export const MAX_COLLECTIBLES : number = 64;
export const MAX_PALETTE_COLOURS : number = 30; // 5 columns × 6 rows - all usable colors 0-29
export const MAX_HEALTH : number = 65535;
export const MAX_SPEED : number = 255;
export const MAX_DAMAGE : number = 255;
export const MAX_LAYERS : number = 4;

// Navigation constraints
export const MAX_EXITS : number = 8;
export const MAX_SPAWN_POINTS : number = 8;
export const MAX_PATROL_WAYPOINTS : number = 32;
export const MAX_ENTITY_MOVES : number = 8

// Animation constraints
export const MAX_ANIMATION_FRAMES : number = 256; // for ALL the entitites combined***
export const MAX_ANIMATION_FRAMES_PER_ANIMATION : number = 8; // Max frames per individual animation
export const MAX_FPS : number = 30;

// Game state
export const MAX_CURRENCY : number = 4294967295; // 32-bit unsigned max
export const INVENTORY_SLOTS : number = 64; // 8 bytes = 64 bits
export const MAX_STACK_SIZE : number = 255; // Max stack size for stackable collectibles (eg. coins, arrows, etc.) - 1 byte max