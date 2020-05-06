import Controls from "./Controls.js";
import World from "./World.js";
import Cube from "./Cube.js";
import Scrambler from "./Scrambler.js";
import Transition from "./Transition.js";
import Timer from "./Timer.js";
import Preferences from "./Preferences.js";
import Confetti from "./Confetti.js";
import Scores from "./Scores.js";
import Storage from "./Storage.js";
import Themes from "./Themes.js";
import Icons from "./Icons.js";

// 常量定义
const MENU = 0;
const PLAYING = 1;
const COMPLETE = 2;
const STATS = 3;
const PREFS = 4;
const SHOW = !0;
const HIDE = !1;
// 游戏类
export default class {
  constructor() {
    let qs = document.querySelector.bind(document);
    this.dom = {
      ui: qs(".ui"),
      game: qs(".ui__game"),
      back: qs(".ui__background"),
      texts: qs(".ui__texts"),
      prefs: qs(".ui__prefs"),
      stats: qs(".ui__stats"),
      texts: {
        title: qs(".text--title"),
        note: qs(".text--note"),
        timer: qs(".text--timer"),
        stats: qs(".text--timer"),
        complete: qs(".text--complete"),
        best: qs(".text--best-time"),
      },
      buttons: {
        prefs: qs(".btn--prefs"),
        back: qs(".btn--back"),
        stats: qs(".btn--stats"),
        pwa: qs(".btn--pwa"),
      },
      rangeHandles: document.querySelectorAll.bind(document)(".range__handle div"),
    };
    this.world = new World(this);
    this.cube = new Cube(this);
    this.controls = new Controls(this);
    this.scrambler = new Scrambler(this);
    this.transition = new Transition(this);
    this.timer = new Timer(this);
    this.preferences = new Preferences(this);
    this.scores = new Scores(this);
    this.storage = new Storage(this);
    this.confetti = new Confetti(this);
    this.themes = new Themes(this);
    this.initActions();
    this.state = MENU;
    this.saved = !1;
    this.newGame = !1;
    this.storage.init();
    this.preferences.init();
    this.transition.init();
    this.scores.calcStats();
    setTimeout(() => {
      this.transition.float();
      this.transition.cube(SHOW);
      setTimeout(() => this.transition.title(SHOW), 700);
      setTimeout(() => this.transition.buttons(["prefs", "pwa"], []), 1000);
    }, 500);
    Icons();
  }
  // 初始化操作
  initActions() {
    let tappedTwice = !1;
    this.dom.game.onclick = () => {
      if (this.transition.activeTransitions > 0)
        return;
      switch (this.state) {
        case PLAYING: return;
        case MENU:
          if (!tappedTwice) {
            tappedTwice = !0;
            setTimeout(() => tappedTwice = !1, 300);
            return !1;
          }
          if (!this.saved) {
            this.scrambler.scramble();
            this.controls.scrambleCube();
            this.newGame = !0;
          }
          this.state = PLAYING;
          this.saved = !0;
          this.transition.buttons([], ["pwa", "prefs"]);
          this.transition.zoom(PLAYING, this.saved ? 0 : this.scrambler.converted.length * this.controls.flipSpeeds[0]);
          this.transition.title(HIDE);
          setTimeout(() => {
            this.transition.timer(SHOW);
            this.transition.buttons(["back"], []);
          }, this.transition.durations.zoom - 1000);
          setTimeout(() => {
            this.controls.enable();
            if (!this.newGame)
              this.timer.start(!0);
          }, this.transition.durations.zoom);
          break;
        case COMPLETE:
          this.state = STATS;
          this.saved = !1;
          this.transition.timer(HIDE);
          this.transition.complete(HIDE, this.bestTime);
          this.transition.cube(HIDE);
          this.timer.reset();
          setTimeout(() => {
            this.cube.reset();
            this.confetti.stop();
            this.transition.stats(SHOW);
            this.transition.elevate();
          }, 1000);
          return !1;
        case STATS:
          this.state = MENU;
          this.transition.buttons(["pwa", "prefs"], []);
          this.transition.stats(HIDE);
          setTimeout(() => this.transition.cube(SHOW), 500);
          setTimeout(() => this.transition.title(SHOW), 1200);
          break;
      }
    };
    this.controls.onMove = () => {
      if (this.newGame) {
        this.timer.start(!0);
        this.newGame = !1;
      }
    };
    this.dom.buttons.back.onclick = () => {
      if (this.transition.activeTransitions > 0)
        return;
      switch (this.state) {
        case PREFS:
          this.state = MENU;
          this.transition.buttons(["pwa", "prefs"], ["back"]);
          this.transition.preferences(HIDE);
          setTimeout(() => this.transition.cube(SHOW), 500);
          setTimeout(() => this.transition.title(SHOW), 1200);
          break;
        case PLAYING:
          this.state = MENU;
          this.transition.buttons(["pwa", "prefs"], ["back"]);
          this.transition.zoom(MENU, 0);
          this.controls.disable();
          if (!this.newGame)
            this.timer.stop();
          this.transition.timer(HIDE);
          setTimeout(() => this.transition.title(SHOW), this.transition.durations.zoom - 1000);
          this.playing = !1;
          this.controls.disable();
          break;
      }
    };
    this.dom.buttons.prefs.onclick = () => {
      if (this.transition.activeTransitions > 0)
        return;
      this.state = PREFS;
      this.transition.buttons(["back"], ["pwa", "prefs"]);
      this.transition.title(HIDE);
      this.transition.cube(HIDE);
      setTimeout(() => this.transition.preferences(SHOW), 1000);
    };
    this.dom.buttons.stats.onclick = () => {
      if (this.transition.activeTransitions > 0)
        return;
      this.state = STATS;
      this.transition.buttons([], ["pwa", "prefs"]);
      this.transition.title(HIDE);
      this.transition.cube(HIDE);
      setTimeout(() => this.transition.stats(SHOW), 1000);
    };
    this.controls.onSolved = () => {
      this.transition.buttons([], ["back"]);
      this.state = COMPLETE;
      this.saved = !1;
      this.controls.disable();
      this.timer.stop();
      this.bestTime = this.scores.addScore(this.timer.deltaTime);
      this.transition.zoom(MENU, 0);
      this.transition.elevate();
      setTimeout(() => {
        this.transition.complete(SHOW, this.bestTime);
        this.confetti.start();
      }, 1000);
    };
  }
}
