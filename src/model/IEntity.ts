
export default interface IEntity {
    getId(): number;
    getName(): string;
    getTag(): string;
    getPixels(): number[][];
    getPixelAt(row: number, col: number): number | null;
}