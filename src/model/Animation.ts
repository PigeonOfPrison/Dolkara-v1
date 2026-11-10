import { MAX_ANIMATION_FRAMES, MAX_FPS } from "../utils/HardwareLimits";
export default class Animation {
    private name: string;

    // consists of the indices of the frames in the scene's animation frame list
    private frames: number[];
    private loop: boolean;
    private fps: number;

    constructor(name: string, loop: boolean = true, fps: number = MAX_FPS, frames: number[] = []) {
        this.name = name;
        this.frames = frames;
        this.loop = loop;
        this.fps = fps;
    }

    public getName(): string {
        return this.name;
    }
    public setName(name: string): boolean {
        this.name = name;
        return true;
    }

    public isLooping(): boolean {
        return this.loop;
    }
    public setLoop(loop: true): boolean {
        this.loop = loop;
        return true;
    }

    public getFPS(): number {
        return this.fps;
    }
    public setFPS(fps: number): boolean {
        if (fps > 0 && fps <= MAX_FPS) {
            this.fps = fps;
            return true;
        }
        return false;
    }

    public getFrames(): number[] {
        return [...this.frames];
    }
    public setFrames(frames: number[]): boolean {
        if (frames.length <= MAX_ANIMATION_FRAMES) {
            this.frames = frames;
            return true;
        }
        return false;
    }

    public addFrame(frameId: number, index: number = this.frames.length): boolean {
        if (frameId >= 0 && frameId < MAX_ANIMATION_FRAMES && 
            this.frames.length < MAX_ANIMATION_FRAMES && 
            index >= 0 && index <= this.frames.length
        ) {
            this.frames.splice(index, 0, frameId);
            return true;
        }
        return false;
    }

    public removeFrame(index: number): boolean {
        if (index >= 0 && index < this.frames.length) {
            this.frames.splice(index, 1);
            return true;
        }
        return false;
    }

    public getFrameAt(index: number): number | null {
        return this.frames[index] ?? null;
    }
    public setFrameAt(index: number, frameId: number): boolean {
        return this.addFrame(frameId, index); 
    }

    public clone(): Animation {
        return new Animation(this.name, this.loop, this.fps, this.frames);
    }

    public toJSON(): object {
        return {
            name: this.name,
            frames: this.frames
        };
    }

    public static fromJSON(json: any): Animation {
        const anim = new Animation(json.name, json.loop, json.fps, json.frames);
        anim.frames = json.frames || [];
        return anim;
    }


}