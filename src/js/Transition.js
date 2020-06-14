import Tween from "./Tween.js";
import Easing from "./Easing.js";
import Game from "./Game.js";

export default class {
  /**
   * 过渡类
   * @param {Game} game 
   */
  constructor(game) {
    this.game = game;
    this.tweens = {
      buttons: {},
      timer: [],
      title: [],
      best: [],
      complete: [],
      range: [],
      stats: [],
      float: null
    };
    this.durations = {};
    this.data = {
      cubeY: -.2,
      cameraZoom: .85,
    };
    this.activeTransitions = 0;
  }
  // 初始化
  init() {
    this.game.controls.disable();
    this.game.cube.object.position.y = this.data.cubeY;
    this.game.controls.edges.position.y = this.data.cubeY;
    this.game.cube.animator.position.y = 4;
    this.game.cube.animator.rotation.x = -Math.PI / 3;
    this.game.world.camera.zoom = this.data.cameraZoom;
    this.game.world.camera.updateProjectionMatrix();
    this.tweens.buttons = {};
    this.tweens.timer = [];
    this.tweens.title = [];
    this.tweens.best = [];
    this.tweens.complete = [];
    this.tweens.range = [];
    this.tweens.stats = [];
  }
  /**
   * 按钮设置
   * @param {String[]} show 显示组件
   * @param {String[]} hide 隐藏组件
   */
  buttons(show, hide) {
    /**
     * 按钮渐变
     * @param {HTMLElement} button 按钮
     * @param {Boolean} show 显示组件
     */
    function buttonTween(button, show) {
      return new Tween({
        target: button.style,
        duration: 300,
        easing: show ? Easing.Power.Out(2) : Easing.Power.In(3),
        from: { opacity: show ? 0 : 1 },
        to: { opacity: show ? 1 : 0 },
        /**
         * 设置更新方法
         * @param {Tween} tween 渐变
         */
        onUpdate(tween) {
          button.style.transform = `translate3d(0, ${(show ? 1 - tween.value : tween.value) * 1.5}em, 0)`;
        },
        onComplete() { button.style.pointerEvents = show ? "all" : "none"; }
      });
    }
    hide.forEach(button => this.tweens.buttons[button] = buttonTween(this.game.dom.buttons[button], false));
    setTimeout(() => show.forEach(button => {
      this.tweens.buttons[button] = buttonTween(this.game.dom.buttons[button], true);
    }), hide ? 500 : 0);
  }
  /**
   * 立方体设置
   * @param {Boolean} show 显示
   */
  cube(show) {
    this.activeTransitions++;
    try {
      this.tweens.cube.stop();
    } catch (e) { }
    let { position, rotation } = this.game.cube.animator;
    this.tweens.cube = new Tween({
      duration: show ? 3000 : 1250,
      easing: show ? Easing.Elastic.Out(.8, .6) : Easing.Back.In(1),
      /**
       * 设置更新方法
       * @param {Tween} tween 
       */
      onUpdate(tween) {
        position.y = show
          ? (1 - tween.value) * 4
          : position.y + tween.value * 4;
        rotation.x = show
          ? (1 - tween.value) * Math.PI / 3
          : rotation.x - tween.value * Math.PI / 3;
      }
    });
    this.durations.cube = 1500;
    setTimeout(() => this.activeTransitions--, this.durations.cube);
  }
  // 浮动设置
  float() {
    try {
      this.tweens.float.stop();
    } catch (e) { }
    let { position, rotation } = this.game.cube.holder;
    this.tweens.float = new Tween({
      duration: 1500,
      easing: Easing.Sine.InOut(),
      yoyo: true,
      /**
       * 设置更新方法
       * @param {Tween} tween 
       */
      onUpdate(tween) {
        position.y = -.02 + tween.value * .04;
        rotation.x = .005 - tween.value * .01;
        rotation.z = -rotation.x;
        rotation.y = rotation.x;
      },
    });
  }
  /**
   * 变焦
   * @param {Number} play 运行状态
   * @param {Number} time 时间
   */
  zoom(play, time) {
    this.activeTransitions++;
    let duration = time > 0 ? Math.max(time, 1500) : 1500;
    let easing = Easing.Power.InOut(time > 0 ? 2 : 3);
    this.tweens.zoom = new Tween({
      target: this.game.world.camera,
      duration,
      easing,
      to: { zoom: play ? 1 : this.data.cameraZoom },
      onUpdate: () => { this.game.world.camera.updateProjectionMatrix(); },
    });
    this.tweens.rotate = new Tween({
      target: this.game.cube.animator.rotation,
      duration,
      easing,
      to: { y: -Math.PI * 2 * (time > 0 ? Math.round(duration / 1500) : 1) },
      onComplete: () => { this.game.cube.animator.rotation.y = 0; },
    });
    this.durations.zoom = duration;
    setTimeout(() => this.activeTransitions--, this.durations.zoom);
  }
  /**
   * 提升
   * @param {Boolean} complete 
   */
  elevate(complete) {
    this.activeTransitions++;
    this.tweens.elevate = new Tween({
      target: this.game.cube.object.position,
      duration: complete ? 1500 : 0,
      easing: Easing.Power.InOut(3),
      to: { y: complete ? -.05 : this.data.cubeY }
    });
    this.durations.elevate = 1500;
    setTimeout(() => this.activeTransitions--, this.durations.elevate);
  }
  /**
   * 填写
   * @param {Boolean} show 显示
   * @param {Boolean} best 最合适
   */
  complete(show, best) {
    this.activeTransitions++;
    let text = best ? this.game.dom.texts.best : this.game.dom.texts.complete;
    if (text.querySelector("span i") === null)
      text.querySelectorAll("span").forEach(span => this.splitLetters(span));
    let type = best ? "best" : "complete";
    this.flipLetters(type, text.querySelectorAll(".icon, i"), show);
    text.style.opacity = 1;
    let duration = this.durations[type];
    if (!show)
      setTimeout(() => this.game.dom.texts.timer.style.transform = "", duration);
    setTimeout(() => this.activeTransitions--, duration);
  }
  /**
   * 统计
   * @param {Boolean} show 显示
   */
  stats(show) {
    if (show)
      this.game.scores.calcStats();
    this.activeTransitions++;
    this.tweens.stats.forEach(tween => { tween.stop(); tween = null; });
    let tweenId = -1;
    let stats = this.game.dom.stats.querySelectorAll(".stats");
    stats.forEach((stat, index) => {
      this.tweens.stats[tweenId++] = new Tween({
        delay: index * (show ? 80 : 60),
        duration: 400,
        easing: show ? Easing.Power.Out(2) : Easing.Power.In(3),
        onUpdate: tween => {
          stat.style.transform = `translate3d(0, ${show ? (1 - tween.value) * 2 : tween.value}em, 0)`;
          stat.style.opacity = show ? tween.value : (1 - tween.value);
        }
      });
    });
    this.durations.stats = 0;
    setTimeout(() => this.activeTransitions--, this.durations.stats);
  }
  /**
   * 首选项
   * @param {Boolean} show 显示
   */
  preferences(show) {
    this.activeTransitions++;
    this.tweens.range.forEach(tween => {
      tween.stop();
      tween = null;
    });
    let tweenId = -1;
    let listMax = 0;
    let ranges = this.game.dom.prefs.querySelectorAll(".range");
    let easing = show ? Easing.Power.Out(2) : Easing.Power.In(3);
    ranges.forEach((range, rangeIndex) => {
      let label = range.querySelector(".range__label");
      let track = range.querySelector(".range__track-line");
      let handle = range.querySelector(".range__handle");
      let list = range.querySelectorAll(".range__list div");
      let delay = rangeIndex * (show ? 120 : 100);
      let duration = 400;
      label.style.opacity = track.style.opacity = handle.style.opacity = show ? 0 : 1;
      handle.style.pointerEvents = show ? "all" : "none";
      this.tweens.range[tweenId++] = new Tween({
        delay,
        duration,
        easing,
        /**
         * 设置更新方法
         * @param {Tween} tween 
         */
        onUpdate(tween) {
          let translate = show ? 1 - tween.value : tween.value;
          let opacity = show ? tween.value : 1 - tween.value;
          label.style.transform = `translate3d(0, ${translate}em, 0)`;
          label.style.opacity = opacity;
        }
      });
      this.tweens.range[tweenId++] = new Tween({
        delay: delay + (show ? 100 : 0),
        duration,
        easing,
        /**
         * 设置更新方法
         * @param {Tween} tween 
         */
        onUpdate(tween) {
          let translate = show ? 1 - tween.value : tween.value;
          let scale = 1 - translate;
          track.style.transform = `translate3d(0, ${translate}em, 0) scale3d(${scale}, 1, 1)`;
          track.style.opacity = scale;
        }
      });
      this.tweens.range[tweenId++] = new Tween({
        delay: delay + (show ? 100 : 0),
        duration,
        easing,
        /**
         * 设置更新方法
         * @param {Tween} tween 
         */
        onUpdate(tween) {
          let translate = show ? 1 - tween.value : tween.value;
          let opacity = 1 - translate;
          let scale = (1 + opacity) / 2;
          handle.style.transform = `translate3d(0, ${translate}em, 0) scale3d(${scale}, ${scale}, ${scale})`;
          handle.style.opacity = opacity;
        }
      });
      list.forEach((listItem, labelIndex) => {
        listItem.style.opacity = show ? 0 : 1;
        this.tweens.range[tweenId++] = new Tween({
          delay: delay + (show ? 200 + labelIndex * 50 : 0),
          duration,
          easing,
          /**
           * 设置更新方法
           * @param {Tween} tween 
           */
          onUpdate(tween) {
            let translate = show ? 1 - tween.value : tween.value;
            listItem.style.transform = `translate3d(0, ${translate}em, 0)`;
            listItem.style.opacity = 1 - translate;
          }
        });
      });
      listMax = list.length > listMax ? list.length - 1 : listMax;
      range.style.opacity = 1;
    });
    this.durations.preferences = (ranges.length - 1) * 100 + (show ? 200 + listMax * 50 : 0) + 400;
    setTimeout(() => this.activeTransitions--, this.durations.preferences);
  }
  /**
   * 标题设置
   * @param {Boolean} show 
   */
  title(show) {
    this.activeTransitions++;
    let title = this.game.dom.texts.title;
    if (title.querySelector("span i") === null)
      title.querySelectorAll("span").forEach(span => this.splitLetters(span));
    let letters = title.querySelectorAll("i");
    this.flipLetters("title", letters, show);
    title.style.opacity = 1;
    let note = this.game.dom.texts.note;
    this.tweens.title[letters.length] = new Tween({
      target: note.style,
      easing: Easing.Sine.InOut(),
      duration: show ? 800 : 400,
      yoyo: show ? true : null,
      from: { opacity: show ? 0 : parseFloat(getComputedStyle(note).opacity) },
      to: { opacity: show ? 1 : 0 },
    });
    setTimeout(() => this.activeTransitions--, this.durations.title);
  }
  timer(show) {
    this.activeTransitions++;
    let timer = this.game.dom.texts.timer;
    timer.style.opacity = 0;
    this.game.timer.convert();
    this.game.timer.setText();
    this.splitLetters(timer);
    this.flipLetters("timer", timer.querySelectorAll("i"), show);
    timer.style.opacity = 1;
    setTimeout(() => this.activeTransitions--, this.durations.timer);
  }
  /**
   * 分割字幕
   * @param {Element} element 
   */
  splitLetters(element) {
    let text = element.innerHTML;
    element.innerHTML = "";
    text.split("").forEach(letter => {
      let i = document.createElement("i");
      i.innerHTML = letter;
      element.appendChild(i);
    });
  }
  /**
   * 翻转字母
   * @param {String} type 样式
   * @param {NodeListOf<HTMLElement>} letters 字母
   * @param {Boolean} show 显示
   */
  flipLetters(type, letters, show) {
    try {
      this.tweens[type].forEach(tween => tween.stop());
    } catch (e) { }
    let duration = show ? 800 : 400;
    letters.forEach((letter, index) => {
      letter.style.opacity = show ? 0 : 1;
      this.tweens[type][index] = new Tween({
        easing: Easing.Sine.Out(),
        duration,
        delay: index * 50,
        /**
         * 设置更新方法
         * @param {Tween} tween 渐变
         */
        onUpdate(tween) {
          letter.style.transform = `rotate3d(0, 1, 0, ${(tween.value - (show ? 1 : 0)) * 80}deg)`;
          letter.style.opacity = show ? tween.value : 1 - tween.value;
        },
      });
    });
    this.durations[type] = (letters.length - 1) * 50 + duration;
  }
}
