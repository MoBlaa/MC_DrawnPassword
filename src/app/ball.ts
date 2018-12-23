import { Cords } from './custom-maze/custom-maze/custom-maze.component';
import { Colors } from './colors.enum';
import { Circle } from './collision-detection';

export class Ball implements Circle {

  position: Cords;
  radius: number;

  constructor(x: number, y: number, radius: number) {
    this.position = { x, y };
    this.radius = radius;
  }

  public getPosition(): Cords {
    return { x: this.position.x, y: this.position.y };
  }

  public getRadius(): number {
    return this.radius;
  }

  public updatePosition(x: number, y: number) {
    this.position = { x: this.position.x + x, y: this.position.y + y };
  }

  public updateSize(radius: number) {
    this.radius = radius;
  }

  /**
   * @param x Marks the center of the ball horizontally
   * @param y Marks the center of the ball vertically
   * @param ctx Context to draw into
   */
  public draw(ctx?: CanvasRenderingContext2D) {
    ctx.fillStyle = Colors.GREY;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
  }
}
