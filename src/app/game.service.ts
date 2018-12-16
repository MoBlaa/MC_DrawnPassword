import { Injectable } from '@angular/core';
import { Ball } from './ball';
import { Cords } from './custom-maze/custom-maze.component';

export enum Direction {
  NORTH, EAST, SOUTH, WEST, NONEX, NONEY
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

  public update: () => void;
  public ball: Ball;

  constructor() {
    this.movement = {
      x: 0, y: 0
    };
  }

  public getTimePlayed(): number {
    return this.gameDuration;
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

  public start() {
    this.gameDuration = 0;
    this.startTime = Date.now();
    this.intervalTimer = window.setInterval(() => this.updateGame(), 1000 / this.fps);
  }

  public updateGame() {
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
    console.log(`Updating to { x: ${updating.x}, y: ${updating.y} }`);
    if (updating.x !== 0 || updating.y !== 0) {
      this.ball.updatePosition(updating.x, updating.y);
      console.log('Moving');
    } else {
      console.log('Not Moving');
    }
    this.update();
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
