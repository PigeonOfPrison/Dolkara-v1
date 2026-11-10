import Tile from "./Tile";
import Character from "./Character";
import Collectible from "./Collectible";
import SpawnPoint from "./SpawnPoint";
import Exit from "./Exit";
import Palette from "./Palette";
import { MAX_ANIMATION_FRAMES, MAX_CHARACTERS_PER_SCENE, MAX_COLLECTIBLES, MAX_LAYERS, MAX_TILEMAP_HEIGHT, MAX_TILEMAP_WIDTH, MAX_TILES_PER_SCENE } from "../utils/HardwareLimits";

export default class Scene {
    private id: number;
    private name: string;
    private tag: string;
    private width: number;
    private height: number;
    private layers: number;

    private spawnPoints: SpawnPoint[];
    private exits: Exit[]

    // 3d array of tile since we have multiple layers of tiles, and each layer is a 2d array of tiles
    private tiles: Tile[];
    private tileLayers: number[][][];


    // the character layer is different from both the tile layers and the collectible layer
    // This is because in those, we are only referencing the id of the tile/collectible, 
    // but in the character layer, we need to reference the whole character object since 
    // we need to access its properties (eg. health, damage, etc.) when we want to render it or when we want to edit it in the editor.
    // there can be multiple characters which are the same in species(?) with different remaining health and different locations and movement patterns, 
    // so we need to reference the whole character object in the character layer instead of just referencing the id of the character in the characters array.
    private characters: Character[];
    private characterLayer: (Character | null)[][];

    private collectibles: Collectible[];
    private collectibleLayer: number[][];

    private palette: Palette;

    // perhaps this will be replaced by a more general "assets" property in the future that can store not only animation frames, but also other types of assets (eg. sound effects, music, etc.) that can be referenced by the tiles, characters, and collectibles in the scene.
    private animationFrames: number[][][]; // this is a list of the frames in the scene's animation frame list, which can be referenced by the animations in the scene's animations list to create animations.

    constructor(id: number, name: string = 'scene_', tag: string = '', width: number = 20, height: number = 12, layers: number = 3) {
        this.id = id;
        this.name = name;
        this.tag = tag;
        this.width = width;
        this.height = height;
        this.layers = layers;

        this.spawnPoints = [];
        this.exits = [];

        this.palette = new Palette();
        this.animationFrames = [];

        this.tiles = []; // this will fill as users create new tiles.
        this.tileLayers = Array.from({ length: layers }, () =>
            new Array(height).fill(null).map(() => new Array(width).fill(MAX_TILES_PER_SCENE))
        );

        this.characters = []; // this will fill as users create new characters.
        this.characterLayer = Array.from({ length: height }, () =>
            new Array(width).fill(null)
        );


        this.collectibles = []; // this will fill as users create new collectibles.
        this.collectibleLayer= Array.from({ length: height }, () =>
            new Array(width).fill(MAX_COLLECTIBLES)
        );
    }

    // -----------------------------------------------------------
    // GETTERS AND SETTERS
    // -----------------------------------------------------------

    public getId(): number {
        return this.id;
    }   
    public setId(id: number): boolean {
        if (id >= 0) {
            this.id = id;
            return true;
        }
        return false;
    }

    public getName(): string {
        return this.name;
    }
    public setName(name: string): boolean {
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
    
    public getWidth(): number {
        return this.width;
    }
    public setWidth(width: number): boolean {
        if (width > 0 && width < MAX_TILEMAP_WIDTH) {
            this.width = width;
            return true;
        }
        return false;
    }
    
    public getHeight(): number {
        return this.height;
    }   
    public setHeight(height: number): boolean {
        if (height > 0 && height < MAX_TILEMAP_HEIGHT) {
            this.height = height;
            return true;
        }
        return false;
    }

    public getLayers(): number {
        return this.layers;
    }

    public setLayers(layers: number): boolean {
        if (layers > 0 && layers < MAX_LAYERS - 2) { 
            // the last 2 layer are reserved for entities and collectibles, 
            // so we only allow setting layers up to MAX_LAYERS - 3 for tiles
            this.layers = layers;
            return true;
        }
        return false;
    }

    public getPalette(): Palette {
        return this.palette;
    }
    public setPalette(palette: Palette): boolean {
        this.palette = palette;
        return true;
    }

    public setAnimationFrames(animationFrames: number[][][]): boolean {
        if (animationFrames.length <= MAX_ANIMATION_FRAMES &&
            animationFrames.every(frame => frame.length > 0 && frame.every(row => row.length > 0))
        ) {
            this.animationFrames = animationFrames.map(frame => frame.map(row => [...row]));
            return true;
        }
        return false;
    }
    public getAnimationFrames(): number[][][] {
        return this.animationFrames.map(frame => frame.map(row => [...row]));
    }

    public getTiles(): Tile[] {
        return this.tiles.map(tile => tile.clone());
    }

    public setTiles(tiles: Tile[]): boolean {
        if (tiles.length <= MAX_TILES_PER_SCENE) {
            this.tiles = tiles.map(tile => tile.clone());
            return true;
        }
        return false;
    }

    public getTileLayers(): number[][][] {
        return this.tileLayers.map(layer => layer.map(row => [...row]));
    }
    public setTileLayers(tileLayers: number[][][]): boolean {
        if (tileLayers.length === this.layers &&
            tileLayers.every(layer => layer.length === this.height && layer.every(row => row.length === this.width))
        ) {
            this.tileLayers = tileLayers.map(layer => layer.map(row => [...row]));
            return true;
        }
        return false;
    }


    public getCharacters(): Character[] {
        return this.characters.map(character => character.clone());
    }
    public setCharacters(characters: Character[]): boolean {
        if (characters.length <= MAX_CHARACTERS_PER_SCENE) {
            this.characters = characters.map(character => character.clone());
            return true;
        }
        return false;
    }

    public getCharacterLayers(): (Character | null)[][] {
        return this.characterLayer.map(row => row.map(character => character ? character.clone() : null));
    }
    public setCharacterLayers(characterLayer: (Character | null)[][]): boolean {
        if (characterLayer.length === this.height &&
            characterLayer.every(row => row.length === this.width) 
        ) {
            this.characterLayer = characterLayer.map(row => row.map(character => character ? character.clone() : null));
            return true;
        }
        return false;
    }   

    public getCollectibles(): Collectible[] {
        return this.collectibles.map(collectible => collectible.clone());
    }
    public setCollectibles(collectibles: Collectible[]): boolean {
        if (collectibles.length <= MAX_COLLECTIBLES) {
            this.collectibles = collectibles.map(collectible => collectible.clone());
            return true;
        }
        return false;
    }

    public getCollectibleLayer(): number[][] {
        return this.collectibleLayer.map(row => [...row]);
    }
    public setCollectibleLayer(collectibleLayer: number[][]): boolean {
        if (collectibleLayer.length === this.height &&
            collectibleLayer.every(row => row.length === this.width)
        ) {
            this.collectibleLayer = collectibleLayer.map(row => [...row]);
            return true;
        }
        return false;
    }

    public getSpawnPoints(): SpawnPoint[] {
        return this.spawnPoints.map(spawnPoint => spawnPoint.clone());
    }
    public setSpawnPoints(spawnPoints: SpawnPoint[]): boolean {
        this.spawnPoints = spawnPoints.map(spawnPoint => spawnPoint.clone());
        return true;
    }

    public getExits(): Exit[] {
        return this.exits.map(exit => exit.clone());
    }
    public setExits(exits: Exit[]): boolean {
        this.exits = exits.map(exit => exit.clone());
        return true;
    }

    // -----------------------------------------------------------
    // TILE METHODS
    // -----------------------------------------------------------

    public nextTileId(): number {
        // perhaps we can go through the tiles array and find the first id that is not used instead of just returning the length of the tiles array, 
        // since we can have deleted tiles in the middle of the array which can cause the ids to be out of sync with their index in the array.
        return this.tiles.length;
    }

    public getTileById(tileId: number): Tile | null {
        const tile = this.tiles.find(tile => tile.getId() === tileId);
        return tile ? tile.clone() : null;
    }
    public setTileById(tileId: number, tile: Tile): boolean {
        const idx = this.tiles.findIndex(t => t.getId() === tileId);
        if (idx !== -1) {
            this.tiles[idx] = tile.clone();
            return true;
        }
        return false;
    }

    public getTileAt(layer: number, row: number, col: number): Tile | null {
        if (layer >= 0 && layer < this.layers &&
            row >= 0 && row < this.height &&
            col >= 0 && col < this.width
            ) {
                // returning a clone so that the editor can edit the properties of the tile without affecting the original tile.
                // when the user clicks on the save button, we can just update the tile in the tiles array using the setter methods
                const tileId = this.tileLayers[layer][row][col];
                return this.tiles[tileId]?.clone() ?? null;
        }
        return null;
    }

    public setTileAt(layer: number, row: number, col: number, tileId: number): boolean {
        if (layer >= 0 && layer < this.layers &&
            row >= 0 && row < this.height &&
            col >= 0 && col < this.width &&
            tileId >= 0 && tileId < this.tiles.length

            ) {
                this.tileLayers[layer][row][col] = tileId;
                return true;
        }
        return false;
    }

    public eraseTileAt(layer: number, row: number, col: number): boolean {
        return this.setTileAt(layer, row, col, MAX_TILES_PER_SCENE);
    }

    public addTile(tile: Tile): boolean {
        if (this.tiles.length < MAX_TILES_PER_SCENE) {
            this.tiles.push(tile.clone());
            return true;
        }
        console.warn(`Cannot add more than ${MAX_TILES_PER_SCENE} tiles to a scene.`);
        return false;
    }

    public deleteTile(tileId: number): boolean {
        const idx = this.tiles.findIndex(tile => tile.getId() === tileId);

        if (idx !== -1) {
            this.tiles.splice(idx, 1);

            // so that the tile ids are always in sync with their index in the tiles array, 
            // we need to update the ids of the tiles that come after the deleted tile in the array
            for (let i = idx; i < this.tiles.length; i++) {
                this.tiles[i].setId(i);
            }

            // now deleting and updating the indices in the tileLayers 3d array to reflect the deleted tile
            for (let layer = 0; layer < this.layers; layer++) 
                this.deleteEntityFromLayer(tileId, this.tileLayers[layer], MAX_TILES_PER_SCENE);
            
            return true;
        }
        console.warn(`Tile with id ${tileId} not found in the scene.`);
        return false;
    }

    public fillTiles(layer: number, row: number, col: number, tileId: number): boolean {
        return this.fillLayer(this.tileLayers[layer], row, col, tileId);
    }


    // -----------------------------------------------------------
    // CHARACTER METHODS
    // -----------------------------------------------------------

    public nextCharacterId(): number {
        return this.characters.length;
    }

    public getCharacterById(characterId: number): Character | null {
        const character = this.characters.find(character => character.getId() === characterId);
        return character ? character.clone() : null;
    }

    public setCharacterById(characterId: number, character: Character): boolean {
        const idx = this.characters.findIndex(c => c.getId() === characterId);
        if (idx !== -1) {
            this.characters[idx] = character.clone();

            // now updating the characterLayer 2d array to reflect the updated character
            // this is necessary since the characterLayer references the whole character object, 
            // so if we update the character in the characters array, 
            // we also need to update the characterLayer to reference the updated character object instead of the old one.
            for (let row = 0; row < this.height; row++) {
                for (let col = 0; col < this.width; col++) {
                    if (this.characterLayer[row][col]?.getId() === characterId) 
                        this.characterLayer[row][col] = character.clone();
                }
            }

            return true;
        }
        return false;
    }

    public getCharacterAt(row: number, col: number): Character | null {
        if (row >= 0 && row < this.height &&
            col >= 0 && col < this.width
        ) {
            return this.characterLayer[row][col]?? null;
        }
        return null;
    }
    public setCharacterAt(row: number, col: number, id: number): boolean {
        if (row >= 0 && row < this.height &&
            col >= 0 && col < this.width
        ) {
            const character = this.characters.find(character => character.getId() === id);
            if (!character) return false;

            // clone since referencing the same char in different locations can cause bugs when we want to 
            // set different properties for the same character in different locations (eg. health, patrol pattern, etc.)
            this.characterLayer[row][col] = character.clone();
            return true;
        }
        return false;
    }

    public removeCharacterAt(row: number, col: number): boolean {
        if (row >= 0 && row < this.height &&
            col >= 0 && col < this.width
        ) {
            this.characterLayer[row][col] = null;
            return true;
        }
        return false;
    }

    public addCharacter(character: Character): boolean {
        if (this.characters.length < MAX_CHARACTERS_PER_SCENE) {
            this.characters.push(character.clone());
            return true;
        }
        return false;
    }

    public deleteCharacter(id: number): boolean {
        const idx = this.characters.findIndex(character => character.getId() === id);
        if (idx !== -1) {
            this.characters.splice(idx, 1);

            // so that the character ids are always in sync with their index in the characters array,
            // we need to update the ids of the characters that come after the deleted character in the array
            for (let i = idx; i < this.characters.length; i++) {
                this.characters[i].setId(i);
            }

            // now deleting and updating the indices in the characterLayer 2d array to reflect the deleted character
            for (let row = 0; row < this.height; row++) {
                for (let col = 0; col < this.width; col++) {

                    if (this.characterLayer[row][col]?.getId() === id) 
                        this.characterLayer[row][col] = null; // set to empty

                    else if (this.characterLayer[row][col] && this.characterLayer[row][col]!.getId() > id) 
                        this.characterLayer[row][col]!.setId(this.characterLayer[row][col]!.getId() - 1); // decrement the id to reflect the deleted entity   
                }
            }

            return true;
        }
        return false;
    }

    public fillCharacters(row: number, col: number, characterId: number): boolean {
        return this.fillLayer(this.characterLayer, row, col, this.characters.find(c => c.getId() === characterId) ?? null);
    }

    // -----------------------------------------------------------
    // COLLECTIBLE METHODS
    // -----------------------------------------------------------

    public nextCollectibleId(): number {
        return this.collectibles.length;
    }

    public getCollectibleById(collectibleId: number): Collectible | null {
        const collectible = this.collectibles.find(collectible => collectible.getId() === collectibleId);
        return collectible ? collectible.clone() : null;
    }
    public setCollectibleById(collectibleId: number, collectible: Collectible): boolean {
        const idx = this.collectibles.findIndex(c => c.getId() === collectibleId);
        if (idx !== -1) {
            this.collectibles[idx] = collectible.clone();
            return true;
        }
        return false;
    }

    public getCollectibleAt(row: number, col: number): Collectible | null {
        if (row >= 0 && row < this.height &&
            col >= 0 && col < this.width
        ) {
            const collectibleId = this.collectibleLayer[row][col];
            return this.collectibles[collectibleId]?.clone() ?? null;
        }
        return null;
    }
    public setCollectibleAt(row: number, col: number, id: number): boolean {
        if (row >= 0 && row < this.height &&
            col >= 0 && col < this.width
        ) {
            const collectible = this.collectibles.find(collectible => collectible.getId() === id);
            if (!collectible) return false;
            this.collectibleLayer[row][col] = id;
            return true;

        }
        return false;
    }

    public removeCollectibleAt(row: number, col: number): boolean {
        return this.setCollectibleAt(row, col, MAX_COLLECTIBLES);
    }

    public addCollectible(collectible: Collectible): boolean {
        if (this.collectibles.length < MAX_COLLECTIBLES) {
            this.collectibles.push(collectible.clone());
            return true;
        }
        return false;
    }

    public deleteCollectible(id: number): boolean {
        const idx = this.collectibles.findIndex(collectible => collectible.getId() === id);

        if (idx !== -1) {
            this.collectibles.splice(idx, 1);
            
            // so that the collectible ids are always in sync with their index in the collectibles array,
            // we need to update the ids of the collectibles that come after the deleted collectible in the array
            for (let i = idx; i < this.collectibles.length; i++) {
                this.collectibles[i].setId(i);
            }

            // now deleting and updating the indices in the collectibleLayer 2d array to reflect the deleted collectible
            this.deleteEntityFromLayer(id, this.collectibleLayer, MAX_COLLECTIBLES);

            return true;
        }
        return false;
    }

    public fillCollectibles(row: number, col: number, collectibleId: number): boolean {
        return this.fillLayer(this.collectibleLayer, row, col, collectibleId);
    }

    // -----------------------------------------------------------
    // SPAWN POINTS AND EXITS METHODS
    // -----------------------------------------------------------

    public getSpawnPointById(spawnPointId: number): SpawnPoint | null {
        const spawnPoint = this.spawnPoints.find(spawnPoint => spawnPoint.getId() === spawnPointId);
        return spawnPoint ? spawnPoint.clone() : null;
    }
    public setSpawnPointById(spawnPointId: number, spawnPoint: SpawnPoint): boolean {
        const idx = this.spawnPoints.findIndex(s => s.getId() === spawnPointId);

        if (idx !== -1) {
            this.spawnPoints[idx] = spawnPoint.clone();
            return true;
        }
        return false;
    }
    
    public addSpawnPoint(spawnPoint: SpawnPoint): boolean {
        this.spawnPoints.push(spawnPoint.clone());
        return true;
    }
    public deleteSpawnPoint(spawnPointId: number): boolean {
        const idx = this.spawnPoints.findIndex(s => s.getId() === spawnPointId);
        if (idx !== -1) {
            this.spawnPoints.splice(idx, 1);
            // so that the spawn point ids are always in sync with their index in the spawnPoints array,
            // we need to update the ids of the spawn points that come after the deleted spawn point in the array
            for (let i = idx; i < this.spawnPoints.length; i++) {
                this.spawnPoints[i].setId(this.spawnPoints[i].getId() - 1);
            }
            return true;
        }
        return false;
    }
    
    public getExitById(exitId: number): Exit | null {
        const exit = this.exits.find(exit => exit.getId() === exitId);
        return exit ? exit.clone() : null;
    }
    public setExitById(exitId: number, exit: Exit): boolean {
        const idx = this.exits.findIndex(e => e.getId() === exitId);
        if (idx !== -1) {
            this.exits[idx] = exit.clone();
            return true;
        }
        return false;
    }

    public addExit(exit: Exit): boolean {
        this.exits.push(exit.clone());
        return true;
    }   
    public deleteExit(exitId: number): boolean {
        const idx = this.exits.findIndex(e => e.getId() === exitId);
        if (idx !== -1) {
            this.exits.splice(idx, 1);

            // so that the exit ids are always in sync with their index in the exits array,
            // we need to update the ids of the exits that come after the deleted exit in the array
            for (let i = idx; i < this.exits.length; i++) {
                this.exits[i].setId(this.exits[i].getId() - 1);
            }
            return true;
        }
        return false;
    }

    // -----------------------------------------------------------
    // ANIMATION FRAMES METHODS
    // -----------------------------------------------------------

    public getAnimationFrame(index: number): number[][] | null {
        if (index >= 0 && index < this.animationFrames.length) {
            return this.animationFrames[index].map(row => [...row]);
        }
        return null;
    }
    public setAnimationFrame(index: number, frame: number[][]): boolean {
        if (index >= 0 && index < this.animationFrames.length &&
            frame.length > 0 && frame.every(row => row.length > 0)
        ) {
            this.animationFrames[index] = frame.map(row => [...row]);
            return true;
        }
        return false;
    }

    // -----------------------------------------------------------
    // OTHER METHODS
    // -----------------------------------------------------------

    public deleteEntityFromLayer(id: number, layer: number[][], empty_val: number): void {
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {

                if (layer[row][col] === id) 
                    layer[row][col] = empty_val; // set to empty

                else if (layer[row][col] > id) 
                    layer[row][col]--; // decrement the id to reflect the deleted entity   
            }
        }
    }

    public resize(newWidth: number, newHeight: number): boolean {
        if (newWidth > 0 && newWidth < MAX_TILEMAP_WIDTH &&
            newHeight > 0 && newHeight < MAX_TILEMAP_HEIGHT
        ) {

            // resizing the tile layers
            let tileLayers = Array.from({ length: this.layers }, () =>
                new Array(newHeight).fill(null).map(() => new Array(newWidth).fill(MAX_TILES_PER_SCENE))
            );

            for(let layer = 0; layer < this.layers; layer++) {
                this.copyLayer(this.tileLayers[layer], tileLayers[layer]);
            }
            this.tileLayers = tileLayers;

            // resizing the collectible layer
            let collectibleLayer = this.collectibleLayer = Array.from({ length: newHeight }, () =>
                new Array(newWidth).fill(MAX_COLLECTIBLES)
            );

            this.copyLayer(this.collectibleLayer, collectibleLayer);
            this.collectibleLayer = collectibleLayer;

            // resizing the character layer
            let characterLayer = this.characterLayer = Array.from({ length: newHeight }, () =>
                new Array(newWidth).fill(null)
            );

            this.copyLayer(this.characterLayer, characterLayer);
            this.characterLayer = characterLayer;

            // updating the width and height of the scene
            this.setWidth(newWidth);
            this.setHeight(newHeight);

            // removing the out-of-bounds spawn points and exits
            this.spawnPoints = this.spawnPoints.filter(sp => sp.getX() < newWidth && sp.getY() < newHeight);
            this.exits = this.exits.filter(exit => exit.getX() < newWidth && exit.getY() < newHeight);
            
            return true;
        }
        return false;
    }

    public fillLayer(layer: number[][] | (Character | null)[][], row: number, col: number, el: number | Character | null): boolean {
        if (row >= 0 && row < this.height &&
            col >= 0 && col < this.width
        ) {
            const target = layer[row][col];
            if (target === el) return false; // base case for recursion
            layer[row][col] = el;

            // recursive calls for adjacent tiles
            this.fillLayer(layer, row + 1, col, el); // down
            this.fillLayer(layer, row - 1, col, el); // up
            this.fillLayer(layer, row, col + 1, el); // right
            this.fillLayer(layer, row, col - 1, el); // left

            return true;
        }
        return false;

    }
    
    private copyLayer(orgLayer: any[][], copyLayer: any[][]): any[][] {
        for (let row = 0; row < Math.min(orgLayer.length, copyLayer.length); row++) {
            for (let col = 0; col < Math.min(orgLayer[row].length, copyLayer[row].length); col++) {
                copyLayer[row][col] = orgLayer[row][col];
            }
        }
        return copyLayer;
    }

    public clone(): Scene {
        const scene = new Scene(this.id, this.name, this.tag, this.width, this.height, this.layers);

        scene.palette = this.palette.clone();

        scene.tiles = this.tiles.map(tile => tile.clone());
        scene.tileLayers = this.tileLayers.map(layer => layer.map(row => [...row]));

        scene.characters = this.characters.map(character => character.clone());
        scene.characterLayer = this.characterLayer.map(row => row.map(character => character ? character.clone() : null));

        scene.collectibles = this.collectibles.map(collectible => collectible.clone());
        scene.collectibleLayer = this.collectibleLayer.map(row => [...row]);

        scene.spawnPoints = this.spawnPoints.map(sp => sp.clone());
        scene.exits = this.exits.map(exit => exit.clone());

        return scene;
    }
    
    toJSON(): object { /* export format matching your spec */ 
        return {
            id: this.id,
            name: this.name,
            tag: this.tag,
            width: this.width,
            height: this.height,

            palette: this.palette.toJSON(),
            animationFrames: this.animationFrames.map(frame => frame.map(row => [...row])),

            tiles: this.tiles.map(t => t.toJSON()),
            tilesLayers: this.tileLayers.map(layer => layer.map(row => [...row])),

            characters: this.characters.map(c => c.toJSON()),
            characterLayer: this.characterLayer.map(row => row.map(character => character ? character.toJSON() : null)),

            collectibles: this.collectibles.map(c => c.toJSON()),
            collectibleLayer: this.collectibleLayer.map(row => [...row]),

            spawnPoints: this.spawnPoints.map(sp => sp.toJSON()),
            exits: this.exits.map(exit => exit.toJSON())


        };
    }

    static fromJSON(json: any): Scene {
        const scene  = new Scene(json.id, json.name, json.tag, json.width, json.height, json.layers);

        scene.palette = Palette.fromJSON(json.palette);
        scene.animationFrames = json.animationFrames.map((frame: number[][]) => frame.map((row: number[]) => [...row]));

        scene.tiles = json.tiles.map((t: any) => Tile.fromJSON(t));
        scene.tileLayers = json.tileLayers.map((layer: number[][]) => layer.map((row: number[]) => [...row]));

        scene.characters = json.characters.map((c: any) => Character.fromJSON(c));
        scene.characterLayer = json.characterLayer.map((row: any[]) => row.map(character => character ? Character.fromJSON(character) : null));

        scene.collectibles = json.collectibles.map((c: any) => Collectible.fromJSON(c));
        scene.collectibleLayer = json.collectibleLayer.map((row: number[]) => [...row]);

        scene.spawnPoints = json.spawnPoints.map((sp: any) => SpawnPoint.fromJSON(sp));
        scene.exits = json.exits.map((exit: any) => Exit.fromJSON(exit));

        return scene;
    }

}