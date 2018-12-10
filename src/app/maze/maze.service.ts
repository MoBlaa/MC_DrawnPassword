import { Injectable } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { IWall, ICell, Maze } from './maze';

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

  constructor() { }

  generateMaze(size: number): Observable<IWall> {
    return new Observable(observer => {
      // Maze initializes itself with full cells and walls
      const maze = new Maze(size);

      // Init Maze
      maze.init().subscribe({
        next: (wall) => observer.next(wall),
        complete: () => this.kruskal(maze, observer)
      });
    });
  }

  private kruskal(maze: Maze, observer: Subscriber<IWall>) {
    // Random iterate walls
    const queue = maze.getWallsRandomOrdered();
    for (const wall of queue) {
      // Check if walls are distinct
      if (distinct(wall.cellOne.set, wall.cellTwo.set)) {
        wall.present = false;
        observer.next(wall);
        // Join the sets
        const newSet = join(wall.cellOne.set, wall.cellTwo.set);
        wall.cellOne.set = newSet;
        wall.cellTwo.set = newSet;
      }
    }

    observer.complete();
  }
}
