export interface Range {
    min: number;
    max: number;
}

export interface Vector {
    x: number;
    y: number;
}

export function dist(point: Vector, point2: Vector): number {
    return Math.sqrt(
        (point2.x - point.x) * (point2.x - point.x) +
        (point2.y - point.y) * (point2.y - point.y)
    );
}

export type Line = [Vector, Vector];

export interface Circle {
    position: Vector;
    radius: number;
}

export interface Rectangle {
    anchor: Vector;
    width: number;
    height: number;
}
