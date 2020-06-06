import Game from "./Game.js";

export default class {
  /**
   * 扰频器类
   * @param {Game} game 
   */
  constructor(game) {
    this.game = game;
    this.scrambleLength = 20;
    this.moves = [];
    this.conveted = [];
    this.pring = "";
  }
  /**
   * 争夺
   * @param {String} scramble 争夺
   */
  scramble(scramble) {
    let count = 0;
    this.moves = typeof scramble !== "undefined" ? scramble.split(" ") : [];
    if (this.moves.length < 1) {
      let faces = "UDLRFB";
      let modifiers = ["", "'", "2"];
      let total = typeof scramble === "undefined" ? this.scrambleLength : scramble;
      while (count < total) {
        let move = faces[Math.floor(Math.random() * 6)] + modifiers[Math.floor(Math.random() * 3)];
        if (count > 0 && move.charAt(0) == this.moves[count - 1].charAt(0))
          continue;
        if (count > 1 && move.charAt(0) == this.moves[count - 2].charAt(0))
          continue;
        this.moves.push(move);
        count++;
      }
    }
    this.callback = () => { };
    this.convert();
    this.print = this.moves.join(" ");
    return this;
  }
  // 转换
  convert() {
    this.converted = [];
    this.moves.forEach(name => {
      let face = name.charAt(0);
      let modifier = name.charAt(1);
      let axis = { D: "y", U: "y", L: "x", R: "x", F: "z", B: "z" }[face];
      let row = { D: -1, U: 1, L: -1, R: 1, F: 1, B: -1 }[face];
      let position = new THREE.Vector3();
      position[axis] = row;
      let convertedMove = { position, axis, angle:Math.PI / 2 * row * (modifier == "'" ? 1 : -1), name };
      this.converted.push(convertedMove);
      if (modifier == "2")
        this.converted.push(convertedMove);
    });
  }
}
