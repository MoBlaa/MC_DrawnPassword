import { Rectangle, Vector } from './geometrics';
import { Collidable, Mass } from './physics/collision-detector';

export interface IArea extends Rectangle, Collidable {
    color: string;
    handler: (area: IArea) => void;
    draw: (ctx: CanvasRenderingContext2D) => void;
}

export class Area implements IArea {
    public handler: (area: IArea) => void;
    public collided = false;
    readonly mass = Mass.NONE;

    public constructor(
        public color: string,
        public anchor: Vector,
        public width: number,
        public height: number
    ) { }

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.anchor.x, this.anchor.y, this.width, this.height);
    }
}
