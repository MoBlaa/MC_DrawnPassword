import { Ball } from './ball';
import { Brick } from './game.service';
import { Cords } from './custom-maze/custom-maze.component';

interface Range {
  min: number;
  max: number;
}

export function between(x: number, min: number, max: number): boolean {
  return x >= min && x <= max;
}

export function inside(x: number, range: Range) {
  return between(x, range.min, range.max);
}

export function overlaps(rangeOne: Range, rangeTwo: Range): boolean {
  return inside(rangeOne.min, rangeTwo) ||
    inside(rangeOne.max, rangeTwo) ||
    inside(rangeTwo.min, rangeOne) ||
    inside(rangeTwo.max, rangeOne);
}

export class CollisionDetection {
  constructor(
    private ball: Ball,
    private walls: Array<Brick>
  ) { }

  /**
   * Returns if [horizontal, vertical] overlapping has happened.
   */
  perform(changes: Cords): [boolean, boolean] {
    // Check if Ball collides with wall
    const ballCords = this.ball.getPosition();
    const ballR = this.ball.getRadius();
    const overlapping: [boolean, boolean] = [false, false];
    const hBallRange: Range = {
      min: ballCords.x - ballR,
      max: ballCords.x + ballR
    };
    const hBallRangeMoved: Range = {
      min: hBallRange.min + changes.x,
      max: hBallRange.max + changes.x
    };
    const vBallRange: Range = {
      min: ballCords.y - ballR,
      max: ballCords.y + ballR
    };
    const vBallRangeMoved: Range = {
      min: vBallRange.min + changes.y,
      max: vBallRange.max + changes.y
    };
    const wallIter = this.walls[Symbol.iterator]();
    let wallRes = wallIter.next();
    while (!wallRes.done && !(overlapping[0] === true && overlapping[1] === true)) {
      const wall = wallRes.value;
      const hWallRange: Range = {
        min: wall.x,
        max: wall.x + wall.width
      };
      const vWallRange: Range = {
        min: wall.y,
        max: wall.y + wall.height
      };
      // Check for horizontal overlapping for moving
      const overlapsX = overlaps(hWallRange, hBallRangeMoved) && overlaps(vWallRange, vBallRange);
      // Checking for vertical overlapping for moving
      const overlapsY = overlaps(hWallRange, hBallRange) && overlaps(vWallRange, vBallRangeMoved);
      // Checking if overlaps if both move
      const overlapsBoth = overlaps(hWallRange, hBallRangeMoved) && overlaps(vWallRange, vBallRangeMoved);
      if (overlapsBoth) {
        if (overlapsX) {
          overlapping[0] = true;
        }
        if (overlapsY) {
          overlapping[1] = true;
        }
      }
      wallRes = wallIter.next();
    }
    return overlapping;
  }
}
