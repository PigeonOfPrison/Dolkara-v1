import { TILE_SIZE, MAX_TILES_PER_SCENE, MAX_LAYERS, MAX_DAMAGE} from "../utils/HardwareLimits";
import Entity from "./Entity";


export default class Tile extends Entity {
    private solid: boolean;
    private opacity: number;
    private damage: number;
    private layer : number;

    constructor(id: number, name: string = 'tile_', tag: string = 'ground') {
        super(id, name, tag, TILE_SIZE, MAX_TILES_PER_SCENE);
        this.solid = false;
        this.opacity = 0;
        this.damage = 0;
        this.layer = MAX_LAYERS - 3; // the last 2 layer are reserved for entities and collectibles, so we start at MAX_LAYERS - 3 for tiles;
    }

    // -----------------------------------------------------------
    // GETTERS AND SETTERS
    // -----------------------------------------------------------
    
    public isSolid(): boolean {
        return this.solid;
    }
    public setIsSolid(isSolid: boolean): boolean {
        this.solid = isSolid;
        return true;
    }

    public getOpacity(): number {
        return this.opacity;
    }
    public setOpacity(opacity: number): boolean {
        if (opacity >= 0 && opacity <= 255) {
            this.opacity = opacity;
            return true;
        }
            
        return false;
    }   

    public getDamage(): number {
        return this.damage;
    }           
    public setDamage(damage: number): boolean {
        if (damage >= 0 && damage <= MAX_DAMAGE) {
            this.damage = damage;
            return true;
        }    
        return false;
    }

    public getLayer(): number {
        return this.layer;
    }
    public setLayer(layer: number): boolean {
        if (layer >= 0 && layer < MAX_LAYERS - 2) {// the last 2 layer are reserved for entities and collectibles, so we only allow setting layers up to MAX_LAYERS - 3 for tiles
            this.layer = layer;
            return true;
        }
        return false;
    }

    // -----------------------------------------------------------
    // OTHER METHODS
    // -----------------------------------------------------------

    public clone(): Tile {
        const tile = new Tile(this.id, this.name);

        tile.pixels = this.pixels.map(row => [...row]);
        tile.solid = this.solid;
        tile.damage = this.damage;
        tile.opacity = this.opacity;
        tile.tag = this.tag;
        tile.layer = this.layer

        return tile;
    }

    public toJSON(): object {
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

    public static fromJSON(json: any): Tile {
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