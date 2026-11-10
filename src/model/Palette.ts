import { MAX_PALETTE_COLOURS } from "../utils/HardwareLimits";


export default class Palette {
    private colours: string[];

    constructor(colours: string[] = []) {
        if (colours.length == 0 || colours.length > MAX_PALETTE_COLOURS) {
            this.colours = this.createDefaultPalette();
        }
        else
            this.colours = colours;
    }

    public getColours(): string[] {
        return [...this.colours];
    }
    public setColours(colours: string[]): boolean {
        if (colours.length <= MAX_PALETTE_COLOURS) {
            this.colours = colours;
            return true;
        }
        return false;
    }

    public getColourAt(index: number): string | null {
        if (index >= 0 && index < this.colours.length) {
            return this.colours[index];
        }
        return null;
    }
    public setColourAt(index: number, colour: string): boolean {
        if (index >= 0 && index < this.colours.length) {
            this.colours[index] = colour;
            return true;
        }
        return false;
    }

    public addColour(colour: string, index: number = this.colours.length): boolean {
        if (this.colours.length < MAX_PALETTE_COLOURS && index >= 0 && index <= this.colours.length) {
            this.colours.splice(index, 0, colour);
            return true;
        }
        return false;
    }

    public removeColour(index: number): boolean {
        if (index >= 0 && index < this.colours.length) {
            this.colours.splice(index, 1);
            return true;
        }
        return false;
    }

    public createDefaultPalette(): string[] {
        const basic_colours = [
            "#000000", // 0: Transparent (reserved, shown as black)
            "#FFFFFF", // 1: White
            "#FF0000", // 2: Red
            "#00FF00", // 3: Green
            "#0000FF", // 4: Blue
            "#FFFF00", // 5: Yellow
            "#FF00FF", // 6: Magenta
            "#00FFFF", // 7: Cyan
            "#808080", // 8: Gray
            "#C0C0C0", // 9: Silver
            "#800000", // 10: Maroon
            "#808000", // 11: Olive
            "#008000", // 12: Dark Green
            "#800080", // 13: Purple
            "#008080", // 14: Teal
            "#000080", // 15: Navy
            "#FFA500", // 16: Orange
            "#FFC0CB", // 17: Pink
            "#A52A2A", // 18: Brown
            "#FFD700", // 19: Gold
            "#4B0082", // 20: Indigo
            "#FF6347", // 21: Tomato
            "#40E0D0", // 22: Turquoise
            "#EE82EE", // 23: Violet
            "#F5DEB3", // 24: Wheat
            "#D3D3D3", // 25: Light Gray
            "#90EE90", // 26: Light Green
            "#FFB6C1", // 27: Light Pink
            "#20B2AA", // 28: Light Sea Green
            "#778899"  // 29: Light Slate Gray
        ];

        return basic_colours.slice(0, MAX_PALETTE_COLOURS);
    }

    clone(): Palette {
        return new Palette(this.getColours());
    }

    toJSON(): object {  
        return {
            colours: this.colours
        };
    }

    static fromJSON(json: any): Palette {
        return new Palette(json.colours);
    }
}