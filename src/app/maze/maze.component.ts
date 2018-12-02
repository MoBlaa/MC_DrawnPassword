import { Component, OnInit, ViewChild, ElementRef, OnChanges, HostListener, AfterViewInit } from '@angular/core';
import { Cell, MazeService } from '../maze.service';

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
      next: cellCord => {
        console.log(`Drawing Cell @ x: ${cellCord.x}, y: ${cellCord.y}`);
        this.drawCell(cellCord.x, cellCord.y, cellCord);
      }
    };
  }

  setAbsoluteMazeSize(absSize: number): void {
    this.clearMaze();
    this.absoluteMazeSize = ((absSize) - (absSize % this.mazeSize));
    this.cellSize = this.absoluteMazeSize / this.mazeSize;
    console.log(`Updating size - abs=${this.absoluteMazeSize}px, rel:${this.mazeSize} Cells`);
  }

  ngOnInit() {
    const width = this.canvas.nativeElement.width,
      height = this.canvas.nativeElement.height;
    this.setAbsoluteMazeSize(height > width ? width : height);
    this.redraw();
  }

  // should only clear the canvas and draw a new maze
  redraw() {
    this.clearMaze();

    this.service.generateMaze(this.mazeSize)
      .subscribe(this.cellUpdater());
  }

  clearMaze(): void {
    const context: CanvasRenderingContext2D = this.canvas.nativeElement.getContext('2d');
    context.fillStyle = COLOR_WHITE;
    context.fillRect(0, 0, this.absoluteMazeSize, this.absoluteMazeSize);
  }

  drawCell(x_: number, y_: number, cell: Cell) {
    const ctx: CanvasRenderingContext2D = this.canvas.nativeElement.getContext('2d');

    const size = this.cellSize;
    const x = x_ * size, y = y_ * size;

    /*
    While erasing the borders, let the corners be there
    */

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
}
