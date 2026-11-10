

export default class SpawnPoint {
    private id: number;
    private name: string;
    private x: number;
    private y: number;

    constructor(id: number, name: string, x: number, y: number) {
        this.id = id;
        this.name = name;
        this.x = x;
        this.y = y;
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

    public clone(): SpawnPoint {
        return new SpawnPoint(this.id, this.name, this.x, this.y);
    }

    public toJSON(): object {
        return {
            id: this.id,
            name: this.name,
            x: this.x,
            y: this.y
        };
    }

    public static fromJSON(json: any): SpawnPoint {
        return new SpawnPoint(json.id, json.name, json.x, json.y);
    }
}