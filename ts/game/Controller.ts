import Game from "./Game.js";
import Player from "./Player.js";

export default class Controller {
  private keyMap: { [key: string]: boolean } = {};
  constructor(
    public player: Player,
    public canvas: HTMLCanvasElement,
    public game: Game
  ) {
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    document.addEventListener("keyup", this.handleKeyUp.bind(this));
    document.addEventListener("mousemove", this.handleMouseMovement.bind(this));
    this.canvas.addEventListener("click", this.handleCanvasClick.bind(this));
    document.addEventListener("pointerlockchange", () => {
      if (document.pointerLockElement !== this.canvas) this.game.paused = true;
    });
    document.addEventListener("fullscreenchange", () => {
      if (document.fullscreenElement !== this.canvas) this.game.paused = true;
    });
  }

  public handleKeyDown(event: KeyboardEvent) {
    this.keyMap[event.code] = true;
  }

  public handleKeyUp(event: KeyboardEvent) {
    this.keyMap[event.code] = false;
  }

  public handleMouseMovement(event: MouseEvent) {
    if (document.pointerLockElement !== this.canvas) return;
    this.player.turn(event.movementX);
  }

  public handleCanvasClick() {
    if (document.pointerLockElement !== this.canvas)
      this.canvas.requestPointerLock();
    if (document.fullscreenElement !== this.canvas)
      this.canvas.requestFullscreen();
    if (this.game.paused) this.game.paused = false;
  }

  public update() {
    if (this.game.paused) return;
    if (this.keyMap.KeyW) this.player.moveForward();
    if (this.keyMap.KeyS) this.player.moveBackward();
    if (this.keyMap.KeyA) this.player.strafeLeft();
    if (this.keyMap.KeyD) this.player.strafeRight();
    if (this.keyMap.ShiftLeft) this.player.running = true;
    else this.player.running = false;
  }
}
