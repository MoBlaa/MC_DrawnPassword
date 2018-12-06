import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MazeService, IWallEvent, WallEventType } from '../maze.service';
import { CheckType } from '@angular/core/src/view';
import { Coordinates, Dimensions, IWall, ICell } from '../maze';
import { preserveWhitespacesDefault } from '@angular/compiler';

const COLOR_WHITE = '#ffffff', COLOR_BLACK = '#000000';

interface IDrawnWall {
  firstCell: Coordinates;
  secondCell: Coordinates;
}

enum MazeWalls {
  NORTH, EAST, SOUTH, WEST
}

interface IBrick extends Coordinates {
  index: number;
}

// TODO: Quadratic everytime and centering

@Component({
  selector: 'app-maze',
  templateUrl: './maze.component.html',
  styleUrls: ['./maze.component.scss']
})
export class MazeComponent implements OnInit {

  @ViewChild('maze') canvas: ElementRef;
  cellSize: number;
  // Wall Size in Pixels
  wallSize: number;
  // Number of cells in a row/column
  mazeSize: number;
  // Absolute Maze size - in Pixels
  absoluteMazeSize: number;

  constructor(
    private service: MazeService
  ) {
    this.mazeSize = 10;
    this.wallSize = 5;
  }

  // Optimiert die Wände des Labyrints, sodass aneinanderliegende miteinander verbunden werden => schnellere Überprüfung
  optimizeWalls() {
    console.log('Optimizing the walls! - hypothetically');
  }

  drawRect(cord: Dimensions, color: string) {
    const context: CanvasRenderingContext2D = this.canvas.nativeElement.getContext('2d');
    context.fillStyle = color;
    context.fillRect(cord.x, cord.y, cord.width, cord.height);
  }

  ngOnInit() {
    const width = this.canvas.nativeElement.width,
      height = this.canvas.nativeElement.height;
    this.setAbsoluteMazeSize(height > width ? width : height);
    this.redraw();
  }

  drawNorthWallOf(cell: ICell, color: string) {
    // Cell gives the relative cell inside the maze (x = column, y = row)
    console.log(`Drawing north Wall of Cell x=${cell.x}, y=${cell.y} - hypothetically`);
    const wallDimensions = {
      x: cell.x * this.cellSize + this.wallSize,
      y: cell.y * this.cellSize + this.wallSize,
      width: this.cellSize + 2 * this.wallSize,
      height: this.wallSize
    };
    this.drawRect(wallDimensions, color);
  }

  drawEastWallOf(cell: ICell, color: string) {
    console.log(`Drawing east Wall of Cell x=${cell.x}, y=${cell.y} - hypothetically`);
    this.drawWestWallOf({...cell, x: cell.x + 1}, color);
  }

  drawSouthWallOf(cell: ICell, color: string) {
    console.log(`Drawing south Wall of Cell x=${cell.x}, y=${cell.y} - hypothetically`);
    this.drawNorthWallOf({...cell, y: cell.y + 1}, color);
  }

  drawWestWallOf(cell: ICell, color: string) {
    console.log(`Drawing west Wall of Cell x=${cell.x}, y=${cell.y} - hypothetically`);
    const wallDimensions = {
      x: cell.x * (this.cellSize + 1),
      y: cell.y * this.cellSize + this.wallSize,
      width: this.cellSize + 2 * this.wallSize,
      height: this.wallSize
    };
    this.drawRect(wallDimensions, color);
  }

  clearMaze(): void {
    const context: CanvasRenderingContext2D = this.canvas.nativeElement.getContext('2d');
    context.fillStyle = COLOR_WHITE;
    context.fillRect(0, 0, this.absoluteMazeSize, this.absoluteMazeSize);

    // Draw Walls around the maze
    const north = { x: 0, y: 0, width: this.absoluteMazeSize, height: this.wallSize };
    const south = { x: 0, y: this.absoluteMazeSize - this.wallSize, width: this.absoluteMazeSize, height: this.wallSize };
    const west = { x: 0, y: 0, width: this.wallSize, height: this.absoluteMazeSize };
    const east = { x: this.absoluteMazeSize - this.wallSize, y: 0, width: this.wallSize, height: this.absoluteMazeSize };

    [north, south, west, east].forEach(wall => this.drawRect(wall, COLOR_BLACK));
  }

  // should only clear the canvas and draw a new maze by instruction of the service
  redraw() {
    // Clear
    this.clearMaze();

    // Draw new Maze
    this.service.generateMaze(this.mazeSize)
      .subscribe({
        next: (cellCord: IWallEvent) => {
          // Handle next wall added or removed
          switch (cellCord.type) {
            case WallEventType.ADD: {
              // TODO: Get if noth, south, east or west and draw it
              this.drawWall(cellCord.wall);
              break;
            }
            case WallEventType.REMOVE: {
              this.eraseWall(cellCord.wall);
            }
          }
        },
        // Handle maze generation finished
        complete: this.optimizeWalls
      });
  }

  setAbsoluteMazeSize(absSize: number): void {
    this.clearMaze();
    this.absoluteMazeSize = ((absSize) - (absSize % this.mazeSize));
    this.cellSize = this.absoluteMazeSize / this.mazeSize - this.wallSize;
    console.log(`Updating size - abs=${this.absoluteMazeSize}px, rel:${this.mazeSize} Cells`);
  }

  /*  Maze Generation and cell drawing */

  /*
  drawCell(x_: number, y_: number, cell: Cell) {
    const ctx: CanvasRenderingContext2D = this.canvas.nativeElement.getContext('2d');

    const size = this.cellSize;
    const x = x_ * size, y = y_ * size;

    //While erasing the borders, let the corners be there

    // Clear the cell
    ctx.fillStyle = COLOR_WHITE;
    ctx.fillRect(x, y, size, size);

    // Draw Walls
    ctx.fillStyle = COLOR_BLACK;
    if (cell.walls[0]) { // North
      ctx.fillRect(x, y, size, this.wallSize);
    }
    if (cell.walls[2]) { // South
      ctx.fillRect(x, y + size - this.wallSize, size, this.wallSize);
    }
    if (cell.walls[1]) { // East
      ctx.fillRect(x + size - this.wallSize, y, this.wallSize, size);
    }
    if (cell.walls[2]) { // West
      // ctx.fillRect(x, y, this.wallSize, size);
    }

    /*
    // Fill with black
    ctx.fillStyle = COLOR_BLACK;
    ctx.fillRect(x, y, size, size);
    // Remove inner
    ctx.fillStyle = COLOR_WHITE;
    ctx.fillRect(x + this.wallSize, y + this.wallSize, size - (2 * this.wallSize), size - (2 * this.wallSize));

    // Remove if not present

    // North Wall
    if (!cell.walls[0]) {
      ctx.fillRect(x + this.wallSize, y, size - (2 * this.wallSize), this.wallSize);
    }
    // South Wall
    if (!cell.walls[2]) {
      ctx.fillRect(x + this.wallSize, y + size - this.wallSize, size - (2 * this.wallSize), this.wallSize);
    }
    // East
    if (!cell.walls[1]) {
      ctx.fillRect(x + size - this.wallSize, y + this.wallSize, this.wallSize, size - (2 * this.wallSize));
    }
    // West
    if (!cell.walls[3]) {
      ctx.fillRect(x, y + this.wallSize, this.wallSize, size - (2 * this.wallSize));
    }
  }
  */
}
