import { MAX_ENTITIES_PER_SCENE, MAX_EXITS, MAX_TILES_PER_SCENE, MAX_COLLECTIBLES, MAX_LAYERS } from "../constants/hardwareLimits";
import Collectible from "./Collectible";
import Entity from "./Entity";
import Palette from "./Palette";
import Tile from "./Tile";


class Scene {
    constructor(id, name = "Scene_", width = 32, height = 12) {
        this.id = id;
        // Only concatenate if name looks like a base name (ends with _ or is default)
        this.name = (name.endsWith('_') || name === 'Scene_') ? name + id : name;
        this.width = width;                 // tilemap width
        this.height = height;               // tilemap height
        this.layers = MAX_LAYERS;
        
        // Color management
        this.palette = new Palette();
        
        // Asset pools
        this.tiles = [];                    // Array of Tile objects
        this.entities = [];                 // Array of Entity objects
        this.collectibles = [];             // Array of collectible definitions
        this.characterFrames = [];          // Array of 16x16 pixel arrays (256 values each)
        
        // Layers
        // terrainLayers is 3D: [layer][y][x] - layers 0 to (MAX_LAYERS - 3)
        this.terrainLayers = this.createEmpty3DTerrainLayers(this.layers - 2, width, height);
        this.entityLayer = this.createEmptyLayer(width, height);        // 2D layer
        this.collectibleLayer = this.createEmptyLayer(width, height);   // 2D layer
        
        // Navigation
        this.spawnPoints = [
        { name: "default", x: 0, y: 0 }
        ];
        this.exits = [];
    }

    createEmptyLayer(width, height) {
        return new Array(height).fill(null).map(() => new Array(width).fill(-1));
    }

    createEmpty3DTerrainLayers(numLayers, width, height) {
        return new Array(numLayers).fill(null).map(() => 
            new Array(height).fill(null).map(() => new Array(width).fill(-1))
        );
    }

    // pallete functions
    getPalette() {
        return this.palette;
    }
    
    // Set entire palette (useful for importing)
    setPalette(palette) {
        if (!(palette instanceof Palette))
            throw new Error('Must be a Palette instance');
        this.palette = palette;
    }
    
    // Quick access to set a color
    setPaletteColor(index, hexColor) {
        this.palette.setColour(index, hexColor);
    }
    
    // Quick access to get a color
    getPaletteColor(index) {
        return this.palette.getColour(index);
    }
    
    // Reset to default palette
    resetPalette() {
        this.palette = new Palette();
    }

    getTileAt(x, y, layer = 0) {
        if(x < 0 || x >= this.width || y < 0 || y >= this.height)
            throw new Error(`Invalid indices`);
        if(layer < 0 || layer >= this.terrainLayers.length)
            throw new Error(`Invalid layer index: ${layer}`);

        const tileId = this.terrainLayers[layer][y][x];
        if (tileId === -1) return null; // Empty cell
        return this.tiles[tileId];
    }
    
    setTileAt(x, y, tileIndex, layer = 0) { 
        if(x < 0 || x >= this.width  || y < 0 || y >= this.height)
            throw new Error(`Invalid indices`);
        if(layer < 0 || layer >= this.terrainLayers.length)
            throw new Error(`Invalid layer index: ${layer}`);
        if(tileIndex >= MAX_TILES_PER_SCENE)
            throw new Error(`Invalid tileIndex. Must be in between: 0-${MAX_TILES_PER_SCENE - 1}`);

        this.terrainLayers[layer][y][x] = tileIndex;
    }

    getEntityAt(x, y) {
        if(x < 0 || x >= this.width  || y < 0 || y >= this.height)
            throw new Error(`Invalid indices`);

        const entityId = this.entityLayer[y][x];
        if (entityId === -1) return null; // Empty cell
        return this.entities[entityId];
    }
    setEntityAt(x, y, entityIndex) { 
        if(x < 0 || x >= this.width  || y < 0 || y >= this.height)
            throw new Error(`Invalid indices`);
        if(entityIndex >= MAX_ENTITIES_PER_SCENE)
            throw new Error(`Invalid indices`);
        
        this.entityLayer[y][x] = entityIndex;
    }

    getCollectibleAt(x, y) {
        if(x < 0 || x >= this.width || y < 0 || y >= this.height)
            throw new Error(`Invalid indices`);

        const collectibleId = this.collectibleLayer[y][x];
        if (collectibleId === -1) return null; // Empty cell
        return this.collectibles[collectibleId];
    }

    setCollectibleAt(x, y, collectibleIndex) {
        if(x < 0 || x >= this.width || y < 0 || y >= this.height)
            throw new Error(`Invalid indices`);
        if(collectibleIndex >= MAX_COLLECTIBLES)
            throw new Error(`Invalid collectibleIndex. Must be in between: 0-${MAX_COLLECTIBLES - 1}`);
        
        this.collectibleLayer[y][x] = collectibleIndex;
    }
    
    addTile(tile) { 
        if(!(tile instanceof Tile)) 
            throw new Error(`This is not a tile. Cannot be inserted into the TileSet`);

        this.tiles.push(tile);
    }
    deleteTile(index) {
        if(index < 0 || index >= this.tiles.length)
            throw new Error(`The index in invalid, must be in between 0-${this.tiles.length - 1}`);

        // deleting the tile from the tileset
        // will move all the elements after to the left by one
        this.tiles.splice(index, 1);

        // decrementing the indices for the tiles ahead
        for(let i = index; i < this.tiles.length; i++) {
            this.tiles[i].id = i;
        }

        // we need to delete the tile from all terrain layers too
        for(const layer of this.terrainLayers) {
            this.deleteFromLayer(layer, index);
        }
    }

    addEntity(entity) { 
        if(!(entity instanceof Entity))
            throw new Error(`This is not an entity. Cannot be inserted into the entityset`);
        
        this.entities.push(entity);
    }
    deleteEntity(index) {
        if(index < 0 || index >= this.entities.length)
            throw new Error(`The index in invalid, must be in between 0-${this.entities.length - 1}`);

        // Update IDs of remaining entities to match their new array indices
        for(let i = index; i < this.entities.length; i++) {
            this.entities[i].id = i;
        }

        // deleting the entity from the entityset
        // will move all the elements after to the left by one
        this.entities.splice(index, 1);

        // we need to delete the entity from the entitylayer too
        this.deleteFromLayer(layer, index);
    }

    addCollectible(collectible) {
        if(!(collectible instanceof Collectible))
            throw new Error(`This is not a collectible. Cannot be inserted into the collectible set`);
        
        this.collectibles.push(collectible);
    }

    deleteCollectible(index) {
        if(index < 0 || index >= this.collectibles.length)
            throw new Error(`The index is invalid, must be in between 0-${this.collectibles.length - 1}`);

        // Remove from collectibles array
        this.collectibles.splice(index, 1);
        
        // Update IDs of remaining collectibles to match their new array indices
        for(let i = index; i < this.collectibles.length; i++) {
            this.collectibles[i].id = i;
        }

        // Remove from collectible layer
        this.deleteFromLayer(this.collectibleLayer, index);
    }

    deleteFromLayer(layer, index) {
        for(let y = 0; y < this.height; y++) {
            for(let x = 0; x < this.width; x++) {
                if(layer[y][x] === index)
                    layer[y][x] = -1;
                
                // since deleting the tile from the tileset 
                // will decrement the index of all the tiles greater that this index
                else if(layer[y][x] > index)
                    layer[y][x]--;
            }
        }
    }

    addSpawnPoint(name, x, y) { 
        if(x < 0 || x >= this.width || y < 0 || y >= this.height)
            throw new Error(`Invalid indices`);
        this.spawnPoints.push({name, x, y}); 
    }
    deleteSpawnPoint(name) {
        if(this.name === "default")
            throw new Error(`Connot delete default spawn point. Only update the coordinates`);
        
        const index = this.spawnPoints.findIndex(sp => sp.name === name);

        if(index === -1) 
            throw new Error(`Spawn Point "${name}" not found`);

        this.spawnPoints.splice(index, 1);
    }

    addExit(options) { 
        const { name, x, y, targetScene, targetSpawn, requirement, width = 1, height = 1 } = options;
        
        if(this.exits.length >= MAX_EXITS)
            throw new Error(`Max exit number (${MAX_EXITS}) reached. Delete others to create a new one`);

        this.exits.push({ name, x, y, width, height, targetScene, targetSpawn, requirement });
     }
    deleteExitByIndex(index) {
        if (index < 0 || index >= this.exits.length)
            throw new Error(`Invalid exit index: ${index}`);
        this.exits.splice(index, 1);
    }
    deleteExitByName(name) {
        const index = this.exits.findIndex(exit => exit.name === name);

        this.deleteExitByIndex(index);
    }
    
    resize(newWidth, newHeight) { 
        /* recreate layers */ 
        const newTerrain = this.createEmptyLayer(newWidth, newHeight);
        const newEntity = this.createEmptyLayer(newWidth, newHeight);
        const newCollectible = this.createEmptyLayer(newWidth, newHeight);
        
        // Copy existing data
        const copyWidth = Math.min(this.width, newWidth);
        const copyHeight = Math.min(this.height, newHeight);
        
        for (let y = 0; y < copyHeight; y++) {
            for (let x = 0; x < copyWidth; x++) {
                newTerrain[y][x] = this.terrainLayer[y][x];
                newEntity[y][x] = this.entityLayer[y][x];
                newCollectible[y][x] = this.collectibleLayer[y][x];
            }
        }
        
        this.terrainLayer = newTerrain;
        this.entityLayer = newEntity;
        this.collectibleLayer = newCollectible;
        this.width = newWidth;
        this.height = newHeight;
    }

    clone() {
        const scene = new Scene(this.id, this.name, this.width, this.height);


        scene.palette = this.palette.clone();
        scene.tiles = this.tiles.map(t => t.clone());
        scene.entities = this.entities.map(e => e.clone());
        scene.collectibles = [...this.collectibles];
        scene.characterFrames = this.characterFrames.map(f => [...f]);
        scene.terrainLayer = this.terrainLayer.map(row => [...row]);
        scene.entityLayer = this.entityLayer.map(row => [...row]);
        scene.collectibleLayer = this.collectibleLayer.map(row => [...row]);
        scene.spawnPoints = structuredClone(this.spawnPoints);
        scene.exits = structuredClone(this.exits);
        return scene;
    }
    
    toJSON() { /* export format matching your spec */ 
        return {
            id: this.id,
            name: this.name,
            width: this.width,
            height: this.height,
            palette: this.palette.toJSON(),
            tiles: this.tiles.map(t => t.toJSON()),
            entities: this.entities.map(e => e.toJSON()),
            collectibles: this.collectibles,
            characterFrames: this.characterFrames,
            terrainLayer: this.terrainLayer,
            entityLayer: this.entityLayer,
            collectibleLayer: this.collectibleLayer,
            spawnPoints: this.spawnPoints,
            exits: this.exits
        };
    }

    static fromJSON(json) {
        const scene  = new Scene(json.id, json.name, json.width, json.height);

        scene.palette = Palette.fromJSON(json.palette);
        scene.tiles = json.tiles.map(t => Tile.fromJSON(t));
        scene.entities = json.entities.map(e => Entity.fromJSON(e));
        scene.collectibles = json.collectibles.map(c => Collectible.fromJSON(c));
        scene.characterFrames = json.characterFrames;          
        scene.terrainLayer = json.terrainLayer;
        scene.entityLayer = json.entityLayer;
        scene.collectibleLayer = json.collectibleLayer;
        scene.spawnPoints = json.spawnPoints;
        scene.exits = json.exits;
        
        return scene;
    }
}

export default Scene;