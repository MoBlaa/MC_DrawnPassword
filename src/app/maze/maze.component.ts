import { Component, OnInit, ViewChild, ElementRef, OnChanges } from '@angular/core';
import { range } from 'rxjs';
import { CastExpr } from '@angular/compiler';
import { createText } from '@angular/core/src/view/text';
import { element } from '@angular/core/src/render3';
import { Cell, MazeService } from '../maze.service';

interface Size {
  width: number;
  height: number;
}

@Component({
  selector: 'app-maze',
  templateUrl: './maze.component.html',
  styleUrls: ['./maze.component.scss']
})
export class MazeComponent implements OnInit {

  @ViewChild('maze') canvas: ElementRef;
  cellSize: Size;
  rows: number;
  columns: number;
  wallSize: number;

  constructor(
    private service: MazeService
  ) {
    this.rows = 10;
    this.columns = 10;
    this.wallSize = 5;
  }

  ngOnInit() {
    const canvasSize = {
      height: this.canvas.nativeElement.height,
      width: this.canvas.nativeElement.width
    };
    this.cellSize = {
      width: (canvasSize.width - canvasSize.width % this.columns) / this.columns,
      height: (canvasSize.height - canvasSize.height % this.rows) / this.rows
    };

    this.service.generateMaze(this.columns, this.rows)
      .subscribe(
        cellCord => {
          console.log(`Drawing Cell @ x: ${cellCord.x}, y: ${cellCord.y}`);
          this.drawCell(cellCord.x, cellCord.y, cellCord);
        });
    // setTimeout(this.redraw, 1000);
  }

  drawCell(x_: number, y_: number, cell: Cell) {
    const ctx: CanvasRenderingContext2D = this.canvas.nativeElement.getContext('2d');

    const width = this.cellSize.width,
      height = this.cellSize.height;
    const x = x_ * width, y = y_ * height;
    ctx.beginPath();

    /*
    While erasing the borders, let the corners be there
    */

    // Fill with black
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y, width, height);
    // Remove inner
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + this.wallSize, y + this.wallSize, width - (2 * this.wallSize), height - (2 * this.wallSize));

    // Remove if not present

    // North Wall
    if (!cell.walls[0]) {
      ctx.fillRect(x + this.wallSize, y, width - (2 * this.wallSize), this.wallSize);
    }
    // South Wall
    if (!cell.walls[2]) {
      ctx.fillRect(x + this.wallSize, y + height - this.wallSize, width - (2 * this.wallSize), this.wallSize);
    }
    // East
    if (!cell.walls[1]) {
      ctx.fillRect(x + width - this.wallSize, y + this.wallSize, this.wallSize, height - (2 * this.wallSize));
    }
    // West
    if (!cell.walls[3]) {
      ctx.fillRect(x, y + this.wallSize, this.wallSize, height - (2 * this.wallSize));
    }
  }
}
