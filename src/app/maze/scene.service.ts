import { Injectable, Renderer2, ApplicationRef } from '@angular/core';
import { MazeGeneratorService } from '../mazegenerator.service';
import { IWall, ICell } from './maze';
import { TouchSequence } from 'selenium-webdriver';
import { DeviceDetectorService } from 'ngx-device-detector';
import { areAllEquivalent } from '@angular/compiler/src/output/output_ast';

const MAX_SPEED = 160;

const COLOR_GREEN = 0x00AA00;
const COLOR_RED = 0xAA0000;

export enum Direction {
  TOP, BOTTOM, LEFT, RIGHT
}

export enum None {
  X = 4, Y = 5
}

enum Orientation {
  VERTICAL, HORIZONTAL
}

@Injectable({
  providedIn: 'root'
})
export class SceneService extends Phaser.Scene {

  platforms: Phaser.Physics.Arcade.StaticGroup;
  platformsWithCords: Map<string, any>;

  player: Phaser.Physics.Arcade.Sprite;

  cursors: any;

  motionX = 0;
  motionY = 0;

  width: number = window.innerWidth;
  height: number = window.innerWidth;

  mazeSize = 10;
  cellSize: number = Math.floor(this.width / this.mazeSize);
  wallSize = Math.floor(this.cellSize / 4);

  end: { draw: () => void, create: () => any };

  areas: Phaser.Physics.Arcade.StaticGroup;

  constructor(
    private renderer: Renderer2,
    private mazeService: MazeGeneratorService,
    private deviceService: DeviceDetectorService
  ) {
    super({ key: 'Scene' });
    this.platformsWithCords = new Map<string, any>();

    this.handleOrientation = this.handleOrientation.bind(this);

    this.renderer.listen(window, 'deviceorientation', this.handleOrientation);
  }

  public preload(): void {
    // Preload some assets
    this.load.image('ground', 'assets/platform.png');
    this.load.image('ball', 'assets/melon.png');
  }

  public create(): void {
    // Initialize the platforms
    this.platforms = this.physics.add.staticGroup();
    this.areas = this.physics.add.staticGroup();

    //// Create the player
    this.player = this.physics.add.sprite(this.cellSize / 2, this.cellSize / 2, 'ball');
    this.player.setDisplaySize(this.cellSize / 3, this.cellSize / 3);

    // It should bounce and onle be in the world
    // this.player.setBounce(1);
    this.player.setCollideWorldBounds(true);

    // It should bounce from the platforms
    this.physics.add.collider(this.player, this.platforms);

    //// Some controls
    this.cursors = this.input.keyboard.createCursorKeys();

    //// Start & End-Area
    this.createArea(0, 0, this.cellSize + this.wallSize / 2, this.cellSize + this.wallSize / 2, COLOR_RED).draw();
    this.end = this.createArea(
      (this.mazeSize - 1) * this.cellSize - this.wallSize / 2,
      (this.mazeSize - 1) * this.cellSize - this.wallSize / 2,
      this.cellSize + this.wallSize,
      this.cellSize + this.wallSize,
      COLOR_GREEN
    );
    this.end.create();
    this.physics.add.overlap(this.areas, this.player, this.finish, null, this);

    //// Generate Maze to add
    this.mazeService.generateMaze(this.mazeSize)
      .subscribe({
        next: (wall) => this.setWall(wall)
      });
  }

  public update() {
    //// Check some controls
    if (this.cursors.left.isDown || this.motionX < 0) {
      this.move(Direction.LEFT);
    } else if (this.cursors.right.isDown || this.motionX > 0) {
      this.move(Direction.RIGHT);
    } else {
      this.move(None.X);
    }

    if (this.cursors.up.isDown || this.motionY < 0) {
      this.move(Direction.TOP);
    } else if (this.cursors.down.isDown || this.motionY > 0) {
      this.move(Direction.BOTTOM);
    } else {
      this.move(None.Y);
    }
  }

  private finish() {
    console.log('Reached the end');
  }

  private createArea(x: number, y: number, width: number, height: number, color: number): { draw: () => void, create: () => any } {
    const draw = () => {
      const rect = new Phaser.Geom.Rectangle(x, y, width, height);
      const graphic = this.add.graphics({
        fillStyle: {
          color,
          alpha: .4
        }
      });
      graphic.alpha.toFixed(0.5);
      graphic.fillRectShape(rect);
    };
    const create = () => {
      const area = this.areas.create(x + width / 2, y + height / 2, null, null, false);
      area.setDisplaySize(width, height);
    };

    return {
      draw,
      create: () => {
        draw();
        create();
      }
    };
  }

  //// Set or unset the given wall depending on its 'present' attribute
  public setWall(wall: IWall) {
    const cellOne = wall.cellOne, cellTwo = wall.cellTwo;

    if (cellOne.x < cellTwo.x) {
      // Draw right wall
      this.setWallOf(cellOne, Direction.RIGHT, wall.present);
    } else if (cellOne.x > cellTwo.x) {
      // Draw left wall
      this.setWallOf(cellOne, Direction.LEFT, wall.present);
    } else {
      // Top or Bottom wall
      if (cellOne.y < cellTwo.y) {
        // Bottom of cellOne
        this.setWallOf(cellOne, Direction.BOTTOM, wall.present);
      } else if (cellOne.y > cellTwo.y) {
        // Top of cellOne
        this.setWallOf(cellOne, Direction.TOP, wall.present);
      } else {
        console.error(`Tried to add a wall between the same cell: x=${cellOne.x}, y=${cellOne.y}`);
      }
    }
  }

  //// Create Wall of a cell in the given direction
  setWallOf(cell: ICell, direction: Direction, present: boolean) {
    const relX = cell.x, relY = cell.y;

    let orientation: Orientation;
    let x = 0;
    let y = 0;
    switch (direction) {
      case Direction.LEFT:
      case Direction.RIGHT: {

        x = (relX * this.cellSize);
        y = (this.cellSize / 2) + (relY * this.cellSize);
        orientation = Orientation.VERTICAL;
        break;
      }
      case Direction.BOTTOM:
      case Direction.TOP: {
        x = (this.cellSize / 2) + (relX * this.cellSize);
        y = (relY * this.cellSize);
        orientation = Orientation.HORIZONTAL;
        break;
      }
    }
    if (present) {
      console.log(`Adding wall @ { x:${relX}, y:${relY} }`);
      this.createPlatform(x, y, orientation);
    } else {
      console.log(`Remove wall @ { x:${relX}, y:${relY} }`);
      this.removePlatform(x, y);
    }
  }

  private removePlatform(absX: number, absY: number) {
    const key = `${absX},${absY}`;
    const platform = this.platformsWithCords.get(key);

    if (platform !== undefined) {
      this.platforms.remove(platform);
      platform.destroy();
      this.platformsWithCords.delete(key);
    } else {
      console.error(`Failed to remove { x: ${absX}, y: ${absY}}`);
    }
  }

  //// Creates a platform which's center is at absolute coordinates (absX, absY) with given orientation.
  private createPlatform(absX: number, absY: number, orientation: Orientation) {
    // In Phaser 3 every object is placed by its center - only x and y of the center is needed
    const platform = this.platforms.create(absX, absY, 'ground');

    switch (orientation) {
      case Orientation.HORIZONTAL: {
        platform.setDisplaySize(this.cellSize, this.wallSize);
        break;
      }
      case Orientation.VERTICAL: {
        platform.setDisplaySize(this.wallSize, this.cellSize + this.wallSize);
        break;
      }
    }

    platform.refreshBody();
    this.platformsWithCords.set(`${absX},${absY}`, platform);
  }

  public move(direction: Direction | None) {
    if (this.deviceService.isDesktop()) {
      this.moveByDefault(direction);
    } else {
      this.moveByOrientation(direction);
    }
  }

  public moveByDefault(direction: Direction | None) {
    switch (direction) {
      case Direction.TOP: {
        this.player.setVelocityY(-MAX_SPEED);
        break;
      }
      case Direction.RIGHT: {
        this.player.setVelocityX(MAX_SPEED);
        break;
      }
      case Direction.BOTTOM: {
        this.player.setVelocityY(MAX_SPEED);
        break;
      }
      case Direction.LEFT: {
        this.player.setVelocityX(-MAX_SPEED);
        break;
      }
      case None.X: {
        this.player.setVelocityX(0);
        break;
      }
      case None.Y: {
        this.player.setVelocityY(0);
        break;
      }
    }
  }

  public moveByOrientation(direction: Direction | None) {
    switch (direction) {
      case Direction.TOP: {
        this.player.setVelocityY(this.motionY);
        break;
      }
      case Direction.RIGHT: {
        this.player.setVelocityX(this.motionX);
        break;
      }
      case Direction.BOTTOM: {
        this.player.setVelocityY(this.motionY);
        break;
      }
      case Direction.LEFT: {
        this.player.setVelocityX(this.motionX);
        break;
      }
      case None.X: {
        this.player.setVelocityX(0);
        break;
      }
      case None.Y: {
        this.player.setVelocityY(0);
        break;
      }
    }
  }

  // Handle orientation
  public handleOrientation(event: DeviceOrientationEvent) {
    const x = Math.floor(event.gamma * 10);
    const y = Math.floor(event.beta * 10);

    if (x < MAX_SPEED || x > -MAX_SPEED) {
      this.motionX = x;
    } else {
      if (x > 0) {
        this.motionX = MAX_SPEED;
      } else {
        this.motionX = -MAX_SPEED;
      }
    }

    if (y < MAX_SPEED || x > -MAX_SPEED) {
      this.motionY = y;
    } else {
      if (y > 0) {
        this.motionY = MAX_SPEED;
      } else {
        this.motionY = -MAX_SPEED;
      }
    }
  }
}
