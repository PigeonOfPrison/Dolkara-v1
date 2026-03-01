import { MAX_PALETTE_COLOURS } from '../constants/hardwareLimits.js';

class Palette {

    constructor(colours = null) {
        this.colours = colours || this.createDefaultPalette();
    }

    createDefaultPalette() {
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

    setColour(index, hex_colour) {
        if(index < 0 || index >= MAX_PALETTE_COLOURS)
            throw new Error(`Colour index must be in between 0-${MAX_PALETTE_COLOURS - 1}`);

        if (!/^#[0-9A-Fa-f]{6}$/.test(hex_colour)) 
            throw new Error('Invalid hex color format. Must be #RRGGBB');

        this.colours[index] = hex_colour.toUpperCase();
    }

    getColour(index) {
        if(index < 0 || index >= MAX_PALETTE_COLOURS)
            throw new Error(`Colour index must be in between 0-${MAX_PALETTE_COLOURS} - 1`);

        return this.colours[index];
    }

    getColours() {
        return this.colours;
    }

    toJSON() {
        return {
            format: "indexed",
            colours: this.colours.map((hex, index) => ({
                index, 
                rgb: hex
            }))
        };
    }

    static fromJSON(json) {
        const colours = json.colours.map(c => c.rgb);
        return new Palette(colours);
    }
}

export default Palette;