import Player from "./Player.js";

export default class Controller {
  private keyMap: { [key: string]: boolean } = {};
  constructor(public player: Player, private canvas: HTMLCanvasElement) {
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    document.addEventListener("keyup", this.handleKeyUp.bind(this));
    document.addEventListener("mousemove", this.handleMouseMovement.bind(this));
    this.canvas.addEventListener("click", this.handleCanvasClick.bind(this));
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
  }

  public update() {
    if (this.keyMap.KeyW) this.player.moveForward();
    if (this.keyMap.KeyS) this.player.moveBackward();
    if (this.keyMap.KeyA) this.player.strafeLeft();
    if (this.keyMap.KeyD) this.player.strafeRight();
    if (this.keyMap.ShiftLeft) this.player.running = true;
    else this.player.running = false;
    if (this.keyMap.Escape) document.exitPointerLock();
  }
}
