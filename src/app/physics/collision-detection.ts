import { isNumber } from 'util';

export interface Range {
  min: number;
  max: number;
}

export interface Vector {
  x: number;
  y: number;
}

export function isAPoint(p: any): p is Vector {
  return 'x' in p && 'y' in p;
}

export type Line = [Vector, Vector];

export function isALine(l: any): l is Line {
  return l instanceof Array && l.length === 2 && isAPoint(l[0]) && isAPoint(l[1]);
}

export interface Circle {
  position: Vector;
  radius: number;
}

export function isACircle(c: any): c is Circle {
  return 'position' in c && 'radius' in c && isAPoint(c.position) && isNumber(c.radius);
}

export interface Rectangle {
  anchor: Vector;
  width: number;
  height: number;
}

export function isARectangle(r: any): r is Rectangle {
  return 'anchor' in r && isAPoint(r.anchor) && 'width' in r && 'height' in r && isNumber(r.width) && isNumber(r.height);
}

export function randomInside(range: Range): number {
  return Math.floor(Math.random() * range.max) + range.min;
}

function dist(point: Vector, point2: Vector): number {
  return Math.sqrt(
    (point2.x - point.x) * (point2.x - point.x) +
    (point2.y - point.y) * (point2.y - point.y)
  );
}

function inside(x: number, range: Range) {
  return range.min <= x && x <= range.max;
}

export function pointPoint(p1: Vector, p2: Vector): boolean {
  return p1.x === p2.x && p1.y === p2.y;
}

// http://www.jeffreythompson.org/collision-detection/point-circle.php
export function pointCircle(point: Vector, circle: Circle): boolean {
  const distCenter: [number, number] = [
    point.x - circle.position.x,
    point.y - circle.position.y
  ];
  const distance = Math.sqrt((distCenter[0] * distCenter[0]) + (distCenter[1] * distCenter[1]));
  return distance <= circle.radius;
}

export function pointRectangle(point: Vector, rect: Rectangle) {
  return point.x >= rect.anchor.x
    && point.x <= rect.anchor.x + rect.width
    && point.y >= rect.anchor.y
    && point.y <= rect.anchor.y + rect.height;
}

export function pointLine(point: Vector, line: Line): boolean {
  const lineLen = dist(line[0], line[1]);
  const d = [
    dist(point, line[0]),
    dist(point, line[1])
  ];
  const buffer = 0.3; // higher # = less accurate
  return (d[0] + d[1] >= lineLen - buffer && d[0] + d[1] <= lineLen + buffer);
}

// http://www.jeffreythompson.org/collision-detection/line-circle.php
export function lineCircle(line: Line, circle: Circle): boolean {
  // Check if either end is in the circle
  const ins = [
    pointCircle({ x: line[0].x, y: line[0].y }, circle),
    pointCircle({ x: line[1].x, y: line[1].y }, circle)
  ];
  if (ins[0] || ins[1]) {
    return true;
  }

  // Get closest point on the line
  let d = [
    line[0].x - line[1].x,
    line[0].y - line[1].y
  ];
  const len = Math.sqrt((d[0] * d[0]) + (d[1] * d[1]));
  // Dot product to get the closest point on the line
  const dot = (
    ((circle.position.x - line[0].x) * (line[1].x - line[0].x))
    + ((circle.position.y - line[0].y) * (line[1].y - line[0].y)))
    / Math.pow(len, 2);
  // Get the closest point to the circle on the line
  const closestP: Vector = {
    x: line[0].x + (dot * (line[1].x - line[0].x)),
    y: line[0].y + (dot * (line[1].y - line[0].y))
  };
  const onSegment = pointLine(closestP, [{ x: line[0].x, y: line[0].y }, { x: line[1].x, y: line[1].y }]);
  if (!onSegment) {
    return false;
  }

  // Distance between closest point on the line and circle
  d = [
    closestP.x - circle.position.x,
    closestP.y - circle.position.y
  ];
  const distance = Math.sqrt(
    (d[0] * d[0]) + (d[1] * d[1])
  );

  return distance <= circle.radius;
}

// https://stackoverflow.com/questions/401847/circle-rectangle-collision-detection-intersection
export function rectangleCircle(rect: Rectangle, circle: Circle): boolean {
  const corners: Array<Vector> = [
    { x: rect.anchor.x, y: rect.anchor.y },
    { x: rect.anchor.x + rect.width, y: rect.anchor.y },
    { x: rect.anchor.x + rect.width, y: rect.anchor.y + rect.height },
    { x: rect.anchor.x, y: rect.anchor.y + rect.height }
  ];
  const walls: Array<Line> = [
    [corners[0], corners[1]],
    [corners[1], corners[2]],
    [corners[3], corners[2]],
    [corners[0], corners[3]]
  ];
  const pInRect = pointRectangle(circle.position, rect);
  const collidesWithNorth = lineCircle(walls[0], circle);
  const collidesWithEast = lineCircle(walls[1], circle);
  const collidesWithSouth = lineCircle(walls[2], circle);
  const collidesWithWest = lineCircle(walls[3], circle);
  return pInRect || collidesWithEast || collidesWithNorth || collidesWithSouth || collidesWithWest;
}
