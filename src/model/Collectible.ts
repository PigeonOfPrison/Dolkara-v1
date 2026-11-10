import Entity from "./Entity";
import { COLLECTIBLE_SIZE, MAX_COLLECTIBLES, MAX_CURRENCY } from "../utils/HardwareLimits";


export default class Collectible extends Entity {
    private value: number;
    private inventorySlot: number;
    private maxStack: number;
    private currency: boolean;

    constructor(id: number, name: string = 'collectible_', tag: string = 'item') {
        super(id, name, tag, COLLECTIBLE_SIZE, MAX_COLLECTIBLES);
        this.value = 0;
        this.inventorySlot = -1;    // -1 indicates not assigned to any inventory slot
        this.maxStack = 1;          // default max stack is 1 (non-stackable)
        this.currency = false;    // default is not currency
    }

    // -----------------------------------------------------------
    // GETTERS AND SETTERS
    // -----------------------------------------------------------

    public getValue(): number {
        return this.value;
    }

    public setValue(value: number): boolean {
        if (value >= 0 && value < MAX_CURRENCY) {
            this.value = value;
            return true;
        }
        return false;
    }

    public getInventorySlot(): number {
        return this.inventorySlot;
    }
    public setInventorySlot(slot: number): boolean {
        if (slot >= 0 && slot < MAX_COLLECTIBLES - 1) { // -1 because the last slot is reserved for empty space (eg. slot = 63) and we want to avoid confusion with that
            this.inventorySlot = slot;
            return true;
        }
        return false;
    }

    public isCurrency(): boolean {
        return this.currency;
    }
    public setCurrency(isCurrency: boolean): boolean {
        this.currency = isCurrency;
        return true;
    }

    public getMaxStack(): number {
        return this.maxStack;
    }
    public setMaxStack(maxStack: number): boolean {
        if (this.currency) {
            if (maxStack >= 1 && maxStack < MAX_COLLECTIBLES) {
                this.maxStack = maxStack;
                return true;
            }
            return false;
        }

        // For non-currency collectibles, max stack must be 1 (non-stackable)
        if (maxStack === 1) {
            this.maxStack = maxStack;
            return true;
        }
        return false;
    }

    // -----------------------------------------------------------
    // OTHER METHODS
    // -----------------------------------------------------------  

    public clone(): Collectible {
        const item = new Collectible(this.id, this.name, this.tag);

        item.pixels = [...this.pixels];
        item.tag = this.tag;
        item.value = this.value;
        item.inventorySlot = this.inventorySlot;
        item.maxStack = this.maxStack;
        item.currency = this.currency;

        return item;
    }

    public toJSON(): object {
        return {
            id: this.id,
            name: this.name,
            tag: this.tag,
            value: this.value,
            inventorySlot: this.inventorySlot ,
            pixels : this.pixels
        };
    }

    static fromJSON(json: any): Collectible {
        const item = new Collectible(json.id, json.name, json.tag);

        item.tag = json.tag;
        item.value = json.value;
        item.inventorySlot = json.inventorySlot;
        item.pixels = json.pixels;

        return item;
    }

}