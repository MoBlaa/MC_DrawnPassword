import { Component, OnInit, ViewChild, ElementRef, OnChanges } from '@angular/core';
import { range } from 'rxjs';
import { CastExpr } from '@angular/compiler';
import { createText } from '@angular/core/src/view/text';
import { element } from '@angular/core/src/render3';
import { Cell, MazeService } from '../maze.service';

const entrySize = 50;

@Component({
  selector: 'app-maze',
  templateUrl: './maze.component.html',
  styleUrls: ['./maze.component.scss']
})
export class MazeComponent implements OnInit {

  @ViewChild('maze') canvas: ElementRef;
  canvasSize: number;

  constructor(
    private service: MazeService
  ) {
    this.drawCell = this.drawCell.bind(this);
  }

  updateSize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.canvasSize = Math.floor(width < height ? width : height);
    this.canvasSize = this.canvasSize - (this.canvasSize % entrySize);
  }

  ngOnInit() {
    // Get available screensize
    this.updateSize();

    this.service.generateMaze(this.canvasSize, this.canvasSize)
      .subscribe({
        next: cellCord => {
          console.log(`Drawing Cell @ x: ${cellCord.x}, y: ${cellCord.y}`);
          this.drawCell(cellCord.x, cellCord.y, cellCord);
        },
        complete: () => console.log('Finished generating maze!')
      });
    // setTimeout(this.redraw, 1000);
  }

  drawCell(x_: number, y_: number, cell: Cell) {
    const ctx: CanvasRenderingContext2D = this.canvas.nativeElement.getContext('2d');

    const x = x_ * entrySize, y = y_ * entrySize;

    ctx.beginPath();

    // Check north
    if (cell.walls[0]) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x, y, entrySize, 1);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y, entrySize, 1);
    }
    if (cell.walls[1]) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x + entrySize, y, 1, entrySize);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + entrySize, y, 1, entrySize);
    }
    if (cell.walls[2]) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x, y + entrySize, entrySize, 1);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y + entrySize, entrySize, 1);
    }
    if (cell.walls[3]) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x, y, 1, entrySize);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y, 1, entrySize);
    }

    // Fill the rect
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 1, y + 1, entrySize - 2, entrySize - 2);
  }
}
