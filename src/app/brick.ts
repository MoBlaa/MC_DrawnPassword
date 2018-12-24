import { Colors } from './colors.enum';
import { Rectangle, Point } from './collision-detection';

export class Brick implements Rectangle {
    public constructor(
        public anchor: Point,
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
