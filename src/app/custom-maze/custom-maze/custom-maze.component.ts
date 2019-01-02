import { Component, ViewChild, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { Colors } from '../../colors.enum';
import { GameService, Direction } from '../../game.service';
import { isNull } from 'util';
import { Brick } from 'src/app/brick';
import { Ball } from 'src/app/ball';
import { IArea, Area } from 'src/app/area';
import { Vector } from 'src/app/geometrics';

enum KeyCode {
  RIGHT_ARROW = 39,
  LEFT_ARROW = 37,
  TOP_ARROW = 38,
  DOWN_ARROW = 40
}

@Component({
  selector: 'app-custom-maze',
  templateUrl: './custom-maze.component.html',
  styleUrls: ['./custom-maze.component.scss']
})
export class CustomMazeComponent {

  @ViewChild('board') canvas: ElementRef;
  oldBall: Ball = null;

  startArea: IArea;
  endArea: IArea;

  constructor(
    private gameService: GameService,
    renderer: Renderer2
  ) {
    this.handleAcceleration = this.handleAcceleration.bind(this);

    this.update = this.update.bind(this);
    this.init = this.init.bind(this);

    renderer.listen('window', 'deviceorientation', this.handleAcceleration);

    // Init areas
    const areaSize = this.gameService.cellSize;
    this.startArea = new Area(Colors.RED, { x: 0, y: 0}, areaSize, areaSize);
    const endAnchor: Vector = {
      x: this.gameService.gameSize - this.gameService.cellSize,
      y: this.gameService.gameSize - this.gameService.cellSize
    };
    this.endArea = new Area(Colors.GREEN, endAnchor, areaSize, areaSize);

    this.gameService.setup({
      init: this.init,
      update: this.update,
      start: this.startArea,
      end: this.endArea
    });
  }

  public getMovement(): Vector {
    return this.gameService.getMovement();
  }

  public init(walls: Array<Brick>) {
    const ctx: CanvasRenderingContext2D = this.canvas.nativeElement.getContext('2d');

    // Clear the board
    ctx.fillStyle = Colors.WHITE;
    ctx.fillRect(0, 0, 4000, 4000);

    // Draw walls
    walls.forEach(wall => wall.draw(ctx));
  }

  public update(ball: Ball) {
    // Move ball if key pressed
    const ctx: CanvasRenderingContext2D = this.canvas.nativeElement.getContext('2d');

    // Clear old position
    if (this.oldBall != null) {
      this.oldBall.draw(ctx);
    }

    // Draw start and End-Area
    this.startArea.draw(ctx);
    this.endArea.draw(ctx);

    // Update the Ball
    ball.draw(ctx);
    this.oldBall = new Ball(ball.position.x, ball.position.y, ball.radius + 1, Colors.WHITE);
  }

  handleAcceleration(event: DeviceOrientationEvent) {
    const movement = {
      beta: event.beta, gamma: event.gamma
    };
    if (!isNull(movement.beta) && !isNull(movement.gamma)) {
      this.gameService.moveByAcceleration(movement);
    }
  }

  @HostListener('window:keydown', ['$event'])
  keydown(event: KeyboardEvent) {
    if (event.keyCode === KeyCode.TOP_ARROW) {
      this.gameService.moveByDirection(Direction.NORTH);
    } else if (event.keyCode === KeyCode.DOWN_ARROW) {
      this.gameService.moveByDirection(Direction.SOUTH);
    } else if (event.keyCode === KeyCode.LEFT_ARROW) {
      this.gameService.moveByDirection(Direction.WEST);
    } else if (event.keyCode === KeyCode.RIGHT_ARROW) {
      this.gameService.moveByDirection(Direction.EAST);
    }
  }

  @HostListener('window:keyup', ['$event'])
  keyup(event: KeyboardEvent) {
    if (event.keyCode === KeyCode.TOP_ARROW || event.keyCode === KeyCode.DOWN_ARROW) {
      this.gameService.moveByDirection(Direction.NONEY);
    } else if (event.keyCode === KeyCode.LEFT_ARROW || event.keyCode === KeyCode.RIGHT_ARROW) {
      this.gameService.moveByDirection(Direction.NONEX);
    }
  }

}
