import { TILE_SIZE, MAX_PALETTE_COLOURS, MAX_LAYERS } from "../constants/hardwareLimits";

class Tile {
    constructor(id, name = "tile_") {
        this.id = id;                               // tilemap will refer to the id 
        this.name = name.endsWith('_') ? name + id : name; // Only append ID if name ends with underscore
        this.pixels = new Array(64).fill(-1);       // 8x8 is converted to a 1d array of size 64, -1 = transparent
        this.solid = false;                         // for walkable tile vs pure background
        this.opacity = 0;                           // 0 for opaque - 255 for transparent
        this.tag = "ground";                        // to group tiles together
        this.damage = 0;                            // for hostile terrain
        this.layer = MAX_LAYERS - 3;
        this.maxIndex = TILE_SIZE * TILE_SIZE;
    }

    getName() {
        return this.name;
    }
    setName(name) {
        if(typeof name !== 'string' || name.trim() === '')
            throw new Error('Name must be a non-empty string');

        this.name = name.trim();
    }

    isSolid() {
        return this.solid;
    }
    setSolid(solid) {
        if(typeof solid !== 'boolean')
            return new Error('Solid must be a boolean');

        this.solid = solid;
    }

    getOpacity() {
        return this.opacity;
    }
    setOpacity(opacity) {
        if (opacity < 0 || opacity > 255)
            throw new Error('Opacity must be between 0-255');
        
        this.opacity = Math.floor(opacity);
    } 

    getDamage() {
        return this.damage;
    }
    setDamage(damage) {
        if (damage < 0)
            throw new Error('Damage must be between: 0-255');

        this.damage = Math.floor(damage);
    }

    // Tag
    getTag() { 
        return this.tag; 
    }
    setTag(tag) {
        if (typeof tag !== 'string' || tag.trim() === '')
            throw new Error('Invalid tag');

        this.tag = tag;
    }

    setPixel(index, colourIndex) {
        if(index < 0 || index >= this.maxIndex) 
            throw new Error(`Tile-pixel index must be in between: 0-${this.maxIndex - 1}`);
        
        if(colourIndex < 0 || colourIndex >= MAX_PALETTE_COLOURS)
            throw new Error(`Colour Index must be in between: 0-${MAX_PALETTE_COLOURS - 1}`);

        this.pixels[index] = colourIndex;
        return true;
    }
    
    getPixelAt1D(index) {
        if(index < 0 || index >= this.maxIndex) 
            throw new Error(`Tile-pixel index must be in between: 0-${this.maxIndex - 1}`); 

        return this.pixels[index];
    }

    setPixelAt(x, y, colourIndex) {
        let index = y * TILE_SIZE + x;
        
        return this.setPixel(index, colourIndex);
    }

    getPixelAt2D(x, y) {
        let index = y * TILE_SIZE + x;
        
        return this.getPixel(index);
    }

    getAllPixels1D() {
        return this.pixels;
    }

    getAllPixels2D() {
        const grid = [];

        for(let y = 0; y < TILE_SIZE; y++) 
            grid.push(this.pixels.slice(y * TILE_SIZE, (y + 1) * TILE_SIZE));
        
        return grid;
    }

    getLayer() {
        return this.layer;
    }
    setLayer(layer) {
        if (layer < 0 || layer >= MAX_LAYERS - 2) 
            throw new Error(`The layer should be between 0-${MAX_LAYERS - 3}`);
        
        this.layer = layer;
    }

    clear() {
        this.pixels.fill(-1);
        return this.pixels;
    }

    // creating a shallow copy of this tile
    clone() {
        const tile = new Tile(this.id, this.name);

        tile.pixels = [...this.pixels];
        tile.solid = this.solid;
        tile.damage = this.damage;
        tile.opacity = this.opacity;
        tile.tag = this.tag;
        tile.layer = this.layer

        return tile;
    }

    isEmpty() {
        // checking if every pixel is set to its default value. Seems a little error prone
        // okay so lets make 
        return this.pixels.every(p => p === -1);
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            pixels: this.pixels,
            solid: this.solid,
            damage: this.damage,
            opacity: this.opacity,
            tag: this.tag,
            layer: this.layer
        }
    }

    static fromJSON(json) {
        const tile = new Tile(json.id, json.name);

        tile.pixels = json.pixels;
        tile.solid = json.solid;
        tile.damage = json.damage;
        tile.opacity = json.opacity;
        tile.tag = json.tag;
        tile.layer = json.layer;

        return tile;
    }
}

export default Tile;