import { Injectable, Renderer2, ApplicationRef } from '@angular/core';
import { MazeService } from './maze.service';
import { IWall, ICell } from './maze';

const TOLERANCE = 3;

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
  cellSize: number = this.width / this.mazeSize;
  wallSize = this.cellSize / 10;

  constructor(
    private renderer: Renderer2,
    private mazeService: MazeService
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

    //// Create the player
    this.player = this.physics.add.sprite(16, 16, 'ball');
    this.player.setDisplaySize(this.cellSize / 4, this.cellSize / 4);

    // It should bounce and onle be in the world
    this.player.setCollideWorldBounds(true);

    // It should bounce from the platforms
    this.physics.add.collider(this.player, this.platforms);

    //// Some controls
    this.cursors = this.input.keyboard.createCursorKeys();

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
        platform.setDisplaySize(this.cellSize + this.wallSize, this.wallSize);
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
    switch (direction) {
      case Direction.TOP: {
        this.player.setVelocityY(-160);
        break;
      }
      case Direction.RIGHT: {
        this.player.setVelocityX(160);
        break;
      }
      case Direction.BOTTOM: {
        this.player.setVelocityY(160);
        break;
      }
      case Direction.LEFT: {
        this.player.setVelocityX(-160);
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
    const x = event.gamma;
    const y = event.beta;

    if (x > TOLERANCE) {
      this.motionX = 1;
    } else if (x < -TOLERANCE) {
      this.motionX = -1;
    } else {
      this.motionX = 0;
    }

    if (y > TOLERANCE) {
      this.motionY = 1;
    } else if (y < -TOLERANCE) {
      this.motionY = -1;
    } else {
      this.motionY = 0;
    }
  }
}
