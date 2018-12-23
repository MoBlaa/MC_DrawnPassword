import { Point, pointPoint, Circle, pointCircle } from './collision-detection';

describe('PointToPoint', () => {
    it('#pointPoint detects colliding points', () => {
        const p1: Point = {
            x: 42,
            y: 24
        };
        const p2: Point = {
            x: 42,
            y: 24
        };
        expect(pointPoint(p1, p2)).toBeTruthy();
    });

    it('#pointPoint detects same point', () => {
        const p1: Point = {
            x: 42, y: 24
        };
        expect(pointPoint(p1, p1)).toBeTruthy();
    });

    it('#pointPoint returns false on points only on same x- or y-Level', () => {
        const p1: Point = {
            x: 42, y: 33
        };
        const p2: Point = {
            x: 42, y: 44
        };
        const p3: Point = {
            x: 33, y: 33
        };
        expect(pointPoint(p1, p2)).toBeFalsy();
        expect(pointPoint(p1, p3)).toBeFalsy();
    });

    it('#pointPoint returns false on not colliding points', () => {
        const p1: Point = {
            x: 50, y: 12
        };
        const p2: Point = {
            x: 42, y: 44
        };
        expect(pointPoint(p1, p2)).toBeFalsy();
    });
});

describe('PointToCircle', () => {
    it('#pointCircle detects random point in circle', () => {
        const circle: Circle = {
            position: { x: 12, y: 42 },
            radius: 14
        };
        const point: Point = {
            x: circle.position.x + Math.random() * circle.radius,
            y: circle.position.y + Math.random() * circle.radius
        };
        expect(pointCircle(point, circle));
    });

    it('#pointCircle detects random point out of circle', () => {
        const circle: Circle = {
            position: { x: 44, y: 11 },
            radius: 42
        };
        const upper: Point = {
            x: Math.floor(Math.random() * ((214 - 88) + 1) + 88),
            y: Math.floor(Math.random() * ((214 - 55) + 1) + 55)
        };
        const under: Point = {
            x: Math.floor(Math.random() * ((-150 - 1) + 1) + 1),
            y: Math.floor(Math.random() * ((-200 - (- 32)) + 1) - 32)
        };
        expect(pointCircle(upper, circle)).toBeFalsy();
        expect(pointCircle(under, circle)).toBeFalsy();
    });
});
