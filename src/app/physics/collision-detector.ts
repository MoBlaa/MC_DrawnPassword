import { Ball } from '../ball';
import { Rectangle, Vector, Circle } from '../geometrics';
import { rectangleCircle } from './collision-detection';

export enum Mass {
    NONE = 0,
    NORMAL = 1
}

export interface Collidable {
    collided: boolean;
    mass: number;
}

export type Colli = Collidable & Rectangle;

export class CollisionDetector {
    constructor(
        private ball: Ball,
        private walls: Array<Colli>
    ) { }

    /**
     * Returns if [horizontal, vertical] overlapping has happened.
     */
    perform(changes: Vector): [ Array<Colli>, Array<Colli>] {
        // Check if Ball collides with wall
        const ballCords = this.ball.position;
        const ballR = this.ball.radius;
        const overlapping: [ Array<Colli>, Array<Colli>] = [[], []];
        const ballMoved: Circle = {
            position: {
                x: ballCords.x + changes.x,
                y: ballCords.y + changes.y
            },
            radius: ballR
        };
        const ballMovedX: Circle = {
            position: {
                x: ballCords.x + changes.x,
                y: ballCords.y
            },
            radius: ballR
        };
        const ballMovedY: Circle = {
            position: {
                x: ballCords.x,
                y: ballCords.y + changes.y
            },
            radius: ballR
        };
        const wallIter = this.walls[Symbol.iterator]();
        let wallRes = wallIter.next();
        while (!wallRes.done) {
            const wall = wallRes.value;

            // Collision Detection with wall and ball
            const collidesX = rectangleCircle(wall, ballMovedX);
            const collidesY = rectangleCircle(wall, ballMovedY);

            if (collidesX) {
                overlapping[0].push(wall);
            }
            if (collidesY) {
                overlapping[1].push(wall);
            }

            wallRes = wallIter.next();
        }
        return overlapping;
    }
}
