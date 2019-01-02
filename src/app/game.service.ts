import { Injectable } from '@angular/core';
import { Ball } from './ball';
import { MazeGeneratorService } from './mazegenerator.service';
import { CollisionDetector, Mass } from './physics/collision-detector';
import { Brick } from './brick';
import { IWall, toKey } from './maze';
import { Vector, Rectangle } from './geometrics';
import { IArea, Area, isArea } from './area';
import { GameStateService } from './game-state.service';

export enum Direction {
  NORTH, EAST, SOUTH, WEST, NONEX, NONEY
}

const MAX_MOVEMENT = 50;
const MAX_ACCELERATION = 90;
const BALL_INERTIA = 3.5;

export interface IGameServiceConfig {
  init: (ball: Ball, walls: Array<Brick>) => void;
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

  private lastUpdated: number;

  private acceleration: Vector = { x: 0, y: 0 };
  private velocity: Vector = { x: 0, y: 0 };

  readonly gameSize: number;
  readonly mazeSize: number;
  readonly cellSize: number;
  readonly wallWidth: number;

  private walls: Set<Brick>;
  private startArea: IArea;
  private endArea: IArea;
  private ball: Ball;

  // Initializes the bricks
  private init: (ball: Ball, walls: Array<Brick>) => void;
  // Updates the ball position
  private update: (ball: Ball, walls: Array<Brick>) => void;
  // Handler for reaching the goal
  public finished: () => void = () => { };

  constructor(
    private mazeService: MazeGeneratorService
  ) {
    this.gameSize = 4000;
    this.mazeSize = 20;
    this.cellSize = this.gameSize / this.mazeSize;
    this.wallWidth = 20;

    this.walls = new Set<Brick>();
    this.ball = new Ball(this.cellSize / 2, this.cellSize / 2, this.cellSize / 4);

    this.startTime = -1;

    this.update = () => {};
    this.init = () => {};

    this.updateGame = this.updateGame.bind(this);
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

  public moveByAcceleration(accel: { beta: number, gamma: number }) {
    this.acceleration.x = accel.gamma ? accel.gamma * 1.5 : 0;
    this.acceleration.y = accel.beta ? accel.beta * 1.5 : 0;

    // We dont want the device upside down so we limit to 90°
    if (this.acceleration.x > MAX_ACCELERATION) {
      this.acceleration.x = MAX_ACCELERATION;
    } else if (this.acceleration.x < -MAX_ACCELERATION) {
      this.acceleration.x = -MAX_ACCELERATION;
    }

    if (this.acceleration.y > MAX_ACCELERATION) {
      this.acceleration.y = MAX_ACCELERATION;
    } else if (this.acceleration.y < -MAX_ACCELERATION) {
      this.acceleration.y = -MAX_ACCELERATION;
    }
  }

  public moveByDirection(direction: Direction) {
    switch (direction) {
      case Direction.NORTH: {
        this.acceleration.y = -MAX_MOVEMENT;
        break;
      }
      case Direction.EAST: {
        this.acceleration.x = MAX_MOVEMENT;
        break;
      }
      case Direction.SOUTH: {
        this.acceleration.y = MAX_MOVEMENT;
        break;
      }
      case Direction.WEST: {
        this.acceleration.x = -MAX_MOVEMENT;
        break;
      }
      case Direction.NONEX: {
        this.acceleration.x = 0;
        break;
      }
      case Direction.NONEY: {
        this.acceleration.y = 0;
      }
    }
  }

  public updateGame() {
    if (!this.velocity.x) {
      this.velocity.x = 0;
    }
    if (!this.velocity.y) {
      this.velocity.y = 0;
    }

    // Calculate the passed time
    const now = Date.now();
    const t = (now - this.lastUpdated) / 100;

    // Calculate velocity
    this.velocity.x += ((this.acceleration.x * t) * 3);
    this.velocity.y += ((this.acceleration.y * t) * 3);

    const updating: Vector = {
      x: this.velocity.x * t,
      y: this.velocity.y * t
    };

    if (updating.x > MAX_MOVEMENT) {
      updating.x = MAX_MOVEMENT;
    } else if (updating.x < -MAX_MOVEMENT) {
      updating.x = -MAX_MOVEMENT;
    }
    if (updating.y > MAX_MOVEMENT) {
      updating.y = MAX_MOVEMENT;
    } else if (updating.y < -MAX_MOVEMENT) {
      updating.y = -MAX_MOVEMENT;
    }

    // Re-calc Ball Position
    const cords: Vector = { ...this.ball.position };
    if (cords.x + updating.x + this.ball.radius > this.gameSize) {
      updating.x = this.gameSize - this.ball.radius - cords.x;
    } else if (cords.x + updating.x - this.ball.radius < 0) {
      updating.x = -(cords.x - this.ball.radius);
    }
    if (cords.y + updating.y + this.ball.radius > this.gameSize) {
      updating.y = this.gameSize - this.ball.radius - cords.y;
    } else if (cords.y + updating.y - this.ball.radius < 0) {
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
          this.velocity.x *= -(1 / BALL_INERTIA);
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
          this.velocity.y *= -(1 / BALL_INERTIA);
        }
      }

      this.ball.updatePosition(updating.x, updating.y);
    } else {
      console.log('Not Moving');
    }

    console.log(`Ball: ${JSON.stringify(this.ball)}`);

    // Call callback method to update UI
    this.update(this.ball, this.getWalls());

    this.lastUpdated = Date.now();
  }

  private updateWall(wall: { cellOne: Vector, cellTwo: Vector, present: boolean }) {
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
    this.ball = new Ball(this.cellSize / 2, this.cellSize / 2, this.cellSize / 4);
    this.startTime = Date.now();

    // Generate Maze
    this.mazeService.generateMaze(this.mazeSize)
      .subscribe({
        next: this.updateWall,
        complete: () => {
          // Add walls to limit the board
          for (let x = 0; x < this.mazeSize; x++) {
            // top
            this.updateWall({
              cellOne: {
                x, y: -1
              },
              cellTwo: {
                x, y: 0
              },
              present: true
            });
            // bottom
            this.updateWall({
              cellOne: { x, y: this.mazeSize - 1 },
              cellTwo: { x, y: this.mazeSize },
              present: true
            });
            // Left
            this.updateWall({
              cellOne: { x: -1, y: x },
              cellTwo: { x: 0, y: x },
              present: true
            });
            // Right
            this.updateWall({
              cellOne: { x: this.mazeSize - 1, y: x },
              cellTwo: { x: this.mazeSize, y: x },
              present: true
            });
          }
          console.log('Initialized the maze, starting the game-loop now');
          this.init(this.ball, this.getWalls());
          this.intervalTimer = window.setInterval(() => this.updateGame(), 1000 / this.fps);
        }
      });
  }

  public stop() {
    this.startTime = -1;
    window.clearInterval(this.intervalTimer);
    this.intervalTimer = -1;
    this.walls.clear();
  }
}
