import Player from "./Player.js";
import Game from "./Game.js";
import Line from "./Line.js";
import Angle from "./Angle.js";
import Vector2 from "./Vector2.js";

export default class Renderer {
  public static readonly FPS = 5;
  public static readonly QUALITY = 1;
  public static readonly MINIMAP_SCALE = 0.5;
  public static readonly BACKGROUND_COLOR = "hsla(0, 0%, 0%, 0.5)";
  public static readonly SKY_COLOR = "hsl(0, 0%, 50%)";
  public static readonly FLOOR_COLOR = "hsl(0, 0%, 25%)";
  public static readonly LINE_COLOR = `hsl(0, 0%, 100%)`;
  public static readonly PLAYER_COLOR = `hsl(0, 100%, 50%)`;
  public static readonly DIRECTION_COLOR = "hsl(50, 100%, 50%)";
  public static readonly CROSSHAIR_SIZE = 10;
  public static readonly CROSSHAIR_THICKNESS = 2;
  public static readonly CROSSHAIR_COLOR = "hsl(0, 0%, 100%)";
  public static readonly PLAYER_SIZE = 25;
  constructor(
    public canvas: HTMLCanvasElement,
    public context: CanvasRenderingContext2D,
    public player: Player,
    public game: Game
  ) {
    this.resize();
    window.addEventListener("resize", this.resize.bind(this));
  }

  public clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  public render() {
    this.clear();
    this.renderSky();
    this.renderFloor();
    this.renderPOV();

    if (this.game.paused) this.renderPaused();
    else {
      this.renderMinimap();
      this.renderCrosshair();
    }
  }

  public renderPaused() {
    this.context.fillStyle = "hsla(0, 0%, 0%, 0.5)";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.context.fillStyle = "hsl(0, 0%, 100%)";
    this.context.font = "50px Arial";
    this.context.textAlign = "center";
    this.context.fillText(
      "Paused",
      this.canvas.width / 2,
      this.canvas.height / 2
    );
  }

  public renderSky() {
    this.context.fillStyle = Renderer.SKY_COLOR;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height / 2);
  }

  public renderFloor() {
    this.context.fillStyle = Renderer.FLOOR_COLOR;
    this.context.fillRect(
      0,
      this.canvas.height / 2,
      this.canvas.width,
      this.canvas.height / 2
    );
  }

  public renderPOV() {
    const width = this.canvas.width * Renderer.QUALITY;

    // step angle
    const stepAngle = new Angle(this.player.fov.angle / width);

    // start angle
    let currentAngle = new Angle(
      this.player.angle.angle - this.player.fov.angle / 2
    );

    const playerIntersections: {
      intersection: Vector2;
      distance: number;
      x: number;
    }[] = [];

    // go through each row
    for (let x = 0; x < width; x++) {
      const playerLine = new Line(
        this.player.position,
        currentAngle.getVector2(this.player.position, Player.VIEW_DISTANCE)
      );

      // go through map
      let closestMapIntersection: Vector2 | null = null;
      let closestMapIntersectionDistance = Infinity;

      this.game.map.forEach((line) => {
        const intersection = playerLine.intersect(line);

        if (intersection) {
          const distance = this.player.position.distanceTo(intersection);

          if (distance < closestMapIntersectionDistance) {
            closestMapIntersection = intersection;
            closestMapIntersectionDistance = distance;
          }
        }
      });

      // go through players
      this.game.players.forEach((player) => {
        if (player === this.player) return;

        const otherPlayerLine = player.createLine(this.player.angle);
        const intersection = playerLine.intersect(otherPlayerLine);

        if (intersection)
          playerIntersections.push({
            intersection,
            x,
            distance: this.player.position.distanceTo(intersection),
          });
      });

      // draw column
      if (closestMapIntersection)
        this.drawColumn(x, closestMapIntersectionDistance);

      // increment angle
      currentAngle.add(stepAngle.angle);
    }

    // draw players
    playerIntersections.forEach((intersection) => {
      this.drawPlayer(intersection.x, intersection.distance);
    });
  }

  public drawPlayer(x: number, distance: number) {
    // make an arc where the player is
    const s = 100 * (1 - distance / Player.VIEW_DISTANCE);
    const l = (100 * (1 - distance / Player.VIEW_DISTANCE)) / 2;

    this.context.fillStyle = `hsl(0, ${s}%, ${l}%)`;
    this.context.beginPath();
    this.context.arc(
      x / Renderer.QUALITY,
      this.canvas.height / 2 / Renderer.QUALITY,
      (Player.VIEW_DISTANCE / distance) * Renderer.PLAYER_SIZE,
      0,
      2 * Math.PI
    );
    this.context.fill();
  }

  public drawColumn(x: number, distance: number) {
    // Calculate height and top of column (relative to canvas height and distance)
    const columnHeight = (this.canvas.height / distance) * Player.VIEW_DISTANCE;
    const top = (this.canvas.height - columnHeight) / 2;

    const l = 100 * (1 - distance / Player.VIEW_DISTANCE);

    // Calculate color
    const color = `hsl(0, 0%, ${l}%)`;

    // Adjust height for a more realistic appearance (e.g., perspective)
    const adjustedHeight =
      (columnHeight * Math.cos(distance / Player.VIEW_DISTANCE)) / 4;

    const right = 1;

    // Draw column
    this.context.fillStyle = color;
    this.context.fillRect(
      x / Renderer.QUALITY,
      (top + (columnHeight - adjustedHeight) / 2) / Renderer.QUALITY,
      right / Renderer.QUALITY,
      adjustedHeight / Renderer.QUALITY
    );
  }

  public renderMinimap() {
    // background
    const width = this.game.width * Renderer.MINIMAP_SCALE;
    const height = this.game.height * Renderer.MINIMAP_SCALE;

    this.context.fillStyle = Renderer.BACKGROUND_COLOR;
    this.context.fillRect(0, 0, width, height);

    // map
    this.context.fillStyle = Renderer.LINE_COLOR;
    this.game.map.forEach((line) => {
      // draw line
      this.context.beginPath();
      this.context.moveTo(
        line.p1.x * Renderer.MINIMAP_SCALE,
        line.p1.y * Renderer.MINIMAP_SCALE
      );
      this.context.lineTo(
        line.p2.x * Renderer.MINIMAP_SCALE,
        line.p2.y * Renderer.MINIMAP_SCALE
      );
      this.context.stroke();
      this.context.closePath();
    });

    // player arrow direction
    this.context.fillStyle = Renderer.PLAYER_COLOR;
    this.context.beginPath();
    this.context.moveTo(
      (this.player.position.x +
        this.player.angle.getX() * 1.5 * Renderer.PLAYER_SIZE) *
        Renderer.MINIMAP_SCALE,
      (this.player.position.y +
        this.player.angle.getY() * 1.5 * Renderer.PLAYER_SIZE) *
        Renderer.MINIMAP_SCALE
    );
    this.context.lineTo(
      (this.player.position.x +
        this.player.angle.getY() * Renderer.PLAYER_SIZE -
        this.player.angle.getX() * Renderer.PLAYER_SIZE) *
        Renderer.MINIMAP_SCALE,
      (this.player.position.y -
        this.player.angle.getX() * Renderer.PLAYER_SIZE -
        this.player.angle.getY() * Renderer.PLAYER_SIZE) *
        Renderer.MINIMAP_SCALE
    );
    this.context.lineTo(
      this.player.position.x * Renderer.MINIMAP_SCALE,
      this.player.position.y * Renderer.MINIMAP_SCALE
    );
    this.context.lineTo(
      (this.player.position.x -
        this.player.angle.getY() * Renderer.PLAYER_SIZE -
        this.player.angle.getX() * Renderer.PLAYER_SIZE) *
        Renderer.MINIMAP_SCALE,
      (this.player.position.y +
        this.player.angle.getX() * Renderer.PLAYER_SIZE -
        this.player.angle.getY() * Renderer.PLAYER_SIZE) *
        Renderer.MINIMAP_SCALE
    );
    this.context.fill();
  }

  public renderCrosshair() {
    this.context.strokeStyle = Renderer.CROSSHAIR_COLOR;
    this.context.lineWidth = Renderer.CROSSHAIR_THICKNESS;
    this.context.beginPath();
    this.context.moveTo(
      this.canvas.width / 2 - Renderer.CROSSHAIR_SIZE,
      this.canvas.height / 2
    );
    this.context.lineTo(
      this.canvas.width / 2 + Renderer.CROSSHAIR_SIZE,
      this.canvas.height / 2
    );
    this.context.moveTo(
      this.canvas.width / 2,
      this.canvas.height / 2 - Renderer.CROSSHAIR_SIZE
    );
    this.context.lineTo(
      this.canvas.width / 2,
      this.canvas.height / 2 + Renderer.CROSSHAIR_SIZE
    );
    this.context.stroke();
    this.context.closePath();
  }
}
