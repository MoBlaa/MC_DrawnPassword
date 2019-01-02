import { Colors } from './colors.enum';
import { Circle, Vector } from './geometrics';
import { Collidable, Mass } from './physics/collision-detector';

export class Ball implements Circle, Collidable {
  mass = Mass.NORMAL;

  position: Vector;
  radius: number;
  color: string;
  collided = false;

  constructor(x: number, y: number, radius: number, color = Colors.GREY) {
    this.position = { x, y };
    this.radius = radius;
    this.color = color;

    this.draw = this.draw.bind(this);
  }

  public updatePosition(x: number, y: number) {
    this.position = { x: this.position.x + x, y: this.position.y + y };
  }

  /**
   * @param x Marks the center of the ball horizontally
   * @param y Marks the center of the ball vertically
   * @param ctx Context to draw into
   */
  public draw(ctx?: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
  }
}
