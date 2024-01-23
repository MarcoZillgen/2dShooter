import Line from "./Line.js";
import Player from "./Player.js";

export default class Game {
  public players: Player[] = [];
  constructor(
    public map: Line[],
    public width: number,
    public height: number
  ) {}

  public addPlayer(player: Player) {
    this.players.push(player);
  }
}
