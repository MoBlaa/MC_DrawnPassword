import { Injectable } from '@angular/core';
import { Observable, Subscriber, of } from 'rxjs';
import { IWall, ICell, Maze } from './maze';
import { mergeAll } from 'rxjs/operators';
import { stringify } from '@angular/core/src/render3/util';

export function equal(set: Set<ICell>, set2: Set<ICell>): boolean {
  if (set.size !== set2.size) {
    return false;
  }
  for (const a of set) {
    if (!set2.has(a)) {
      return false;
    }
  }
  return true;
}

@Injectable({
  providedIn: 'root'
})
export class MazeService {

  sets: Map<string, Set<ICell>>;
  oldRef: Map<string, string>;

  constructor() {
    this.sets = new Map<string, Set<ICell>>();
    this.oldRef = new Map<string, string>();
  }

  join(set: string, setTwo: string): string {
    const set1 = this.getSet(set), set2 = this.getSet(setTwo);

    set2.forEach(cell => set1.add(cell));
    set1.forEach(cell => set2.add(cell));

    this.sets.delete(setTwo);

    this.setOld(set, setTwo);

    return set;
  }

  private setOld(newKey: string, old: string) {
    if (this.oldRef.has(old)) {
      this.setOld(newKey, this.oldRef.get(old));
    }
    this.oldRef.set(old, newKey);
  }

  private getSet(set: string): Set<ICell> {
    if (this.oldRef.has(set)) {
      // Do again with newer
      return this.getSet(this.oldRef.get(set));
    }

    return this.sets.get(set);
  }

  generateMaze(size: number): Observable<IWall> {
    return new Observable<IWall>(observer => {
      // Maze initializes itself with full cells and walls
      const maze = new Maze(size);

      // initialize the maze
      maze.init(observer);

      // Init sets
      const cells = maze.getCells();
      for (const cell of cells) {
        const set = new Set<ICell>();
        set.add(cell);
        this.sets.set(cell.set, set);
      }

      // Random iterate walls
      const queue = maze.getWallsRandomOrdered();
      for (const wall of queue) {
        // DEBUG: console.log(`Comparing ${wall.cellOne} with ${wall.cellTwo}`);
        const setA = wall.cellOne.set,
          setB = wall.cellTwo.set;
        // Check if walls are distinct
        if (!equal(this.getSet(setA), this.getSet(setB))) {
          wall.present = false;
          // Join the sets
          wall.cellTwo.set = this.join(setA, setB);
          // DEBUG: this.printState(maze);
          // Update the observer
          observer.next(wall);
        } else {
          console.log('Equal set found');
        }
      }
      observer.complete();
    });
  }

  private printState(maze: Maze) {
    console.log('===== Current State');
    for (const cell of maze.getCells()) {
      const set = Array.from(this.getSet(cell.set)).join(' ');
      console.log(`SetOf ${cell.x}:${cell.y} = <${cell.set}> ${set}`);
    }
    console.log('===== End Current State');
  }
}
