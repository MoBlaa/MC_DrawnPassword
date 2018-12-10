import { Injectable, Renderer2 } from '@angular/core';
import { MazeService } from './maze.service';
import { IWall, ICell, Wall } from './maze';
import { Observable, of } from 'rxjs';
import { delay, timeout, mergeAll } from 'rxjs/operators';

const TOLERANCE = 2;

export enum Direction {
  TOP, BOTTOM, LEFT, RIGHT
}

export enum None {
  X, Y
}

enum Orientation {
  VERTICAL, HORIZONTAL
}

@Injectable({
  providedIn: 'root'
})
export class SceneService extends Phaser.Scene {
  direction: [boolean, boolean, boolean, boolean];

  platforms: Phaser.Physics.Arcade.StaticGroup;

  player: Phaser.Physics.Arcade.Sprite;

  cursors: any;

  motionX = 0;
  motionY = 0;

  width: number = window.innerWidth;
  height: number = window.innerWidth;

  mazeSize = 10;
  cellSize: number = this.width / this.mazeSize;

  constructor(
    private renderer: Renderer2,
    private mazeService: MazeService
  ) {
    super({ key: 'Scene' });
    this.direction = [false, false, false, false];

    this.handleOrientation = this.handleOrientation.bind(this);

    this.renderer.listen(window, 'deviceorientation', this.handleOrientation);
  }

  public preload(): void {
    // Preload some assets
    this.load.image('ground', 'assets/platform.png');
    this.load.spritesheet('dude',
      'assets/dude.png',
      { frameWidth: 32, frameHeight: 48 }
    );
  }

  public create(): void {
    // Initialize the platforms
    this.platforms = this.physics.add.staticGroup();

    //// Create the player
    this.player = this.physics.add.sprite(window.innerWidth / 2, window.innerHeight / 3, 'dude');
    this.player.setDisplaySize(14, 14);

    // It should bounce and onle be in the world
    this.player.setBounce(0.3);
    this.player.setCollideWorldBounds(true);

    // It should bounce from the platforms
    this.physics.add.collider(this.player, this.platforms);

    //// Some controls
    this.cursors = this.input.keyboard.createCursorKeys();

    //// Generate Maze to add
    const walls: Array<IWall> = [];
    this.mazeService.generateMaze(this.mazeSize).subscribe({
      next: (wall) => walls.push(wall),
      complete: () => {
        const obss: Array<Observable<IWall>> = [];
        for (let i = 0; i < walls.length; i++) {
          const wall = walls[i];
          obss.push(of(wall).pipe(delay(i * 10)));
        }
        of(obss).pipe(mergeAll()).subscribe((obsWall) => obsWall.subscribe((wall => this.setWall(wall))));
      }
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

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }
  }

  //// Set or unset the given wall depending on its 'present' attribute
  public setWall(wall: IWall) {
    if (wall.present) {
      const cellOne = wall.cellOne, cellTwo = wall.cellTwo;

      if (cellOne.x < cellTwo.x) {
        // Draw right wall
        this.createWallOf(cellOne, Direction.RIGHT);
      } else if (cellOne.x > cellTwo.x) {
        // Draw left wall
        this.createWallOf(cellOne, Direction.LEFT);
      } else {
        // Top or Bottom wall
        if (cellOne.y < cellTwo.y) {
          // Bottom of cellOne
          this.createWallOf(cellOne, Direction.BOTTOM);
        } else if (cellOne.y > cellTwo.y) {
          // Top of cellOne
          this.createWallOf(cellOne, Direction.TOP);
        } else {
          console.error(`Tried to add a wall between the same cell: x=${cellOne.x}, y=${cellOne.y}`);
        }
      }
    } else {
      // Remove Wall
      
    }
  }

  //// Create Wall of a cell in the given direction
  createWallOf(cell: ICell, direction: Direction) {
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
    console.log(`Adding wall @ { x:${relX}, y:${relY} }`);
    this.createPlatform(x, y, orientation);
  }

  //// Creates a platform which's center is at absolute coordinates (absX, absY) with given orientation.
  private createPlatform(absX: number, absY: number, orientation: Orientation) {
    // In Phaser 3 every object is placed by its center - only x and y of the center is needed
    const platform = this.platforms.create(absX, absY, 'ground');

    switch (orientation) {
      case Orientation.HORIZONTAL: {
        platform.setDisplaySize(this.cellSize, 2);
        break;
      }
      case Orientation.VERTICAL: {
        platform.setDisplaySize(2, this.cellSize);
        break;
      }
    }

    platform.refreshBody();
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
