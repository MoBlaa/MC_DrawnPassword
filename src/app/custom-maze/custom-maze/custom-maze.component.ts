import { Component, ViewChild, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { Colors } from '../../colors.enum';
import { GameService, Direction } from '../../game.service';
import { isNull } from 'util';
import { Brick } from 'src/app/brick';
import { Ball } from 'src/app/ball';
import { IArea, Area } from 'src/app/area';
import { Vector } from 'src/app/geometrics';
import { GameState, GameStateService } from 'src/app/game-state.service';

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
    const offset = this.gameService.cellSize / 4;
    const areaSize = this.gameService.cellSize - 2 * offset;
    this.startArea = new Area(Colors.RED, { x: offset, y: offset }, areaSize, areaSize);
    const endAnchor: Vector = {
      x: this.gameService.gameSize - this.gameService.cellSize + offset,
      y: this.gameService.gameSize - this.gameService.cellSize + offset
    };
    this.endArea = new Area(Colors.GREEN, endAnchor, areaSize, areaSize);

    this.gameService.setup({
      init: this.init,
      update: this.update,
      start: this.startArea,
      end: this.endArea
    });
  }

  public init(ball: Ball, walls: Array<Brick>) {
    const ctx: CanvasRenderingContext2D = this.canvas.nativeElement.getContext('2d');
    ball.draw(ctx);
    walls.forEach(wall => wall.draw(ctx));
  }

  public update(ball: Ball, walls: Array<Brick>) {
    // Move ball if key pressed
    const ctx: CanvasRenderingContext2D = this.canvas.nativeElement.getContext('2d');

    // Clear the board
    ctx.fillStyle = Colors.WHITE;
    ctx.fillRect(0, 0, 4000, 4000);

    // Draw walls
    walls.forEach(wall => wall.draw(ctx));

    // Draw start and End-Area
    this.startArea.draw(ctx);
    this.endArea.draw(ctx);

    // Update the Ball
    ball.draw(ctx);
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
