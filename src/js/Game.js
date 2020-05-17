import Confetti from "./Confetti.js";
import Controls from "./Controls.js";
import Cube from "./Cube.js";
import IconsConverter from "./IconsConverter.js";
import Preferences from "./Preferences.js";
import Scores from "./Scores.js";
import Scrambler from "./Scrambler.js";
import Storage from "./Storage.js";
import Themes from "./Themes.js";
import Timer from "./Timer.js";
import Transition from "./Transition.js";
import World from "./World.js";
new IconsConverter({
  icons: {
    settings: {
      viewbox: "0 0 512 512",
      content: "<path fill='currentColor' d='M444.788 291.1l42.616 24.599c4.867 2.809 7.126 8.618 5.459 13.985-11.07 35.642-29.97 67.842-54.689 94.586a12.016 12.016 0 0 1-14.832 2.254l-42.584-24.595a191.577 191.577 0 0 1-60.759 35.13v49.182a12.01 12.01 0 0 1-9.377 11.718c-34.956 7.85-72.499 8.256-109.219.007-5.49-1.233-9.403-6.096-9.403-11.723v-49.184a191.555 191.555 0 0 1-60.759-35.13l-42.584 24.595a12.016 12.016 0 0 1-14.832-2.254c-24.718-26.744-43.619-58.944-54.689-94.586-1.667-5.366.592-11.175 5.459-13.985L67.212 291.1a193.48 193.48 0 0 1 0-70.199l-42.616-24.599c-4.867-2.809-7.126-8.618-5.459-13.985 11.07-35.642 29.97-67.842 54.689-94.586a12.016 12.016 0 0 1 14.832-2.254l42.584 24.595a191.577 191.577 0 0 1 60.759-35.13V25.759a12.01 12.01 0 0 1 9.377-11.718c34.956-7.85 72.499-8.256 109.219-.007 5.49 1.233 9.403 6.096 9.403 11.723v49.184a191.555 191.555 0 0 1 60.759 35.13l42.584-24.595a12.016 12.016 0 0 1 14.832 2.254c24.718 26.744 43.619 58.944 54.689 94.586 1.667 5.366-.592 11.175-5.459 13.985L444.788 220.9a193.485 193.485 0 0 1 0 70.2zM336 256c0-44.112-35.888-80-80-80s-80 35.888-80 80 35.888 80 80 80 80-35.888 80-80z' class=''></path>",
    },
    back: {
      viewbox: "0 0 512 512",
      content: "<path transform='translate(512, 0) scale(-1,1)' fill='currentColor' d='M503.691 189.836L327.687 37.851C312.281 24.546 288 35.347 288 56.015v80.053C127.371 137.907 0 170.1 0 322.326c0 61.441 39.581 122.309 83.333 154.132 13.653 9.931 33.111-2.533 28.077-18.631C66.066 312.814 132.917 274.316 288 272.085V360c0 20.7 24.3 31.453 39.687 18.164l176.004-152c11.071-9.562 11.086-26.753 0-36.328z' class=''></path>",
    },
    trophy: {
      viewbox: "0 0 576 512",
      content: "<path fill='currentColor' d='M552 64H448V24c0-13.3-10.7-24-24-24H152c-13.3 0-24 10.7-24 24v40H24C10.7 64 0 74.7 0 88v56c0 66.5 77.9 131.7 171.9 142.4C203.3 338.5 240 360 240 360v72h-48c-35.3 0-64 20.7-64 56v12c0 6.6 5.4 12 12 12h296c6.6 0 12-5.4 12-12v-12c0-35.3-28.7-56-64-56h-48v-72s36.7-21.5 68.1-73.6C498.4 275.6 576 210.3 576 144V88c0-13.3-10.7-24-24-24zM64 144v-16h64.2c1 32.6 5.8 61.2 12.8 86.2-47.5-16.4-77-49.9-77-70.2zm448 0c0 20.2-29.4 53.8-77 70.2 7-25 11.8-53.6 12.8-86.2H512v16zm-127.3 4.7l-39.6 38.6 9.4 54.6c1.7 9.8-8.7 17.2-17.4 12.6l-49-25.8-49 25.8c-8.8 4.6-19.1-2.9-17.4-12.6l9.4-54.6-39.6-38.6c-7.1-6.9-3.2-19 6.7-20.5l54.8-8 24.5-49.6c4.4-8.9 17.1-8.9 21.5 0l24.5 49.6 54.8 8c9.6 1.5 13.5 13.6 6.4 20.5z' class=''></path>",
    },
    share: {
      viewbox: "0 0 36 50",
      content: "<path fill='currentColor' d='M19,4.414L19,32C19,32.552 18.552,33 18,33C17.448,33 17,32.552 17,32L17,4.414L10.707,10.707C10.317,11.098 9.683,11.098 9.293,10.707C8.902,10.317 8.902,9.683 9.293,9.293L18,0.586L26.707,9.293C27.098,9.683 27.098,10.317 26.707,10.707C26.317,11.098 25.683,11.098 25.293,10.707L19,4.414ZM34,18L26,18C25.448,18 25,17.552 25,17C25,16.448 25.448,16 26,16L36,16L36,50L0,50L0,16L10,16C10.552,16 11,16.448 11,17C11,17.552 10.552,18 10,18L2,18L2,48L34,48L34,18Z' />",
    },
    pwa: {
      viewbox: "0 0 740 280",
      content: "<path d='M544.62 229.7L565.998 175.641H627.722L598.43 93.6366L635.066 0.988922L740 279.601H662.615L644.683 229.7H544.62V229.7Z' fill='#3d3d3d'/><path d='M478.6 279.601L590.935 0.989288H516.461L439.618 181.035L384.974 0.989655H327.73L269.058 181.035L227.681 98.9917L190.236 214.352L228.254 279.601H301.545L354.565 118.139L405.116 279.601H478.6V279.601Z' fill='currentColor'/><path d='M70.6927 183.958H116.565C130.46 183.958 142.834 182.407 153.685 179.305L165.548 142.757L198.704 40.6105C196.177 36.6063 193.293 32.8203 190.051 29.2531C173.028 10.4101 148.121 0.988861 115.33 0.988861H0V279.601H70.6927V183.958V183.958ZM131.411 65.0863C138.061 71.7785 141.385 80.7339 141.385 91.9534C141.385 103.259 138.461 112.225 132.614 118.853C126.203 126.217 114.399 129.898 97.2023 129.898H70.6927V55.0474H97.3972C113.424 55.0474 124.762 58.3937 131.411 65.0863V65.0863Z' fill='#3d3d3d'/>",
    }
  },
  convert: true,
});
// 常量定义
const MENU = 0;
const PLAYING = 1;
const COMPLETE = 2;
const STATS = 3;
const PREFS = 4;
const SHOW = true;
const HIDE = false;
export default class {
  constructor() {
    /**
     * 简写DOM获取
     * @param {NodeListOf} selectors 
     */
    function $(selectors) {
      return document.querySelectorAll(selectors);
    }
    this.dom = {
      ui: $(".ui")[0],
      game: $(".ui__game")[0],
      back: $(".ui__background")[0],
      texts: $(".ui__texts")[0],
      prefs: $(".ui__prefs")[0],
      stats: $(".ui__stats")[0],
      texts: {
        title: $(".text--title")[0],
        note: $(".text--note")[0],
        timer: $(".text--timer")[0],
        stats: $(".text--timer")[0],
        complete: $(".text--complete")[0],
        best: $(".text--best-time")[0],
      },
      buttons: {
        prefs: $(".btn--prefs")[0],
        back: $(".btn--back")[0],
        stats: $(".btn--stats")[0],
        pwa: $(".btn--pwa")[0],
      },
      rangeHandles: $(".range__handle div"),
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
    this.saved = false;
    this.newGame = false;
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
  }
  // 初始化操作
  initActions() {
    let tappedTwice = false;
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
        this.timer.start(true);
        this.newGame = false;
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
          this.playing = false;
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
      this.saved = false;
      this.controls.disable();
      this.timer.stop();
      this.bestTime = this.scores.addScore(this.timer.deltaTime);
      this.transition.zoom(MENU, 0);
      this.transition.elevate(SHOW);
      setTimeout(() => {
        this.transition.complete(SHOW, this.bestTime);
        this.confetti.start();
      }, 1000);
    };
  }
}
