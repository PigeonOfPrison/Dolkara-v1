import Animation from "./Animation";
import { MAX_ANIMATION_FRAMES } from "../utils/HardwareLimits";

/**
 * CharacterTemplate stores shared animation data for character types.
 * Multiple Character instances can reference the same template to avoid duplicating animation data.
 */
export default class CharacterTemplate {
    private id: number;
    private name: string; // e.g., "Goblin", "Knight", "Slime"
    
    // Shared animation data
    private animationFrames: number[][][]; // pixel data for each frame
    private animations: Animation[];       // animation definitions (idle, walk, attack, etc.)
    
    // Default character properties (can be overridden by specific instances)
    private defaultHealth: number;
    private defaultDamage: number;
    private defaultSpeed: number;

    constructor(
        id: number,
        name: string = 'Character Template',
        defaultHealth: number = 100,
        defaultDamage: number = 10,
        defaultSpeed: number = 1
    ) {
        this.id = id;
        this.name = name;
        this.animationFrames = [];
        this.animations = [];
        this.defaultHealth = defaultHealth;
        this.defaultDamage = defaultDamage;
        this.defaultSpeed = defaultSpeed;
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
        return true;
    }

    public getDefaultHealth(): number {
        return this.defaultHealth;
    }
    public setDefaultHealth(health: number): boolean {
        if (health > 0) {
            this.defaultHealth = health;
            return true;
        }
        return false;
    }

    public getDefaultDamage(): number {
        return this.defaultDamage;
    }
    public setDefaultDamage(damage: number): boolean {
        if (damage >= 0) {
            this.defaultDamage = damage;
            return true;
        }
        return false;
    }

    public getDefaultSpeed(): number {
        return this.defaultSpeed;
    }
    public setDefaultSpeed(speed: number): boolean {
        if (speed > 0) {
            this.defaultSpeed = speed;
            return true;
        }
        return false;
    }

    // -----------------------------------------------------------
    // ANIMATION FRAME METHODS
    // -----------------------------------------------------------

    public getAnimationFrames(): number[][][] {
        return this.animationFrames.map(frame => frame.map(row => [...row]));
    }

    public setAnimationFrames(frames: number[][][]): boolean {
        if (frames.length <= MAX_ANIMATION_FRAMES &&
            frames.every(frame => frame.length > 0 && frame.every(row => row.length > 0))
        ) {
            this.animationFrames = frames.map(frame => frame.map(row => [...row]));
            return true;
        }
        return false;
    }

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

    public addAnimationFrame(frame: number[][]): boolean {
        if (this.animationFrames.length < MAX_ANIMATION_FRAMES &&
            frame.length > 0 && frame.every(row => row.length > 0)
        ) {
            this.animationFrames.push(frame.map(row => [...row]));
            return true;
        }
        return false;
    }

    public deleteAnimationFrame(index: number): boolean {
        if (index >= 0 && index < this.animationFrames.length) {
            this.animationFrames.splice(index, 1);

            // Update all animations that reference frames after the deleted one
            for (const animation of this.animations) {
                const frames = animation.getFrames();
                const updatedFrames = frames
                    .filter(frameIdx => frameIdx !== index) // remove references to deleted frame
                    .map(frameIdx => frameIdx > index ? frameIdx - 1 : frameIdx); // decrement higher indices
                animation.setFrames(updatedFrames);
            }

            return true;
        }
        return false;
    }

    // -----------------------------------------------------------
    // ANIMATION METHODS
    // -----------------------------------------------------------

    public getAnimations(): Animation[] {
        return this.animations.map(animation => animation.clone());
    }

    public setAnimations(animations: Animation[]): boolean {
        this.animations = animations.map(animation => animation.clone());
        return true;
    }

    public getAnimationByName(name: string): Animation | null {
        const animation = this.animations.find(anim => anim.getName() === name);
        return animation ? animation.clone() : null;
    }

    public setAnimationByName(name: string, animation: Animation): boolean {
        const idx = this.animations.findIndex(anim => anim.getName() === name);
        if (idx !== -1) {
            this.animations[idx] = animation.clone();
            return true;
        }
        return false;
    }

    public addAnimation(animation: Animation): boolean {
        // Check if animation with same name already exists
        if (this.animations.some(anim => anim.getName() === animation.getName())) {
            console.warn(`Animation with name "${animation.getName()}" already exists.`);
            return false;
        }

        this.animations.push(animation.clone());
        return true;
    }

    public deleteAnimation(name: string): boolean {
        const idx = this.animations.findIndex(anim => anim.getName() === name);
        if (idx !== -1) {
            this.animations.splice(idx, 1);
            return true;
        }
        return false;
    }

    // -----------------------------------------------------------
    // SERIALIZATION
    // -----------------------------------------------------------

    public clone(): CharacterTemplate {
        const template = new CharacterTemplate(
            this.id,
            this.name,
            this.defaultHealth,
            this.defaultDamage,
            this.defaultSpeed
        );

        template.animationFrames = this.animationFrames.map(frame => frame.map(row => [...row]));
        template.animations = this.animations.map(animation => animation.clone());

        return template;
    }

    public toJSON(): object {
        return {
            id: this.id,
            name: this.name,
            defaultHealth: this.defaultHealth,
            defaultDamage: this.defaultDamage,
            defaultSpeed: this.defaultSpeed,
            animationFrames: this.animationFrames.map(frame => frame.map(row => [...row])),
            animations: this.animations.map(animation => animation.toJSON())
        };
    }

    public static fromJSON(json: any): CharacterTemplate {
        const template = new CharacterTemplate(
            json.id,
            json.name,
            json.defaultHealth,
            json.defaultDamage,
            json.defaultSpeed
        );

        template.animationFrames = json.animationFrames.map((frame: number[][]) => 
            frame.map((row: number[]) => [...row])
        );
        template.animations = json.animations.map((anim: any) => Animation.fromJSON(anim));

        return template;
    }
}
