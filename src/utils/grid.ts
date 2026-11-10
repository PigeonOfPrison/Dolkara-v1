
export function screenToGrid(screenX: number, screenY: number, cellSize: number, offsetX: number = 0, offsetY: number = 0) {
    return {
        gridX: Math.floor((screenX - offsetX) / cellSize),
        gridY: Math.floor((screenY - offsetY) / cellSize)
    };
}

export function gridToScreen(gridX: number, gridY: number, cellSize: number, offsetX: number = 0, offsetY: number = 0) {
    return {
        screenX: gridX * cellSize + offsetX,
        screenY: gridY * cellSize + offsetY
    };
}

export function isInBounds(x: number, y: number, width: number, height: number) {
    return x >= 0 && y >= 0 && x < width && y < height;
}

export function index1Dto2D(index: number, width: number) {
    return {
        x: index % width,
        y: Math.floor(index / width)
    };
}

export function index2DTo1D(x: number, y: number, width: number) {
    return y * width + x;
}

export function flipHorizontally(grid: number[][]) {
    const m = grid.length;
    const n = grid[0].length;

    for(let r = 0; r < m; r++) {
        for(let c = 0; c < Math.floor(n / 2); c++) {
            const temp = grid[r][c];
            grid[r][c] = grid[r][n - c - 1];
            grid[r][n - c - 1] = temp;
        }
    }
}

export function flipVertically(grid: number[][]) {
    const m = grid.length;
    const n = grid[0].length;

    for(let c = 0; c < n; c++) {
        for(let r = 0; r < Math.floor(m / 2); r++) {
            const temp = grid[r][c];
            grid[r][c] = grid[n - r - 1][c];
            grid[n - r - 1][c] = temp;
        }
    }
}