import Vector2 from "./Vector2.js";

export default class Line {
  constructor(public p1: Vector2, public p2: Vector2) {}

  public intersect(other: Line): Vector2 | null {
    const x1 = this.p1.x;
    const y1 = this.p1.y;
    const x2 = this.p2.x;
    const y2 = this.p2.y;
    const x3 = other.p1.x;
    const y3 = other.p1.y;
    const x4 = other.p2.x;
    const y4 = other.p2.y;

    const xNumerator =
      (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4);
    const yNumerator =
      (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4);

    const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    if (denominator === 0) {
      return null;
    }

    const i = new Vector2(xNumerator / denominator, yNumerator / denominator);

    const epsilon = 1e-6;

    if (
      i.x < Math.min(x1, x2) - epsilon ||
      i.x > Math.max(x1, x2) + epsilon ||
      i.y < Math.min(y1, y2) - epsilon ||
      i.y > Math.max(y1, y2) + epsilon ||
      i.x < Math.min(x3, x4) - epsilon ||
      i.x > Math.max(x3, x4) + epsilon ||
      i.y < Math.min(y3, y4) - epsilon ||
      i.y > Math.max(y3, y4) + epsilon
    )
      return null;

    return i;
  }
}
