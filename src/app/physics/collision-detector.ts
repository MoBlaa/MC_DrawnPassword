import { Ball } from '../ball';
import { Circle, rectangleCircle, Rectangle, Vector } from './collision-detection';

export class CollisionDetector<C extends Rectangle> {
    constructor(
        private ball: Ball,
        private walls: Array<C>
    ) { }

    /**
     * Returns if [horizontal, vertical] overlapping has happened.
     */
    perform(changes: Vector): [C, C] {
        // Check if Ball collides with wall
        const ballCords = this.ball.position;
        const ballR = this.ball.radius;
        const overlapping: [C, C] = [null, null];
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
                overlapping[0] = wall;
            }
            if (collidesY) {
                overlapping[1] = wall;
            }

            wallRes = wallIter.next();
        }
        return overlapping;
    }
}
