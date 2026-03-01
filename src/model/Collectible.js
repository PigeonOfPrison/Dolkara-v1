import { COLLECTIBLE_SIZE, MAX_PALETTE_COLOURS } from "../constants/hardwareLimits";

class Collectible {
    constructor(id, name = "item_") {
        this.id = id;
        this.name = name.endsWith('_') ? name + id : name; // Only append ID if name ends with underscore
        this.tag = "item";

        this.value = 0;     
        this.pixels = new Array(64).fill(-1);       // 8x8, -1 = transparent
        this.inventorySlot = -1;    // -1 for coins, 0-63 for items
        this.maxIndex = COLLECTIBLE_SIZE * COLLECTIBLE_SIZE;
    }

    getName() {
        return this.name;
    }
    setName(name) {
        if(typeof name !== 'string' || name.trim() === '')
            throw new Error('Name must be a non-empty string');

        this.name = name.trim();
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
            throw new Error(`Collectible-pixel index must be in between: 0-${this.maxIndex - 1}`);
        
        if(colourIndex < 0 || colourIndex >= MAX_PALETTE_COLOURS)
            throw new Error(`Colour Index must be in between: 0-${MAX_PALETTE_COLOURS - 1}`);

        this.pixels[index] = colourIndex;
        return true;
    }
    
    getPixel(index) {
        if(index < 0 || index >= this.maxIndex) 
            throw new Error(`Collectible-pixel index must be in between: 0-${this.maxIndex - 1}`); 

        return this.pixels[index];
    }

    setPixelAt(x, y, colourIndex) {
        let index = y * COLLECTIBLE_SIZE + x;
        
        return this.setPixel(index, colourIndex);
    }

    getPixelAt(x, y) {
        let index = y * COLLECTIBLE_SIZE + x;
        
        return this.getPixel(index);
    }

    getAllPixels1D() {
        return this.pixels;
    }

    getAllPixels2D() {
        const grid = [];

        for(let y = 0; y < COLLECTIBLE_SIZE; y++) 
            grid.push(this.pixels.slice(y * COLLECTIBLE_SIZE, (y + 1) * COLLECTIBLE_SIZE));
        
        return grid;
    }

    clear() {
        this.pixels.fill(-1);
        return this.pixels;
    }

    // creating a shallow copy of this collectible
    clone() {
        const item = new Collectible(this.id, this.name, this.tag);

        item.pixels = [...this.pixels];
        item.tag = this.tag;
        item.value = this.value;
        item.inventorySlot = this.inventorySlot;
        

        return item;
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
            tag: this.tag,
            value: this.value,
            inventorySlot: this.inventorySlot ,
            pixels : this.pixels
        };
    }

    static fromJSON(json) {
        const item = new Collectible(json.id, json.name);

        item.tag = json.tag;
        item.value = json.value;
        item.inventorySlot = json.inventorySlot;
        item.pixels = json.pixels;

        return item;
    }
}

export default Collectible;