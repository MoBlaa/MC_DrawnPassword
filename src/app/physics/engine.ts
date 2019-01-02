import { Colors } from '../colors.enum';
import { Vector, Circle, Rectangle } from '../geometrics';
import { rectangleCircle } from './collision-detection';

export interface Size {
    height: number;
    width: number;
}

export enum EntityType {
    POINT, LINE, RECTANGLE, CIRCLE
}

export abstract class IEntity<D> {
    // Velocity
    public v: Vector = { x: 0, y: 0 };
    // Acceleration
    public a: Vector = { x: 0, y: 0 };
    public color = Colors.GREY;

    protected dimensions: D;

    public constructor(
        public type: EntityType,
        dimension: D
    ) {
        this.setDimension(dimension);
    }

    public getDimension(): D {
        return this.dimensions;
    }
    abstract setDimension(dimension: D): void;
    abstract draw(ctx: CanvasRenderingContext2D): void;
}

export class ICircleEntity extends IEntity<Circle> {
    public constructor(
        dimension: Circle
    ) {
        super(EntityType.CIRCLE, dimension);
    }

    setDimension(dimension: Circle): void {
        this.dimensions = dimension;
    }
    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(
            this.dimensions.position.x,
            this.dimensions.position.y,
            this.dimensions.radius,
            0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    }
}

export class IRectangleEntity extends IEntity<Rectangle> {
    public constructor(
        dimension: Rectangle
    ) {
        super(EntityType.RECTANGLE, dimension);
    }

    setDimension(dim: Rectangle): void {
        this.dimensions = dim;
    }
    public draw(ctx?: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.color;
        ctx.fillRect(
            this.dimensions.anchor.x,
            this.dimensions.anchor.y,
            this.dimensions.width,
            this.dimensions.height
        );
    }
}

export class Engine {
    private lastUpdated: number;
    private entities = new Set<IRectangleEntity>();
    private timer: number = null;
    private fps = 30;

    public constructor(
        private player: ICircleEntity
    ) {
        this.lastUpdated = Date.now();
        this.update = this.update.bind(this);
        this.timed = this.timed.bind(this);
    }

    private timed(): void {
        if (this.timer !== null) {
            window.clearTimeout(this.timer);
        }
        this.timer = window.setTimeout(this.update, 1000 / this.fps);
    }
    private update(): void {
        // Update Positions
        this.updatePositions();
        // Collision Detection
        this.entities.forEach(wall => {
            if (detectCollision(this.player.getDimension(), wall.getDimension())) {
                // Collision Resolving
            }
        });
        this.timed();
    }

    public updatePosition(entity: IEntity<any>, time: number): void {
        entity.v = {
            x: entity.a.x * time + entity.v.x,
            y: entity.a.y * time + entity.v.y
        };
        entity.setDimension({
            x: entity.v.x * time + entity.getDimension().x,
            y: entity.v.y * time + entity.getDimension().y
        });
    }
    public addEntity(entity: IEntity<any>): void {
        this.entities.add(entity);
    }
    public updatePositions(): void {
        const time = Date.now() - this.lastUpdated;
        this.lastUpdated = Date.now();
        this.updatePosition(this.player, time);
    }
}

export function detectCollision(player: Circle, wall: Rectangle): boolean {
    return rectangleCircle(wall, player);
}