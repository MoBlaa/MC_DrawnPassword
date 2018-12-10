import { Observable, Subscriber } from 'rxjs';
import { stringify } from '@angular/compiler/src/util';

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
    set: string;
    visited: boolean;
}

export class Cell implements ICell {
    public set: string;
    readonly visited: boolean;

    constructor(
        readonly x: number,
        readonly y: number,
        set = `${x}:${y}`,
        visited = false
    ) {
        this.set = set;
        this.visited = visited;
    }

    toString(): string {
        return `${this.x}:${this.y}`;
    }
}

export class Maze {
    readonly walls: Map<string, Map<string, IWall>>;

    wallCount = 0;

    readonly cells: Map<number, Map<number, ICell>>;
    readonly size: number;

    constructor(size: number) {
        this.size = size;
        this.walls = new Map();
        this.cells = new Map();
    }

    public init(observer: Subscriber<IWall>) {
        // Init cells and walls
        for (let x = 0; x < this.size; x++) {
            this.cells.set(x, new Map());
            for (let y = 0; y < this.size; y++) {
                // Add cell
                const cell = new Cell(x, y);
                this.cells.get(x).set(y, cell);

                //// Add wall function
                const addWall = (cordCells: [Cell, Cell]) => {
                    const cords = [toKey(cordCells[0]), toKey(cordCells[1])];
                    if (!this.walls.has(cords[0]) || this.walls.get(cords[0]) == null) {
                        this.walls.set(cords[0], new Map());
                    }
                    const addedWall = new Wall(cordCells[0], cordCells[1]);
                    this.walls.get(cords[0]).set(cords[1], addedWall);
                    this.wallCount++;
                    observer.next(addedWall);
                };

                // Add Walls to entries before
                if (x > 0) {
                    const cellWest = this.cells.get(x - 1).get(y);
                    addWall([cell, cellWest]);
                }
                if (y > 0) {
                    const cellNorth = this.cells.get(x).get(y - 1);
                    addWall([cell, cellNorth]);
                }
            }
        }
    }

    private existsWall([keyOne, keyTwo]: [string, string]): boolean {
        return (this.walls.hasOwnProperty(keyOne) && this.walls[keyOne] != null && this.walls[keyOne].hasOwnProperty(keyTwo)) ||
            (this.walls.hasOwnProperty(keyTwo) != null && this.walls[keyTwo] != null && this.walls[keyTwo].hasOwnProperty(keyOne));
    }

    removeWall(wall: IWall) {
        const [keyOne, keyTwo] = toKeys(wall);
        if (this.walls.hasOwnProperty(keyOne) && this.walls[keyOne].hasOwnProperty(keyTwo)) {
            this.walls.get(keyOne).delete(keyTwo);
        } else if (this.walls.hasOwnProperty(keyTwo) != null && this.walls[keyTwo].hasOwnProperty(keyOne)) {
            this.walls.get(keyTwo).delete(keyOne);
        }
    }

    hasWall(wall: IWall): boolean {
        return this.existsWall(toKeys(wall));
    }

    getWallsRandomOrdered(): Array<IWall> {
        const rWalls: Array<IWall> = [];
        // Add all walls
        for (const first of this.walls.values()) {
            for (const wall of first.values()) {
                rWalls.push(wall);
            }
        }

        // Reorder them
        for (let i = 0; i < rWalls.length; i++) {
            const randomChoice = getRandom(i, rWalls.length - 1);
            [rWalls[i], rWalls[randomChoice]] = [rWalls[randomChoice], rWalls[i]];
        }
        return rWalls;
    }

    public getWalls(): Array<IWall> {
        const walls: Array<IWall> = [];
        this.walls.forEach((value) => {
            value.forEach(wall => walls.push(wall));
        });
        return walls;
    }

    public getCells(): Array<ICell> {
        const cells: Array<ICell> = [];
        this.cells.forEach((value) => {
            value.forEach(cell => cells.push(cell));
        });
        return cells;
    }
}
