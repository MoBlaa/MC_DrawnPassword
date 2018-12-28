import {
    Vector, pointPoint,
    Circle, pointCircle,
    Rectangle, randomInside,
    pointRectangle, Line,
    isARectangle, isACircle, rectangleCircle, pointLine, lineCircle
} from './collision-detection';

function randomPoint(): Vector {
    return {
        x: randomInside({ min: -250, max: 250 }),
        y: randomInside({ min: -250, max: 250 })
    };
}

function randomLine(): Line {
    return [
        randomPoint(), randomPoint()
    ];
}

function randomRectangle(): Rectangle {
    return {
        anchor: randomPoint(),
        width: randomInside({ min: 0, max: 250 }),
        height: randomInside({ min: 0, max: 250 })
    };
}

function randomCircle(): Circle {
    return {
        position: randomPoint(),
        radius: randomInside({ min: -250, max: 250 })
    };
}

function randomPointIn(object: Rectangle | Circle): Vector {
    let result: Vector;
    if (isARectangle(object)) {
        result = {
            x: randomInside({
                min: object.anchor.x,
                max: object.anchor.x + object.width
            }),
            y: randomInside({
                min: object.anchor.y,
                max: object.anchor.y + object.height
            })
        };
    } else if (isACircle(object)) {
        const a = Math.random() * 2 * Math.PI;
        const r = object.radius * Math.sqrt(Math.random());
        result = {
            x: r * Math.cos(a),
            y: r * Math.sin(a)
        };
    } else {
        throw new Error('Failed to get Type');
    }
    return result;
}

describe('PointToPoint', () => {
    it('#pointPoint detects colliding points', () => {
        const p1 = randomPoint();
        const p2: Vector = {
            x: p1.x,
            y: p1.y
        };
        expect(pointPoint(p1, p2)).toBeTruthy();
    });

    it('#pointPoint detects same point', () => {
        const p1 = randomPoint();
        expect(pointPoint(p1, p1)).toBeTruthy();
    });

    it('#pointPoint returns false on points only on same x- or y-Level', () => {
        const p1 = randomPoint();
        const p2: Vector = {
            x: p1.x, y: p1.y - 10
        };
        const p3: Vector = {
            x: p1.x + 10, y: p1.y
        };
        expect(pointPoint(p1, p2)).toBeFalsy();
        expect(pointPoint(p1, p3)).toBeFalsy();
    });

    it('#pointPoint returns false on not colliding points', () => {
        const p1 = randomPoint();
        const p2: Vector = {
            x: p1.x - 44, y: p1.y + 40
        };
        expect(pointPoint(p1, p2)).toBeFalsy();
    });
});

describe('PointToCircle', () => {
    it('#pointCircle detects random point in circle', () => {
        const circle = randomCircle();
        const point = randomPointIn(circle);
        expect(pointCircle(point, circle));
    });

    it('#pointCircle detects random point out of circle', () => {
        const circle = randomCircle();
        const upper: Vector = {
            x: randomInside({
                min: circle.position.x + circle.radius + 1,
                max: circle.position.x + circle.radius + circle.radius * 10
            }),
            y: randomInside({
                min: circle.position.y + circle.radius + 1,
                max: circle.position.y + circle.radius + circle.radius * 10
            })
        };
        const under: Vector = {
            x: randomInside({
                min: circle.position.x - circle.radius - 1,
                max: circle.position.x - circle.radius - circle.radius * 10
            }),
            y: randomInside({
                min: circle.position.y - circle.radius - 1,
                max: circle.position.y - circle.radius - circle.radius * 10
            })
        };
        expect(pointCircle(upper, circle)).toBeFalsy();
        expect(pointCircle(under, circle)).toBeFalsy();
    });
});

describe('PointToRectangle', () => {
    it('#pointRectangle detects if point in a rectangle is in the rectangle', () => {
        const rectangle = randomRectangle();
        const point: Vector = {
            x: rectangle.anchor.x + rectangle.width / 2,
            y: rectangle.anchor.y + rectangle.height / 2
        };

        console.log(
            `rectangle = x: ${rectangle.anchor.x}, y: ${rectangle.anchor.y}, width: ${rectangle.width}, height: ${rectangle.height}`
        );
        console.log(
            `point = x: ${point.x}, y: ${point.y}`
        );

        expect(pointRectangle(point, rectangle)).toBeTruthy();
    });

    it('#pointInRectangle detects random point outside rectangle', () => {
        const rectangle = randomRectangle();
        const point: Vector = {
            x: randomInside({
                min: rectangle.anchor.x - 250,
                max: rectangle.anchor.x - 1
            }),
            y: randomInside({
                min: rectangle.anchor.y - 250,
                max: rectangle.anchor.y - 1
            })
        };
        expect(pointRectangle(point, rectangle)).toBeFalsy();
    });
});

describe('PointToLine', () => {
    it('#lineCircle detects one end is in the circle', () => {
        const line = randomLine();
        const circleBegin: Circle = {
            position: { x: line[0].x - 1, y: line[0].y - 1 },
            radius: 5
        };
        const circleEnd: Circle = {
            position: { x: line[1].x + 1, y: line[1].y + 1},
            radius: 5
        };
        expect(lineCircle(line, circleBegin)).toBeTruthy();
        expect(lineCircle(line, circleEnd)).toBeTruthy();
    });

    it('#lineCircle detects touching without the points', () => {
        const line: Line = [
            { x: 0, y: 0 },
            { x: 300, y: 0 }
        ];
        const circle: Circle = {
            position: { x: 150, y: 5 },
            radius: 20
        };
        expect(lineCircle(line, circle)).toBeTruthy();
    });

    it('#lineCircle detects if no collision', () => {
        const line: Line = [
            { x: 0, y: 0 },
            { x: 300, y: 0 }
        ];
        const circle: Circle = {
            position: { x: - 150, y: -150 },
            radius: 5
        };
        expect(lineCircle(line, circle)).toBeFalsy();
    });
});

describe('CircleToRectangle', () => {
    it('#rectangleCircle detects center of circle in rectangle', () => {
        const rectangle = randomRectangle();
        const circle: Circle = {
            position: {
                x: rectangle.anchor.x + rectangle.width / 2,
                y: rectangle.anchor.y + rectangle.height / 2
            },
            radius: 10
        };
        expect(rectangleCircle(rectangle, circle)).toBeTruthy();
    });

    it('#rectangleCircle detects circle overlaps rectangle at corner', () => {
        const rectangle = randomRectangle();
        const circle: Circle = {
            position: {
                x: rectangle.anchor.x - 1,
                y: rectangle.anchor.y - 1
            },
            radius: 10
        };
        expect(rectangleCircle(rectangle, circle)).toBeTruthy();
    });

    it('#rectangleCircle detects overlapping at edge', () => {
        const rectangle: Rectangle = {
            anchor: { x: 0, y: 0 },
            width: 30,
            height: 30
        };
        const circle: Circle = {
            position: { x: rectangle.width / 2, y: rectangle.anchor.y - 2 },
            radius: 5
        };
        expect(rectangleCircle(rectangle, circle)).toBeTruthy();
    });

    it('#rectangleCircle detects if not overlapping', () => {
        const rectangle: Rectangle = {
            anchor: { x: 0, y: 0 },
            width: 30, height: 30
        };
        const circle: Circle = {
            position: { x: -30, y: -30 },
            radius: 5
        };
        expect(rectangleCircle(rectangle, circle)).toBeFalsy();
    });
});
