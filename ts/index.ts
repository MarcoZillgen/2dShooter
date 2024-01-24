import Game from "./game/Game.js";
import Player from "./game/Player.js";
import Renderer from "./game/Renderer.js";
import Vector2 from "./game/Vector2.js";
import Line from "./game/Line.js";
import Controller from "./game/Controller.js";
import Angle from "./game/Angle.js";

const map: Line[] = [
  new Line(new Vector2(250, 150), new Vector2(250, 50)),
  new Line(new Vector2(250, 50), new Vector2(50, 50)),
  new Line(new Vector2(50, 50), new Vector2(50, 250)),
  new Line(new Vector2(50, 250), new Vector2(150, 250)),
  new Line(new Vector2(150, 250), new Vector2(150, 150)),
  new Line(new Vector2(150, 150), new Vector2(250, 150)),
];

const game = new Game(map, 500, 500);

const testPlayer = new Player(
  new Vector2(300, 300),
  new Angle(0),
  new Angle(90),
  game
);
game.addPlayer(testPlayer);

const player = new Player(
  new Vector2(350, 350),
  new Angle(-135),
  new Angle(90),
  game
);

game.addPlayer(player);

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const context = canvas.getContext("2d") as CanvasRenderingContext2D;
const renderer = new Renderer(canvas, context, player, game);

const controller = new Controller(player, canvas, game);

let lastTime = 0;

const loop = () => {
  const time = Date.now();
  const deltaTime = time - lastTime;

  if (deltaTime > Renderer.FPS / 1000) {
    lastTime = time;
    controller.update();
    renderer.render();
  }

  requestAnimationFrame(loop);
};

loop();
