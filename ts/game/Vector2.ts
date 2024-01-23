export default class Position {
  constructor(public x: number, public y: number) {}

  public distanceTo(other: Position) {
    return Math.sqrt(
      Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2)
    );
  }
}
