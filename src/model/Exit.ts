
export default class Exit {
    private id: number;
    private name: string;
    private x: number;
    private y: number;
    private width: number;
    private height: number;
    private targetScene: number; // Scene ID
    private targetSpawn: number; // SpawnPoint ID in target scene
    private requirement: string; // e.g., "key_red", "health > 50", etc.

    constructor(
        id: number,
        name: string,
        x: number,
        y: number,

        // id of the target scene and spawn point to which this exit leads
        targetScene: number,
        targetSpawn: number,
    ) {
        this.id = id;
        this.name = name;
        this.x = x;
        this.y = y;

        // Exits are 1x1 by default, but can be resized if needed
        this.width = 1; 
        this.height = 1;
        this.targetScene = targetScene;
        this.targetSpawn = targetSpawn;
        this.requirement = '';
    }

    public getId(): number {
        return this.id;
    }
    public setId(id: number): boolean {
        this.id = id;
        return true;
    }

    public getName(): string {
        return this.name;
    }
    public setName(name: string): boolean {
        this.name = name;
        return true;
    }

    public getX(): number {
        return this.x;
    }
    public setX(x: number): boolean {
        this.x = x;
        return true;
    }

    public getY(): number {
        return this.y;
    }
    public setY(y: number): boolean {
        this.y = y;
        return true;
    }

    public getWidth(): number {
        return this.width;
    }
    public setWidth(width: number): boolean {
        this.width = width;
        return true;
    }

    public getHeight(): number {
        return this.height;
    }
    public setHeight(height: number): boolean {
        this.height = height;
        return true;
    }

    public getTargetScene(): number {
        return this.targetScene;
    }
    public setTargetScene(targetScene: number): boolean {
        this.targetScene = targetScene;
        return true;
    }

    public getTargetSpawn(): number {
        return this.targetSpawn;
    }
    public setTargetSpawn(targetSpawn: number): boolean {
        this.targetSpawn = targetSpawn;
        return true;
    }

    public getRequirement(): string {
        return this.requirement;
    }
    public setRequirement(requirement: string): boolean {
        this.requirement = requirement;
        return true;
    }

    public clone(): Exit {
        let exit =  new Exit(
            this.id,
            this.name,
            this.x,
            this.y,
            this.targetScene,
            this.targetSpawn,
        );

        exit.setWidth(this.width);
        exit.setHeight(this.height);
        exit.setRequirement(this.requirement);

        return exit;
    }

    public toJSON(): object {
        return {
            id: this.id,
            name: this.name,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            targetScene: this.targetScene,
            targetSpawn: this.targetSpawn,
            requirement: this.requirement
        };
    }

    public static fromJSON(json: any): Exit {
        let exit = new Exit(
            json.id,
            json.name,
            json.x,
            json.y,
            json.targetScene,
            json.targetSpawn,
        );

        exit.setWidth(json.width);
        exit.setHeight(json.height);
        exit.setRequirement(json.requirement);

        return exit;
    }
} 