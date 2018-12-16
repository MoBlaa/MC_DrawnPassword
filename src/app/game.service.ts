import { Injectable } from '@angular/core';
import { Ball } from './ball';
import { Cords } from './custom-maze/custom-maze.component';
import { MazeGeneratorService } from './mazegenerator.service';
import { IWall } from './maze/maze';
import { Observable, of } from 'rxjs';
import { mergeAll } from 'rxjs/operators';
import { CollisionDetection } from './collision-detection';

export enum Direction {
  NORTH, EAST, SOUTH, WEST, NONEX, NONEY
}

export interface Brick {
  x: number;
  y: number;
  height: number;
  width: number;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private gameDuration: number;
  private startTime: number;
  private fps = 60;
  private intervalTimer: number;

  private movement: Cords;
  private moveSpeed = 10;

  private gameSize = 4000;
  private mazeSize = 10;
  private cellSize = this.gameSize / this.mazeSize;
  private wallWidth = 10;

  private walls: Map<IWall, Brick>;
  private ball: Ball;

  public update: () => void;

  constructor(
    private mazeService: MazeGeneratorService
  ) {
    this.ball = new Ball(this.cellSize / 2, this.cellSize / 2, this.cellSize / 4);
    this.movement = {
      x: 0, y: 0
    };
    this.walls = new Map<IWall, Brick>();

    this.updateWall = this.updateWall.bind(this);
  }

  public getTimePlayed(): number {
    return this.gameDuration;
  }

  public getWalls(): Array<Brick> {
    return Array.from(this.walls.values());
  }

  public getBall(): Ball {
    return this.ball;
  }

  public move(direction: Direction) {
    switch (direction) {
      case Direction.NORTH: {
        this.movement.y = -this.moveSpeed;
        break;
      }
      case Direction.EAST: {
        this.movement.x = this.moveSpeed;
        break;
      }
      case Direction.SOUTH: {
        this.movement.y = this.moveSpeed;
        break;
      }
      case Direction.WEST: {
        this.movement.x = - this.moveSpeed;
        break;
      }
      case Direction.NONEX: {
        this.movement.x = 0;
        break;
      }
      case Direction.NONEY: {
        this.movement.y = 0;
      }
    }
  }

  public updateGame() {
    // Re-calc Ball Position
    const cords = this.ball.getPosition();
    const updating: Cords = { x: this.movement.x, y: this.movement.y };
    if (cords.x + this.movement.x + this.ball.getRadius() > this.gameSize) {
      updating.x = this.gameSize - this.ball.getRadius() - cords.x;
    } else if (cords.x + this.movement.x - this.ball.getRadius() < 0) {
      updating.x = -(cords.x - this.ball.getRadius());
    }
    if (cords.y + this.movement.y + this.ball.getRadius() > this.gameSize) {
      updating.y = this.gameSize - this.ball.getRadius() - cords.y;
    } else if (cords.y + this.movement.y - this.ball.getRadius() < 0) {
      updating.y = -(cords.y - this.ball.getRadius());
    }
    if (!(updating.x === 0 && updating.y === 0)) {
      // Collision Detection
      // Perform Collision Detection
      const cd = new CollisionDetection(this.ball, this.getWalls());
      const [hColl, vColl] = cd.perform(updating);

      if (hColl) {
        updating.x = 0;
      }
      if (vColl) {
        updating.y = 0;
      }

      this.ball.updatePosition(updating.x, updating.y);
      // console.log(`Moving @ { x: ${updating.x}, y: ${updating.y} }`);
    } else {
      // console.log('Not Moving');
    }

    // Call callback method to update UI
    this.update();
  }

  private updateWall(wall: IWall) {
    if (wall.present) {
      // Check where to place the wall
      const offX = wall.cellOne.x - wall.cellTwo.x;
      const offY = wall.cellOne.y - wall.cellTwo.y;

      let relX = wall.cellOne.x;
      let relY = wall.cellOne.y;
      let orientation = 'h';
      if (offX === -1) {
        // East
        relX += 1;
        orientation = 'v';
      } else if (offY === 1) {
        // North
        // Orientation = horizontal
      } else if (offX === 1) {
        // West
        orientation = 'v';
      } else if (offY === -1) {
        // South
        relY += 1;
        // Orientation = horizontal
      }
      // Subtract half of the wall-width
      const x = relX * this.cellSize - this.wallWidth / 2;
      const y = relY * this.cellSize - this.wallWidth / 2;
      const width = orientation === 'h' ? this.cellSize + this.wallWidth : this.wallWidth;
      const height = orientation !== 'h' ? this.cellSize + this.wallWidth : this.wallWidth;

      this.walls.set(wall, { x, y, width, height });
    } else {
      this.walls.delete(wall);
    }
  }

  public start() {
    this.gameDuration = 0;
    this.startTime = Date.now();
    this.intervalTimer = window.setInterval(() => this.updateGame(), 1000 / this.fps);

    // Generate Maze
    this.mazeService.generateMaze(this.mazeSize)
      .subscribe({
        next: this.updateWall,
        complete: () => { }
      });
  }

  public continue() {
    this.startTime = Date.now();
  }

  public pause() {
    this.gameDuration = Date.now() - this.startTime;
    this.reset();
  }

  public reset() {
    this.gameDuration = 0;
    this.startTime = -1;
    window.clearInterval(this.intervalTimer);
    this.intervalTimer = -1;
  }
}
