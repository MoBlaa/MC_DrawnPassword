import { Component, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Colors } from '../../colors.enum';
import { GameService, Direction} from '../../game.service';

export interface Cords {
  x: number;
  y: number;
}

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

  constructor(
    private gameService: GameService
  ) {
    this.update = this.update.bind(this);

    this.gameService.update = this.update;
  }

  public update() {
    // Move ball if key pressed
    const ctx: CanvasRenderingContext2D = this.canvas.nativeElement.getContext('2d');
    ctx.fillStyle = Colors.WHITE;
    ctx.fillRect(0, 0, 4000, 4000);

    const bricks = this.gameService.getWalls();
    // Draw walls
    bricks.forEach((brick) => brick.draw(ctx));

    // Update the UI
    this.gameService.getBall().draw(ctx);
  }

  @HostListener('window:keydown', ['$event'])
  keydown(event: KeyboardEvent) {
    if (event.keyCode === KeyCode.TOP_ARROW) {
      this.gameService.move(Direction.NORTH);
    } else if (event.keyCode === KeyCode.DOWN_ARROW) {
      this.gameService.move(Direction.SOUTH);
    } else if (event.keyCode === KeyCode.LEFT_ARROW) {
      this.gameService.move(Direction.WEST);
    } else if (event.keyCode === KeyCode.RIGHT_ARROW) {
      this.gameService.move(Direction.EAST);
    }
  }

  @HostListener('window:keyup', ['$event'])
  keyup(event: KeyboardEvent) {
    if (event.keyCode === KeyCode.TOP_ARROW || event.keyCode === KeyCode.DOWN_ARROW) {
      this.gameService.move(Direction.NONEY);
    } else if (event.keyCode === KeyCode.LEFT_ARROW || event.keyCode === KeyCode.RIGHT_ARROW) {
      this.gameService.move(Direction.NONEX);
    }
  }

}
