import Vector2 from "./Vector2.js";
import Angle from "./Angle.js";
import Game from "./Game.js";
import Line from "./Line.js";
import Renderer from "./Renderer.js";

export default class Player {
  public static readonly FOV = new Angle(90);
  public static readonly VIEW_DISTANCE = 500;
  public static readonly TURN_SPEED = 0.2;
  public static readonly WALK_SPEED = 1;
  public static readonly STRAFE_MULTIPLIER = 0.6;
  public static readonly RUN_MULTIPLIER = 1.5;
  public running = false;
  constructor(
    public position: Vector2,
    public angle: Angle,
    public fov: Angle,
    public game: Game
  ) {}

  public move(x: number, y: number) {
    const newPosition = new Vector2(
      this.position.x + x * (this.running ? Player.RUN_MULTIPLIER : 1),
      this.position.y + y * (this.running ? Player.RUN_MULTIPLIER : 1)
    );
    const moveLine = new Line(this.position, newPosition);
    const lines = [
      ...this.game.map,
      new Line(new Vector2(0, 0), new Vector2(0, this.game.height)),
      new Line(
        new Vector2(0, this.game.height),
        new Vector2(this.game.width, this.game.height)
      ),
      new Line(
        new Vector2(this.game.width, this.game.height),
        new Vector2(this.game.width, 0)
      ),
      new Line(new Vector2(this.game.width, 0), new Vector2(0, 0)),
    ];
    const collisions = lines
      .map((line) => line.intersect(moveLine))
      .filter((intersection) => intersection !== null);
    const closestCollision = collisions.reduce((prev, curr) => {
      if (!prev) return curr;
      if (!curr) return prev;
      if (this.position.distanceTo(curr) < this.position.distanceTo(prev))
        return curr;
      return prev;
    }, null);
    if (!closestCollision) return (this.position = newPosition);

    const distance = this.position.distanceTo(closestCollision);
    if (distance < 1) return;
    const distanceRatio = 1 / distance;
    const xRatio = (closestCollision.x - this.position.x) * distanceRatio;
    const yRatio = (closestCollision.y - this.position.y) * distanceRatio;
    this.position.x += xRatio;
    this.position.y += yRatio;
  }

  public moveForward() {
    this.move(
      this.angle.getX() * Player.WALK_SPEED,
      this.angle.getY() * Player.WALK_SPEED
    );
  }

  public moveBackward() {
    this.move(
      -this.angle.getX() * Player.STRAFE_MULTIPLIER,
      -this.angle.getY() * Player.STRAFE_MULTIPLIER
    );
  }

  public strafeLeft() {
    this.move(
      this.angle.getY() * Player.STRAFE_MULTIPLIER,
      -this.angle.getX() * Player.STRAFE_MULTIPLIER
    );
  }

  public strafeRight() {
    this.move(
      -this.angle.getY() * Player.STRAFE_MULTIPLIER,
      this.angle.getX() * Player.STRAFE_MULTIPLIER
    );
  }

  public turn(angle: number) {
    this.angle.add(angle * Player.TURN_SPEED);
  }

  public createLine(viewAngle: Angle) {
    const angle = new Angle(viewAngle.angle + 90);
    const vector = angle.getVector2(this.position, 2);

    const angle2 = new Angle(viewAngle.angle - 90);
    const vector2 = angle2.getVector2(this.position, 2);

    return new Line(vector, vector2);
  }
}
