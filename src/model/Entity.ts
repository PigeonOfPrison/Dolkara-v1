import { MAX_PALETTE_COLOURS } from "../utils/HardwareLimits";
import type IEntity from "./IEntity";

export default abstract class Entity implements IEntity {
    protected id : number;
    protected name : string;
    protected tag : string;

    protected max_id : number; // max limit for the entity type (eg. max health for characters, max damage for traps, etc.)
    protected side : number; // max limit for the entity type (eg. max health for characters, max damage for traps, etc.)
    
    protected pixels: number[][];
    protected nullPixel: number = MAX_PALETTE_COLOURS - 1; // the last colour in the palette is reserved for empty pixels

    public constructor(id: number, name: string, tag: string, side: number, limit: number) {
        this.id = id;
        this.name = name;
        this.tag = tag;
        this.side = side;
        this.max_id = limit;

        // initialize the pixels to be empty (the last colour in the palette is reserved for empty pixels, 
        // so we fill the pixels with that colour by default)
        this.pixels = Array.from({ length: side }, () =>
            new Array(side).fill(MAX_PALETTE_COLOURS - 1)
        );
    }

    public getId(): number {
            return this.id;
    }
    public setId(id : number): boolean {
        if (id >= 0 && id < this.max_id) {
            this.id = id;
            return true;
        }
        return false;
    }

    public getName(): string {
        return this.name;
    }
    public setName(name: string): true {
        this.name = name;
        // add some type of validation in future? (eg. length limit)
        return true;
    }

    public getTag(): string {
        return this.tag;
    }   
    public setTag(tag: string): boolean {
        this.tag = tag;
        // add some type of validation for tags in the future? (eg. length limit)
        return true;
    }

    public getPixels(): number[][] {
        return this.pixels;
    }
    public setPixels(pixels: number[][]): boolean {
        if (pixels.length === this.side && pixels.every(row => row.length === this.side)) {
            this.pixels = pixels;
            return true;
        }
        return false;
    }

    public getPixelAt(row: number, col: number): number | null {
        if (col >= 0 && col < this.side &&
            row >= 0 && row < this.side
            ) {
                return this.pixels[row][col];
        }
        return null;
    }
    public setPixelAt(row: number, col: number, colourId: number): boolean {
        if (col >= 0 && col < this.side && 
            row >= 0 && row < this.side && 
            colourId >= 0 && colourId < MAX_PALETTE_COLOURS
            ) {
                this.pixels[row][col] = colourId;
                return true;
        }
        return false;
    }

    public clearPixels(): boolean {
        Array.from({ length: this.side }, () =>
            new Array(this.side).fill(MAX_PALETTE_COLOURS - 1)
        );
        return true;
    }

    public clearPixelAt(row: number, col: number): boolean {
        if (col >= 0 && col < this.side && 
            row >= 0 && row < this.side
        ) {
            // since the empty colour is always the last colour in the palette, we can just set the pixel to MAX_PALETTE_COLOURS - 1 to clear it
            this.pixels[row][col] = MAX_PALETTE_COLOURS - 1;
            return true;
        }        
        return false;
    }

    public isPixelsEmpty(): boolean {
        return this.pixels.every(row => row.every(colourId => colourId === MAX_PALETTE_COLOURS - 1));
    }

    public getNullPixel(): number {
        return this.nullPixel;
    }

    abstract clone(): Entity;
    abstract toJSON(): object;
}

