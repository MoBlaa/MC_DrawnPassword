import { Ball } from './ball';
import { Brick } from './game.service';
import { Cords } from './custom-maze/custom-maze.component';

interface Range {
  min: number;
  max: number;
}

export interface Circle {
  position: Cords;
  radius: number;
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

export function pointInRectangle(point: Cords, brick: Brick) {
  return brick.x <= point.x && point.x <= brick.x + brick.width &&
    brick.y <= point.y && point.y <= brick.y + brick.height;
}

export const intersectLine = (line: [Cords, Cords], circle: Circle) => {
  const x2 = line[1].x;
  const x1 = line[0].x;
  const x0 = circle.position.x;
  const y2 = line[1].y;
  const y1 = line[0].y;
  const y0 = circle.position.y;
  const upper = Math.abs(
    (x2 - x1) * x0
    + (y1 - y2) * y0
    + (x1 - x2) * y1
    + (y2 - y1) * x1
  );
  const bottom = Math.sqrt(
    (x2 - x1) * (x2 - x1)
    + (y1 - y2) * (y1 - y2)
  );
  if (bottom === 0) {
    console.log('div by 0');
    return false;
  }
  const result = (upper / bottom);
  // console.log(result);
  return result <= circle.radius;
};

export function intersectBrick(brick: Brick, circle: Circle) {
  const corners = {
    upperleft: { x: brick.x, y: brick.y },
    upperright: { x: brick.x + brick.width, y: brick.y },
    bottomleft: { x: brick.x, y: brick.y + brick.height },
    bottomright: { x: brick.x + brick.width, y: brick.y + brick.height }
  };
  const edges: Array<[Cords, Cords]> = [
    [corners.upperleft, corners.upperright],
    [corners.upperleft, corners.bottomleft],
    [corners.upperright, corners.bottomright],
    [corners.bottomleft, corners.bottomright]
  ];
  const pointIsInRectangle = pointInRectangle(circle.position, brick);
  let any = false;
  for (const edge of edges) {
    if (intersectLine(edge, circle)) {
      console.log(`intersects with { x: ${edge[0].x}, y: ${edge[0].y} } - { x: ${edge[1].x}, y: ${edge[1].y} }`);
      any = true;
      break;
    }
  }
  return pointIsInRectangle || any;
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
    while (!wallRes.done && !(overlapping[0] === true && overlapping[1] === true)) {
      const wall = wallRes.value;

      // Collision Detection with wall and ball
      const collidesBoth = intersectBrick(wall, ballMoved);
      const collidesX = intersectBrick(wall, ballMovedX);
      const collidesY = intersectBrick(wall, ballMovedY);

      if (collidesBoth) {
        if (collidesX) {
          overlapping[0] = true;
        }
        if (collidesY) {
          overlapping[1] = true;
        }
      }

      wallRes = wallIter.next();
    }
    return overlapping;
  }
}
