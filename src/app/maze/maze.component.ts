import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { range } from 'rxjs';
import { CastExpr } from '@angular/compiler';
import { createText } from '@angular/core/src/view/text';
import { element } from '@angular/core/src/render3';

interface Cell {
  walls: [boolean, boolean, boolean, boolean];
  visited: boolean;
}

interface Coordinates {
  x: number;
  y: number;
}

const entrySize = 50;

enum Direction {
  NORTH= 0, EAST= 1, SOUTH= 2, WEST= 3
}

const Directions = [
  0, 1, 2, 3
];

@Component({
  selector: 'app-maze',
  templateUrl: './maze.component.html',
  styleUrls: ['./maze.component.scss']
})
export class MazeComponent implements OnInit {

  @ViewChild('maze') canvas: ElementRef;

  constructor() { }

  ngOnInit() {
    /*
    A "true" entry inside the maze means, the border is present
    */

    const x = this.canvas.nativeElement.width / entrySize;
    const y = this.canvas.nativeElement.height / entrySize;

    const maze = new Array<Array<Cell>>();
    const indexQueue = this.getQueue(x, y);
    const stack = new Array<Coordinates>();
    for (let i = 0; i < x; i++) {
      maze.push(new Array<Cell>());
      for (let j = 0; j < y; j++) {
        maze[i].push({
          walls: [true, true, true, true],
          visited: false
        });
      }
    }

    let currentIndex: Coordinates;
    let current: Cell;
    do {
      currentIndex = indexQueue.pop();

      if (currentIndex === undefined) {
        console.log('Got back undefined of Queue');
      }

      current = maze[currentIndex.x][currentIndex.y];

      current.visited = true;

      // Check if unvisited neighbours are present
      const unvisited = new Array<Cell & {dir: number, cord: Coordinates}>();
      // iterate over north, east, south, west
      for (const direction of Directions) {
        const coordinates: Coordinates = {x: currentIndex.x, y: currentIndex.y};
        if (direction === Direction.NORTH) {
          coordinates.y -= 1;
        } else if (direction === Direction.SOUTH) {
          coordinates.y += 1;
        } else if (direction === Direction.EAST) {
          coordinates.x += 1;
        } else if (direction === Direction.WEST) {
          coordinates.x -= 1;
        } else {
          console.log('Error while processign coordinates, got direction: ' + direction);
          return;
        }

        // Check if out of bounds -> if yes, skip this direction
        if (coordinates.x < 0 || coordinates.x >= x || coordinates.y < 0 || coordinates.y >= y) {
          continue;
        }

        // Check if neighbour has been visited yet
        const neighbour = maze[coordinates.x][coordinates.y];
        if (!neighbour.visited) {
          unvisited.push({...neighbour, dir: direction, cord: coordinates});
        }
      }

      // If some unvisited choose, randomly one of them to visit
      if (unvisited.length > 0) {
        stack.push(currentIndex);

        const randomIndex = this.getRandom(0, unvisited.length - 1);
        // Remove wall between current and next cell
        const next = unvisited[randomIndex];

        // Remove the wall
        current.walls[next.dir] = false;
        next.walls[(next.dir + 2) % 4] = false;
        // Make next to to current in next round
        indexQueue.push(next.cord);

        this.drawCell(currentIndex.x, currentIndex.y, current);
        this.drawCell(next.cord.x, next.cord.y, next);
      } else {
        const next = stack.pop();

        if (next !== undefined) {
          indexQueue.push(next);
        }
      }
    } while (indexQueue.length > 0);

    // Draw cells
    /*
    for (let i = 0; i < x; i++) {
      for (let j = 0; j < y; j++) {
        this.drawCell(i, j, maze[i][j]);
      }
    }
    */
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
    ctx.fill();

    // Fill the rect
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 1, y + 1, entrySize - 2, entrySize - 2);
  }

  getQueue(x: number, y: number): Array<Coordinates> {
    const n = x * y;
    const array = new Array<Coordinates>();
    for (let i = 0; i < x; i++) {
      for (let j = 0; j < y; j++) {
        array.push({x: i, y: j});
      }
    }

    for (let i = 0; i < array.length; i++) {
      // Random to swap
      const randomChoiceIndex = this.getRandom(i, array.length - 1);
      // Swapping
      [array[i], array[randomChoiceIndex]] = [array[randomChoiceIndex], array[i]];
    }

    return array;
  }

  getRandom(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
