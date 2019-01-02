import { Colors } from './colors.enum';
import { Collidable, Mass } from './physics/collision-detector';
import { Rectangle, Vector } from './geometrics';

export class Brick implements Rectangle, Collidable {
    readonly mass = Mass.NORMAL;

    public constructor(
        public anchor: Vector,
        public width: number,
        public height: number,
        public collided = false
    ) { }

    public draw(ctx: CanvasRenderingContext2D) {
        let color = Colors.GREY;
        if (this.collided) {
            color = Colors.GREEN;
            setTimeout(() => this.collided = false, 1000);
        }

        ctx.fillStyle = color;
        ctx.fillRect(this.anchor.x, this.anchor.y, this.width, this.height);
    }
}
