# Down-scaled version of the game editor

I have reduced all the unnecessary things from the current project since they were making the project something that it wasn't supposed to be : a freaking complete editor.

The idea is as follows : 

- This is going to be a level editor for games that will run on an esp32
- The user will be able to design levels using 8x8 tiles and characters(16x16 ?)
- There will be a seperate engine on the esp32 to run the games
- Due to harware limitations, everything will be extremely opinioated, so much so that there will be only a set genre of games (starting : platformer then maybe top-down).
- there will be a limit on the number tilemap size (64 x 64?) and the number of characters (including enemies).
- the editor will generate a json for the metadata and the scenes/levels and push it on kafka stream.
- the backend will first validate the json, then create valid .cpp and .h files.
- this will be packed in a .pack file my platform.io and then either put in a sd card or flashed on the 4mb memory of the esp32, without disturbing the engine already on it.

## More Technical Details 

- there will only be 16 colours allowed per scene, called the palette.
- Editor will follow the srgb scheme but it will be converted to rgb565 in backend.
- 16 because their index can be represented in 4 bits.
- the pixel array will be made up the indices of the colours in the palette array
-since each pixel only requires 4 bits, 2 pixels will be packed per byte (1 byte = 8 bits is the smallest data that can be worked upon in most languages).
- thus we will use 4bpp -> 4 bits per pixel. This will reduce the size of each scene.
- The pixels arrays will be 1D -> i-th row = from (8 x i) till (8 x i + 7) 
- same for characters (but with 16 of course)
- The pixels mentioned here are logical pixels. Physical pixels will be a lot smaller and 8x8 will be nothing. Thus, physical_pixel = 20 x logical pixel (both length and breadth).
- The same factor cannot work with characters, since this will make a 16x16 character equal to 4 tiles. Thus for char : physical_pixel = 10 logical pixel 
- the characters (both player and enemy) will have a set number of attacks onl
(like melee, ranged, lobbed, anything else??).
- there will be a bullet pool (necessary for effeciency?).
-enemies can have a patrol path. It will be executed as a loop, thus it should loop for no glitches.
- Since the path will be continous, the x and y value with only increment or decrement. Thus we will use 2 bits for each axis -> 4 combinations : NC, inc, dec, shoot mov 1,2; 
- scenes can be connected to other scenes. There will be a seperate arrays for entry/spawn and exit points. 
- since the scene also uses the index of the tiles, they too will need an array. same with the character.
- ** This point only follows for when there is a separate bg layer [future update]**
(indexing for the char will be a bit spl. char_idx = idx - 224; 
This is because we need to index both the tiles and the char in 8 bits, thus we only have 256 index numbers. 224 will be uses by tiles, and the rest 32 for the characters. We cannot store both tiles and characters in the same array since there structure is different (thus, the char_idx formula)).
- Structs will be used for both tiles and the characters. More efficient than classes. (thus we need to create an array of structs???)

## Hardware Limits 

- Max Tilemap size: 64x64
- Max unique tiles per scene/level : 256 (add the decorative bg to this only)
- Max entities per scene : 32 (esp can't handle so many moving char.)
- Max patrol waypoints : 32
- Max exits: 8
- Max entrances/spawn points: 8
- Max unique collectible items: 64 (keys, etc)
- Max currency: 32bit unsigned (0 to 4.2 billion)
- tilemap layers: 1 (perhaps 2 in future update)


## Things To Think About:

- Inventory: Perhaps a 8 Byte flag system -> 8 x 8 = 64 items : in metadata
- currency field in meta data
- Bg layers: 2 for parallax: We will need to just put another nested json tilemap1
- Moving player to the metadata.
- adding a 2d array for pixels : for each animation sprite
- perhaps the above acts as a table and there is another entry in the json : animations, that references these "frames". attacking will be more interesting. Merging them into a table will also result in being able to reuse the frames (for common enemies).
- another value in json : fps


## Expected JSON Output 

the output json should look something like this : 

### metadata json

```json

{
  "gameId": "esp32-retro-demo",
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

  "startScene": "level_1",

  "scenes": [
    {
      "id": "level_1",
      "file": "scene_level_1.json"
    }, 
    {
      "id": "level_2",
      "file": "scene_level_2.json"
    }
  ],

  "build": {
    "optimize": "size",
    "profile": "release"
  },

  "playerState": {
    "currency": 1250,
    "inventory": "0x0000000000000001",
    "health": 80,
    "currentScene": 3
  }
}
```


### scene json

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
      { "index": 3, "rgb": "#8B4513" },  //... till 15
    ]
  },

  "tiles": [
    { 
        "id": 0, 
        "name": "empty",
        "tag": "ground",   // limited tags : ground, hazard, decor, etc (perhaps create a table for this too and add to the metadata)
        "solid": false,
        "dmg": 0,
        "health": -1      // for unbreakable??
        "opacity": 255    // 0 - opaque && 255 - transparent
        "collectValue": 0   // for currency etc. 0 mean not collectible
        "pixels": [0, 0, 0, 1, 1, 1, 15]  // 64 pixels
    },
    {
        "id": 1,
        "name": "ground", 
        "solid": true
        "pixels": [1, 1, 2, 2]
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
    "pixels": [/* 16 values */]
  },
  { 
    "id": 2, 
    "name": "Health Potion", 
    "healAmount": 20,
    "pixels": [/* 16 values */]
  }
]

  "layers": {
    // terrain contains tile/char id/index only
    "terrain": [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
      [0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0]
    ],
    "entities": [
      [0, 0, 1, 0, 0, 0],  // 16x16
      [0, 0, 1, 0, 0, 0],  // Player at (2,0)
      [0, 2, 0, 0, 0, 0]   // Slime at (1,1)
    ],
    "collectibles": [
      [0, 0, 1, 0, 0, 0],   // 8x8
      [0, 0, 1, 0, 0, 0],  // Coin at (2,0) - same position as player!
      [0, 0, 0, 2, 0, 0]   // Ruby at (3,1), 0 means nothing at thaat location
    ]
  },

  "characterFrames": [
    { "id": 0, "pixels": [/* 256 values */] },
    // ... pool of all frames
  ],

  "entities": [
    {
      "name": "Player",
      //"pixels": [0,0,1,1,2,2,3,3, ...],   // 256 values (16 x 16)
      "tag": "player",  // player, enemy, collectibles
      "health": 100,
      "damage": 10,
      "speed": 5,
      "canJump": true,
      "movesetIndex": 0,
      "animations": {
        "idle": { "frameIds": [10, 11], "fps": 6, "loop": true },
        "walk": { "frameIds": [12, 13], "fps": 8, "loop": true },
        "attack": { "frameIds": [14, 15], "fps": 10, "loop": false }
      },
      "defaultAnimation": "idle"
    },
    {
      "name": "Slime Enemy",
      // no need, every frame in the animation will use the character-frame table
      //"pixels": [8,8,9,9,10,10,11,11, ...],
      "tag": "enemy",
      "health": 20,
      "damage": 5,
      "speed": 2,
      "dropCurrency": 500
      "dropChance": 30  // 30 percent
      "canJump": false,
      "movesetIndex": 1,
      "patrolPath": [
        {00, 11},  // (x, y) (spl move) // 2 bits for x and 2 for y
        {01, 10},  // (x + 1, y - 1)
        {10, 01},  // (x - 1, y + 1)
        {11, 00}   // (x, y) (spl move 2)
      ],
      "animations": {
        "idle": { "frameIds": [10, 11], "fps": 6, "loop": true },
        "walk": { "frameIds": [12, 13], "fps": 8, "loop": true },
        "attack": { "frameIds": [14, 15], "fps": 10, "loop": false }
      },
      "defaultAnimation": "idle"
    }
  ],

  "spawnPoints": [
    {
      "id": "main_entrance",
      "x": 5,
      "y": 10,
    },
    {
      "id": "secret_door",
      "x": 30,
      "y": 5,
    },
    {
      "id": "default",   // Fallback if exit reference is broken
      "x": 2,
      "y": 15,
    }
  ],

  "exits": [
    {
      "x": 63,
      "y": 10,
      "width": 1,
      "height": 3,
      "targetScene": "level_2",
      "targetSpawn": "main_entrance",
      "requirement": "no"  // or an item index for locked doors
    },
    {
      "x": 0,
      "y": 10,
      "width": 1,
      "height": 3,
      "targetScene": "level_1_secret",
      "targetSpawn": "cave",
      "requirement": 3  // reference to the 64 bit/ 8 byte inventory
    }
  ]
}
```


## General Idea 

- the game is broken into a number of scenes

- each scene has its own colour palette, characters and tiles

- the tiles are 8x8 and thus have 64 pixels turned into a 1D array

- the pixel array uses the index of the colours in the colour palette

- the user 


## Character Animations (Yet To Be Implemented)

### Structure
- **Both player and enemies** have animation sequences
- Each animation = sequence of frames (16×16 sprites)
- Frames stored in shared pool per scene (reusable across entities)
- Entities reference frames by ID

### Player Animations (Complex)
- Idle: 2 frames (breathing)
- Walk: 4 frames (full walk cycle)
- Jump: 1-2 frames
- Attack: 2-3 frames
- Total: ~10 frames = 1.3 KB

### Enemy Animations (Simplified)
- Idle: 2 frames (breathing/bobbing)
- Walk/Patrol: 2 frames (simple movement)
- Attack: 1-2 frames (wind-up)
- Total: ~5 frames = 640 bytes per enemy type

### Storage Impact
- Player: 1.3 KB (if not in metadata)
- 3 enemy types × 640 bytes = 1.9 KB
- Multiple enemies of same type reuse frames
- Total per scene: ~3-4 KB for all animations

### JSON Schema

```json
"characterFrames": [
  { "id": 0, "pixels": [/* 256 values */] },
  // ... pool of all frames
],

"entities": [
  {
    "name": "Slime Enemy",
    "animations": {
      "idle": { "frameIds": [10, 11], "fps": 6, "loop": true },
      "walk": { "frameIds": [12, 13], "fps": 8, "loop": true },
      "attack": { "frameIds": [14], "fps": 10, "loop": false }
    },
    "defaultAnimation": "idle"
  }
]
```


## Layout 

- the screen will be divided into 5 columns and 5 (or 4) rows

- the left most column will be for the tile palette and the right most for the inspector/properties. The remaining 3 for the canvas.\

- the left most column will be further divided : the bottom row will be occupied by the scene selection.

- the bottom row will be for the the character. user can select the character including enemies and place them in specific grid boxes.

- the rest of the 4 (or 3) rows are for the canvas 

- Thus, to summarize : out of all 5 columns, complete left column for tiles(3 rows) and scenes(next 2 rows), 
complete right column for the inspector, for the row, complete bottom row for the character/animation.



## The Components 

The main components are : (tile set), (canvas/grid), (character set), (scene menu), (inspector)
Since the inspector will change along with other components, each of its aspect will be discussed with the respective component


### tile set

- contains a grid with all the created tiles

- left click on the tile to pick it up to colour

- right click on any empty grid to create new tile.

- details of the tile will be visible in the inspector. Options like edit, delete are here.

- when creating new tile, colour palette will be in the instructor

- deciding the 16 colours for the palette will also be here. need to right click the tile set (or this will be with the scene).

- tile properties will also be here, like : 
    > boolean solid (y for platform, n for background), 
    > int dmg (eg lava?), 
    > int health (for breakable?) etc.
    > tag (like ground, hazard, decor, collectible)

- filter option based on tile tag 


### canvas / grid

- main area of drawing 

- default display -> tilemap where level is being drawn

- when new tile or new character is being created -> switch to 8x8 / 16x16 grid for them specifically, otherwise, size will be what the user chose in the scene inspector (max 64x64)

- for collectibles, inspector will have : 
Name (editable)
Value (currency amount)
Heal amount (if health item)
Inventory slot (if key/special item)

- left click to place a tile/ character

- right click to delete

- inspector will have the option to modify the dimensions (eg x = 64, y = 20 grid boxes)

- when a tile / character is being placed, they will be grid snapping.

- prefixed zoom options (50%, 100%, 200%) [future update]

- undo-redo options [future update]

- minimap [future update]

- flood-fill[future update]

- anything else

### Character set

- set of player and enemies

- use is same as tile set : selection, creation, deletion ,etc (maybe merge them?)

- inspector will have : health, dmg, speed, jump(?), set of moves (predefined pool) -> main char.

- for monsters, inspector will also have a button to start record the patrol path. when selected, can move the enemy using WASD. path will only complete after the char returns to starting pos. Store the tiles traveled in array. repeats it.

- Can also let the user select the path with mouse and then create a simple path with all the selected points. (all points should connect to each other in some for (8 direction movement??))

- Wait duration at each waypoint

- enemy can aim in the general direction as player(?) follow them (?) -> maybe just choose the enemy type and based on index, game engine will have different movesets. (advance)

- Another tab for animations.

- something like a timeline where user can create and place different sprites for animations

- frame duplication for for symmetrical sprites

- another table for all the animation sprites. Nested animation json will have following elements : idle, walk, attack, death.

- each animation will use sprite index from the sprite table (max 256 - for all characters)


### Scene menu 

- simple list of all scenes

- option to add new scene. (name or just numbers?)

- inspector will have the option to choose the 16 colours for the palette.

- inspector will have the editable list of tiles that act transitions between scenes. (name, location (bottom left corner?), destination, length, width). 
This is so that scenes are decoupled.

- nothing else? (perhaps music selection?)


## Inspector Behavior

### When Tile Selected:
- Tile name (editable)
- Solid checkbox
- Damage input (0-255)
- Health input (-1 = unbreakable)
- Opacity slider (0-255)
- Collectible checkbox
- Collect value (if collectible)
- [Edit Pixels] button → switches canvas to 8×8 tile editor
- [Delete Tile] button

### When Character Selected:
- Character name
- Health, Damage, Speed inputs
- Can Jump checkbox
- Moveset dropdown (predefined pool)
- [Edit Pixels] button → switches canvas to 16×16 char editor
- Drop currency, drop chance (if enemy)
- [Record Patrol Path] button (if enemy)

### When Scene Selected:
- Scene name
- Tilemap dimensions (width, height)
- [Edit Palette] button → color picker for 16 colors
- Spawn points list (add/remove)
- Exits list (add/remove/edit)

### When Exit/Spawn Selected:
- Position (x, y)
- Size (width, height) for exits
- Target scene dropdown
- Target spawn dropdown
- Requirement dropdown (0 = none, 1-64 = items)

## Future Targets

- audio systems ***

- multiple bg layers (for parallax) ***

- haptic feedback ***

- boss battles ***

- import/export tile set, character set ***

- particle system (another table) [preset]**

- scene graph connector tab with red connecting lines showing broken entry/exit references and quick navigation. **

- playtest **

- dual core usage (0-> for tiles etc, 1-> physics, ai) **

- memory usage indicator

- Auto tiling

- prefabs

- store to sell art, levels, games etc.

- collab features

- different max values for different microcontrollers

- animated tiles

- advanced ai behaviour : 
(just decide the observation range in the editor, smart enemies will be preset)
State machines: Idle → Alert → Chase → Attack → Flee
Vision cones: Enemies detect player in line-of-sight
Pathfinding: A* algorithm for smart navigation (limit to 32 nodes)
Group behaviors: Enemies call for backup, coordinate attacks
CPU cost: ~2,000 cycles per smart enemy = 20,000 total (0.25%)

- weather effects

- crafting system

- other game modes

- quest dialog system

- physics system

- procedural generation

- local coop (esp32 have a built in wifi/ wireless connectivity)

- leaderboards, etc

## Hardware Performance Summary

### RAM Usage (Per Scene)
- **Terrain layer**: 4 KB
- **Entities layer**: 4 KB  
- **Collectibles layer**: 4 KB
- **Tile/Character definitions**: ~10 KB
- **Animation frames**: ~4 KB
- **Total per scene**: ~26 KB

**ESP32 Available RAM**: 420 KB (after system overhead)  
**Scenes that fit simultaneously**: ~16 scenes

---

### CPU Usage (Per Frame @ 30 FPS)

| Task | Cycles | % of Budget |
|------|--------|-------------|
| Tilemap Rendering | 18,000 | 0.23% |
| Entity Rendering | 10,000 | 0.13% |
| Collision Detection | 4,500 | 0.06% |
| Entity AI/Movement | 3,500 | 0.04% |
| Animation Updates | 1,750 | 0.02% |
| Input Handling | 150 | 0.002% |
| Display Transfer (DMA) | 10,000 | 0.13% |
| **TOTAL** | **~48,000** | **~0.6%** |

**Frame budget**: 8 million cycles  
**CPU headroom**: 99%+ available

---

### Key Bottlenecks to Avoid
1. **Naive collision algorithms** (O(n²)) - Use spatial partitioning instead
2. **Blocking SPI transfers** - Use DMA for display updates
3. **Floating-point math** - Use fixed-point integers (100× faster)

---

### Conclusion
- **RAM**: Not a constraint (26 KB/scene, 420 KB available)
- **CPU**: Massive overhead (99%+ unused with optimized code)
- **Limiting factors**: Algorithm efficiency, not raw hardware specs
- **Scene splitting**: Not necessary for 64×64 tilemaps
