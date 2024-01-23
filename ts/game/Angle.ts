import Vector2 from "./Vector2.js";

export default class Angle {
  constructor(public angle: number) {
    this.normalize();
  }

  public normalize() {
    this.angle = this.angle % 360;
    if (this.angle < 0) this.angle += 360;
  }

  public getX() {
    return Math.cos(this.angle * (Math.PI / 180));
  }

  public getY() {
    return Math.sin(this.angle * (Math.PI / 180));
  }

  public add(angle: number) {
    this.angle += angle;
    this.normalize();
  }

  public getVector2(origin: Vector2, distance: number) {
    return new Vector2(
      origin.x + this.getX() * distance,
      origin.y + this.getY() * distance
    );
  }
}
