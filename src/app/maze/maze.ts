import { Observable } from 'rxjs';

export enum Orientation {
    HORIZONTAL, VERTICAL
}

export function toKey(cord: Coordinates): string {
    return `${cord.x},${cord.y}`;
}

export function toKeys(wall: IWall): [string, string] {
    return [this.toKey(wall.cellOne), this.toKey(wall.cellTwo)];
}

export function getRandom(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export interface IWall {
    cellOne: ICell;
    cellTwo: ICell;
    present: boolean;

    getOrientation: () => Orientation;
}

export class Wall implements IWall {
    public present: boolean;
    constructor(
        readonly cellOne: ICell,
        readonly cellTwo: ICell,
        present: boolean = true
    ) {
        this.present = present;
    }

    getOrientation(): Orientation {
        if (this.cellOne.x === this.cellTwo.x && this.cellTwo.y !== this.cellOne.y) {
            return Orientation.VERTICAL;
        } else {
            return Orientation.HORIZONTAL;
        }
    }
}

export interface Coordinates {
    x: number;
    y: number;
}

export interface Dimensions extends Coordinates {
    width: number;
    height: number;
}

export interface ICell extends Coordinates {
    set: Set<ICell>;
    visited: boolean;
}

export class Cell implements ICell {
    public set: Set<ICell>;
    readonly visited: boolean;

    constructor(
        readonly x: number,
        readonly y: number,
        set = new Set(),
        visited = false
    ) {
        this.set = set;
        this.visited = visited;
    }
}

export class Maze {
    readonly walls: Map<string, Map<string, IWall>>;
    readonly cells: Map<number, Map<number, ICell>>;
    readonly size: number;

    constructor(size: number) {
        this.size = size;
        this.walls = new Map();
        this.cells = new Map();
    }

    public init(): Observable<IWall> {
        return new Observable((observer) => {
            // Init cells and walls
            for (let x = 0; x < this.size; x++) {
                this.cells[x] = new Map();
                for (let y = 0; y < this.size; y++) {
                    // Add cell
                    const cell = new Cell(x, y);
                    this.cells[x][y] = cell;

                    //// Add wall function
                    const addWall = (cordCells: [Cell, Cell]) => {
                        const cords = [toKey(cordCells[0]), toKey(cordCells[1])];
                        if (!this.walls.hasOwnProperty(cords[0]) || this.walls[cords[0]] == null) {
                            this.walls[cords[0]] = new Map();
                        }
                        const addedWall = new Wall(cordCells[0], cordCells[1]);
                        this.walls[cords[0]][cords[1]] = addedWall;
                        observer.next(addedWall);
                    };

                    // Add Walls to entries before
                    if (x > 0) {
                        const cellWest = this.cells[x - 1][y];
                        addWall([cell, cellWest]);
                    }
                    if (y > 0) {
                        const cellNorth = this.cells[x][y - 1];
                        addWall([cell, cellNorth]);
                    }
                }
            }
            observer.complete();
        });
    }

    private existsWall([keyOne, keyTwo]: [string, string]): boolean {
        return (this.walls.hasOwnProperty(keyOne) && this.walls[keyOne] != null && this.walls[keyOne].hasOwnProperty(keyTwo)) ||
            (this.walls.hasOwnProperty(keyTwo) != null && this.walls[keyTwo] != null && this.walls[keyTwo].hasOwnProperty(keyOne));
    }

    removeWall(wall: IWall) {
        const [keyOne, keyTwo] = toKeys(wall);
        if (this.walls.hasOwnProperty(keyOne) && this.walls[keyOne].hasOwnProperty(keyTwo)) {
            delete this.walls[keyOne][keyTwo];
        } else if (this.walls.hasOwnProperty(keyTwo) != null && this.walls[keyTwo].hasOwnProperty(keyOne)) {
            delete this.walls[keyTwo][keyOne];
        }
    }

    hasWall(wall: IWall): boolean {
        return this.existsWall(toKeys(wall));
    }

    getWallsRandomOrdered(): Array<IWall> {
        const rWalls: Array<IWall> = [];
        // Add all walls
        for (let x = 1; x < this.size; x++) {
            for (let y = 1; y < this.size; y++) {
                const cellCords = toKey({ x, y });
                const wallsOfCell: Map<string, IWall> = this.walls[cellCords];

                wallsOfCell.forEach((value: IWall) => rWalls.push(value));
            }
        }

        // Reorder them
        for (let i = 0; i < rWalls.length; i++) {
            const randomChoice = getRandom(i, rWalls.length - 1);
            [rWalls[i], rWalls[randomChoice]] = [rWalls[randomChoice], rWalls[i]];
        }
        return rWalls;
    }

    // Converts this maze to Blocks for easier collision detection
    toBlocks(): Array<Dimensions> {
        return [];
    }
}
