import Entity from "./Entity";
import { CHARACTER_SIZE, MAX_ANIMATION_FRAMES, MAX_CHARACTERS_PER_SCENE, MAX_HEALTH, MAX_DAMAGE, MAX_SPEED, MAX_PATROL_WAYPOINTS, MAX_CURRENCY } from "../utils/HardwareLimits";
import Animation from "./Animation";

// perhaps we can create a CharacterTemplate class in the future to store the default values for different types of characters
// the project class can have a list of these character templates and when a new character is created, we can select a template and 
// create a variable here that references the index of the selected template.

// class CharacterTemplate {
//     name: string;
//     health: number;
//     damage: number;
//     speed: number
//     jump: boolean;
//     fly: boolean
//     dropCurrency: number;
//     dropChance: number;

//     animationFrames: number[][][]; // this will be used to create the default animation for the character based on the template

//     constructor(name: string, health: number, damage: number, speed: number, jump: boolean, fly: boolean, dropCurrency: number, dropChance: number, animationFrames: number[][][]) {
//         this.name = name;
//         this.health = health;
//         this.damage = damage;
//         this.speed = speed;
//         this.jump = jump;
//         this.fly = fly;
//         this.dropCurrency = dropCurrency;
//         this.dropChance = dropChance;
//         this.animationFrames = animationFrames;
//     }
// }

export default class Character extends Entity{

    private health: number;
    private damage: number;
    private speed: number;
    private jump: boolean;
    private fly: boolean;
    private dropCurrency: number;
    private dropChance: number;

    // we need to think the idea about moves more
    //private moves: Moves[];

    private animations: Animation[];
    private defaultAnimation: Animation;

    private patrolPath: number[][];

    constructor(id: number, name: string = 'character_', tag: string = 'character') {
        super(id, name, tag, CHARACTER_SIZE, MAX_CHARACTERS_PER_SCENE);

        this.health = 100;
        this.damage = 10;
        this.speed = 2;
        this.jump = false;
        this.fly = false;
        //this.moves = [];

        // Initialize animations from metadata
        this.animations = []; // This will be populated based on the character's metadata (eg. idle, walk, attack, etc.)

        // when a new entity is created, the drawn character is the first frame of the default animation
        this.defaultAnimation = new Animation('idle');
        this.patrolPath = [];
        this.dropCurrency = 50;
        this.dropChance = 50;
    }

    // -----------------------------------------------------------
    // GETTERS AND SETTERS
    // -----------------------------------------------------------

    public getHealth(): number {
        return this.health;
    }
    public setHealth(health: number): boolean {
        if (health >= 0 && health <= MAX_HEALTH) {
            this.health = health;
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

    public getSpeed(): number {
        return this.speed;
    }
    public setSpeed(speed: number): boolean {
        if (speed >= 0 && speed <= MAX_SPEED) {
            this.speed = speed;
            return true;
        }
        return false;
    }

    public canJump(): boolean {
        return this.jump;
    }
    public setJump(jump: boolean): boolean {
        this.jump = jump;
        return true;
    }

    public canFly(): boolean {
        return this.fly;
    }
    public setFly(fly: boolean): boolean {
        this.fly = fly;
        return true;
    }

    public getAnimations(): Animation[] {
        return [...this.animations];
    }
    public setAnimations(animations: Animation[]): boolean {
        if (animations.length <= MAX_ANIMATION_FRAMES) {
            this.animations = animations;
            return true;
        }
        return false;
    }

    public getDefaultAnimation(): Animation {
        return this.defaultAnimation;
    }   
    public setDefaultAnimation(animation: Animation): boolean {
        if (this.animations.includes(animation)) {
            this.defaultAnimation = animation;
            return true;
        }
        return false;
    }

    public getPatrolPath(): number[][] {
        return [...this.patrolPath];
    }
    public setPatrolPath(patrolPath: number[][]): boolean {
        if (patrolPath.length <= MAX_PATROL_WAYPOINTS) {
            this.patrolPath = patrolPath;
            return true;
        }        
        return false;
    }
    public addPatrolWaypoint(waypoint: number[], index: number = this.patrolPath.length): boolean {
        if (this.patrolPath.length < MAX_PATROL_WAYPOINTS && 
            index >= 0 && index <= this.patrolPath.length
        ) {
            this.patrolPath.splice(index, 0, waypoint);
            return true;
        }
        return false;
    }

    // another option for different types of drops should be added in the future (eg. gold, diamonds, collectibles, etc.) instead of just currency
    public getDropCurrency(): number {
        return this.dropCurrency;
    }
    public setDropCurrency(dropCurrency: number): boolean {
        if (dropCurrency >= 0 && dropCurrency <= MAX_CURRENCY) {
            this.dropCurrency = dropCurrency;
            return true;
        }
        return false;
    }

    public getDropChance(): number {
        return this.dropChance;
    }   
    public setDropChance(dropChance: number): boolean {
        if (dropChance >= 0 && dropChance <= 100) {
            this.dropChance = dropChance;
            return true;
        }
        return false;
    }

    // -----------------------------------------------------------
    // OTHER METHODS
    // -----------------------------------------------------------

    clone(): Character {
        const entity = new Character(this.id, this.name, this.tag);
        // Constructor already set the name correctly, no need to modify
        entity.pixels = [...this.pixels];
        entity.health = this.health;
        entity.damage = this.damage;
        entity.speed = this.speed;
        entity.canJump = this.canJump;
        entity.canFly = this.canFly;
        //entity.moves = [...this.moves];
        entity.animations = this.animations.map(animation => new Animation(animation.getName(), animation.isLooping(), animation.getFPS(), animation.getFrames()));
        entity.defaultAnimation = this.defaultAnimation;
        entity.patrolPath = [...this.patrolPath];
        entity.dropCurrency = this.dropCurrency;
        entity.dropChance = this.dropChance;
        return entity;
    }

    toJSON(): object {
        return {
            id: this.id,
            name: this.name,
            tag: this.tag,
            pixels: this.pixels,
            health: this.health,
            damage: this.damage,
            speed: this.speed,
            canJump: this.canJump,
            canFly: this.canFly,
            //moves: this.moves,
            animations: this.animations.map(animation => animation.toJSON()),
            defaultAnimation: this.defaultAnimation,
            patrolPath: this.patrolPath,
            dropCurrency: this.dropCurrency,
            dropChance: this.dropChance
        };
    }

    public static fromJSON(json: any): Character {
        const character = new Character(json.id, json.name, json.tag);

        character.pixels = json.pixels;
        character.health = json.health;
        character.damage = json.damage;
        character.speed = json.speed;
        character.jump = json.jump;
        character.fly = json.fly || false;
        // entity.moves = json.moves;
        character.animations = json.animations.map((animJson: any) => Animation.fromJSON(animJson));
        character.defaultAnimation = json.defaultAnimation;
        character.patrolPath = json.patrolPath;
        character.dropCurrency = json.dropCurrency;
        character.dropChance = json.dropChance;
        return character;
    }

}