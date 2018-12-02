import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IWall, Coordinates, ICell, Maze } from './maze';

export enum Orientation {
  HORIZONTAL, VERTICAL
}

export enum WallEventType {
  REMOVE, ADD
}

export interface IWallEvent {
  type: WallEventType;
  wall: IWall;
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

export function distinct(set: Set<ICell>, set2: Set<ICell>): boolean {
  set.forEach(cell => {
    if (!set2.has(cell)) {
      return false;
    }
  });
  set2.forEach(cell => {
    if (!set.has(cell)) {
      return false;
    }
  });
  return true;
}

export function join(set: Set<ICell>, set2: Set<ICell>): Set<ICell> {
  const newSet = new Set<ICell>(set);
  set2.forEach(cell => newSet.add(cell));
  return newSet;
}

@Injectable({
  providedIn: 'root'
})
export class MazeService {
  startTime: Date;

  constructor() {}

  startGame() {
    this.startTime = new Date();
  }

  stopGame() {
    this.startTime = null;
  }

  generateMaze(size: number): Observable<IWallEvent> {
    return new Observable(observer => {
      // Maze initializes itself with full cells and walls
      const maze = new Maze(size);

      // Random iterate walls
      const queue = maze.getWallsRandomOrdered();
      for (const wall of queue) {
        // Check if walls are distinct
        if (distinct(wall.cellOne.set, wall.cellTwo.set)) {
          wall.present = false;
          observer.next({
            type: WallEventType.REMOVE,
            wall
          });
          // Join the sets
          const newSet = join(wall.cellOne.set, wall.cellTwo.set);
          wall.cellOne.set = newSet;
          wall.cellTwo.set = newSet;
        }
      }

      observer.complete();
    });
  }
}
