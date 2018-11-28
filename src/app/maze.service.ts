import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Cell {
  walls: [boolean, boolean, boolean, boolean];
  visited: boolean;
}

export enum Direction {
  NORTH = 0, EAST = 1, SOUTH = 2, WEST = 3
}

export const Directions = [
  0, 1, 2, 3
];

interface Coordinates {
  x: number;
  y: number;
}

@Injectable({
  providedIn: 'root'
})
export class MazeService {

  constructor() { }

  generateMaze(width: number, height: number): Observable<Cell & Coordinates> {
    return new Observable(observer => {
      const maze = new Array<Array<Cell>>();
      const indexQueue = this.getQueue(width, height);
      const stack = new Array<Coordinates>();
      for (let i = 0; i < width; i++) {
        maze.push(new Array<Cell>());
        for (let j = 0; j < height; j++) {
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

        current = maze[currentIndex.x][currentIndex.y];

        current.visited = true;

        // Check if unvisited neighbours are present
        const unvisited = new Array<Cell & { dir: number, cord: Coordinates }>();
        // iterate over north, east, south, west
        for (const direction of Directions) {
          const coordinates: Coordinates = { x: currentIndex.x, y: currentIndex.y };
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
          if (coordinates.x < 0 || coordinates.x >= width || coordinates.y < 0 || coordinates.y >= height) {
            continue;
          }

          // Check if neighbour has been visited yet
          const neighbour = maze[coordinates.x][coordinates.y];
          if (!neighbour.visited) {
            unvisited.push({ ...neighbour, dir: direction, cord: coordinates });
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

          observer.next({ ...current, x: currentIndex.x, y: currentIndex.y });
          observer.next({ ...next, x: next.cord.x, y: next.cord.y });
        } else {
          const next = stack.pop();

          if (next !== undefined) {
            indexQueue.push(next);
          }
        }
      } while (indexQueue.length > 0);
    });
  }

  getQueue(x: number, y: number): Array<Coordinates> {
    const n = x * y;
    const array = new Array<Coordinates>();
    for (let i = 0; i < x; i++) {
      for (let j = 0; j < y; j++) {
        array.push({ x: i, y: j });
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
