import { Ball } from './ball';
import { Circle, rectangleCircle, Rectangle } from './collision-detection';
import { Cords } from './custom-maze/custom-maze/custom-maze.component';

export class CollisionDetector<C extends Rectangle> {
    constructor(
        private ball: Ball,
        private walls: Array<C>
    ) { }

    /**
     * Returns if [horizontal, vertical] overlapping has happened.
     */
    perform(changes: Cords): [C, C] {
        // Check if Ball collides with wall
        const ballCords = this.ball.getPosition();
        const ballR = this.ball.getRadius();
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
        while (!wallRes.done && overlapping[0] === null && overlapping[1] === null) {
            const wall = wallRes.value;

            // Collision Detection with wall and ball
            const collidesBoth = rectangleCircle(wall, ballMoved);
            const collidesX = rectangleCircle(wall, ballMovedX);
            const collidesY = rectangleCircle(wall, ballMovedY);

            if (collidesBoth) {
                if (collidesX) {
                    overlapping[0] = wall;
                }
                if (collidesY) {
                    overlapping[1] = wall;
                }
            }

            wallRes = wallIter.next();
        }
        return overlapping;
    }
}
