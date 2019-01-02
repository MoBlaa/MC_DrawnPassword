import { Injectable } from '@angular/core';
import { Ball } from './ball';
import { MazeGeneratorService } from './mazegenerator.service';
import { CollisionDetector, Mass } from './physics/collision-detector';
import { Brick } from './brick';
import { IWall, toKey } from './maze';
import { Vector, Rectangle } from './geometrics';
import { IArea, Area, isArea } from './area';

export enum Direction {
  NORTH, EAST, SOUTH, WEST, NONEX, NONEY
}

const MAX_MOVEMENT = 100;

export interface IGameServiceConfig {
  init: (walls: Array<Brick>) => void;
  update: (ball: Ball, walls: Array<Brick>) => void;
  start: IArea;
  end: IArea;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private startTime: number;
  private fps = 30;
  private intervalTimer: number;

  private movement: Vector;

  readonly gameSize = 4000;
  readonly mazeSize = 20;
  readonly cellSize = this.gameSize / this.mazeSize;
  readonly wallWidth = 20;

  private walls: Set<Brick>;
  private startArea: IArea;
  private endArea: IArea;
  private ball: Ball;

  // Initializes the bricks
  private init: (walls: Array<Brick>) => void;
  // Updates the ball position
  private update: (ball: Ball, walls: Array<Brick>) => void;
  // Handler for reaching the goal
  public finished: () => void = () => { };

  constructor(
    private mazeService: MazeGeneratorService
  ) {
    this.movement = {
      x: 0, y: 0
    };
    this.walls = new Set<Brick>();
    this.startTime = -1;

    this.update = () => { };

    this.updateWall = this.updateWall.bind(this);
    this.stop = this.stop.bind(this);
    this.start = this.start.bind(this);
  }

  public setup(config: IGameServiceConfig): void {
    // Init the Service with given config
    this.init = config.init;
    this.update = config.update;
    this.startArea = config.start;
    this.endArea = config.end;

    // Add handlers for start and End-Area
    this.endArea.handler = () => {
      console.log('Finished');
      this.finished();
    };
  }

  public getStartTime(): number {
    return this.startTime;
  }

  public getWalls(): Array<Brick> {
    return Array.from(this.walls.values());
  }

  public getBall(): Ball {
    return this.ball;
  }

  public getMovement(): Vector {
    return this.movement;
  }

  public moveByAcceleration(accel: { beta: number, gamma: number }) {
    this.movement.x = accel.gamma;
    this.movement.y = accel.beta;

    if (this.movement.x > MAX_MOVEMENT) {
      this.movement.x = MAX_MOVEMENT;
    }
    if (this.movement.y > MAX_MOVEMENT) {
      this.movement.y = MAX_MOVEMENT;
    }
  }

  public moveByDirection(direction: Direction) {
    switch (direction) {
      case Direction.NORTH: {
        this.movement.y = -MAX_MOVEMENT;
        break;
      }
      case Direction.EAST: {
        this.movement.x = MAX_MOVEMENT;
        break;
      }
      case Direction.SOUTH: {
        this.movement.y = MAX_MOVEMENT;
        break;
      }
      case Direction.WEST: {
        this.movement.x = -MAX_MOVEMENT;
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
    const cords = this.ball.position;
    const updating: Vector = { x: this.movement.x, y: this.movement.y };
    if (cords.x + this.movement.x + this.ball.radius > this.gameSize) {
      updating.x = this.gameSize - this.ball.radius - cords.x;
    } else if (cords.x + this.movement.x - this.ball.radius < 0) {
      updating.x = -(cords.x - this.ball.radius);
    }
    if (cords.y + this.movement.y + this.ball.radius > this.gameSize) {
      updating.y = this.gameSize - this.ball.radius - cords.y;
    } else if (cords.y + this.movement.y - this.ball.radius < 0) {
      updating.y = -(cords.y - this.ball.radius);
    }
    if (!(updating.x === 0 && updating.y === 0)) {
      // Collision Detection
      // Perform Collision Detection with walls
      const cd = new CollisionDetector(this.ball, [...this.getWalls(), this.endArea]);
      const [hColl, vColl] = cd.perform(updating);

      if (hColl !== null) {
        hColl.forEach(e => {
          e.collided = true;
          if (isArea(e)) {
            e.handler(e);
          }
        });
        if (hColl.some(w => w.mass === Mass.NORMAL)) {
          updating.x = 0;
        }
      }
      if (vColl !== null) {
        vColl.forEach(e => {
          e.collided = true;
          if (isArea(e)) {
            e.handler(e);
          }
        });
        if (vColl.some(w => w.mass === Mass.NORMAL)) {
          updating.y = 0;
        }
      }

      this.ball.updatePosition(updating.x, updating.y);
    } else {
      // console.log('Not Moving');
    }

    // Call callback method to update UI
    this.update(this.ball, this.getWalls());
  }

  private updateWall(wall: IWall) {
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
    const brick = new Brick({ x, y }, width, height);

    const id = toKey({ x, y });

    const duplicate = Array.from(this.walls.values())
      .filter(b => {
        return b.anchor.x === x && b.anchor.y === y &&
          b.height === height && b.width === width;
      }).pop();

    if (wall.present) {
      // Check if wall already exists
      if (duplicate) {
        console.log(`Overwriting existing wall @ ${id}`);
        this.walls.delete(duplicate);
      } else {
        this.walls.add(brick);
      }
    } else {
      this.walls.delete(duplicate);
    }
  }

  // ========== Game Controls ==========

  public start() {
    this.stop();
    this.ball = new Ball(this.cellSize / 2, this.cellSize / 2, this.cellSize / 4);
    this.startTime = Date.now();

    // Generate Maze
    this.mazeService.generateMaze(this.mazeSize)
      .subscribe({
        next: this.updateWall,
        complete: () => {
          console.log('Initialized the maze, starting the game-loop now');
          this.init(this.getWalls());
          this.intervalTimer = window.setInterval(() => this.updateGame(), 1000 / this.fps);
        }
      });
  }

  public stop() {
    this.startTime = -1;
    window.clearInterval(this.intervalTimer);
    this.intervalTimer = -1;
    this.walls.clear();
    this.ball = null;
  }
}
