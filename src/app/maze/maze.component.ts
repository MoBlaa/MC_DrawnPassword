import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ICell, MazeService, Coordinates, IWall, IWallEvent, WallEventType } from '../maze.service';
import { CheckType } from '@angular/core/src/view';

const COLOR_WHITE = '#ffffff',
  COLOR_BLACK = '#000000';

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

  cellUpdater() {
    return {
      next: (cellCord: IWallEvent) => {
        switch (cellCord.type) {
          case WallEventType.ADD: {
            this.addWall(cellCord);
            break;
          }
          case WallEventType.REMOVE: {
            this.removeWall(cellCord);
          }
        }
      },
      complete: this.optimizeWalls
    };
  }

  // Optimiert die Wände des Labyrints, sodass aneinanderliegende miteinander verbunden werden => schnellere Überprüfung
  optimizeWalls() {
    console.log('Optimizing the walls! - hypothetically');
  }

  addWall(cord: IWallEvent) {
    console.log('Adding wall! - hypothetically');
  }

  removeWall(cord: IWallEvent) {
    console.log('Removing wall! - hypothetically');
  }

  ngOnInit() {
    const width = this.canvas.nativeElement.width,
      height = this.canvas.nativeElement.height;
    this.setAbsoluteMazeSize(height > width ? width : height);
    this.redraw();
  }

  clearMaze(): void {
    const context: CanvasRenderingContext2D = this.canvas.nativeElement.getContext('2d');
    context.fillStyle = COLOR_WHITE;
    context.fillRect(0, 0, this.absoluteMazeSize, this.absoluteMazeSize);
  }

  // should only clear the canvas and draw a new maze by instruction of the service
  redraw() {
    // Clear
    this.clearMaze();

    // Draw new Maze
    this.service.generateMaze(this.mazeSize)
      .subscribe(this.cellUpdater());
  }

  setAbsoluteMazeSize(absSize: number): void {
    this.clearMaze();
    this.absoluteMazeSize = ((absSize) - (absSize % this.mazeSize));
    this.cellSize = this.absoluteMazeSize / this.mazeSize;
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
