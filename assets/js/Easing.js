// 容位
export default {
  // 权力
  Power: {
    In(power = 1) {
      power = Math.round(power);
      return t => Math.pow(t, power);
    },
    Out(power = 1) {
      power = Math.round(power);
      return t => 1 - Math.abs(Math.pow(t - 1, power));
    },
    InOut(power = 1) {
      power = Math.round(power);
      return t => t < .5
        ? Math.pow(t * 2, power) / 2
        : (1 - Math.abs(Math.pow((t * 2 - 1) - 1, power))) / 2 + .5;
    },
  },
  // 正弦
  Sine: {
    In() {
      t =>
        1 + Math.sin(Math.PI / 2 * t - Math.PI / 2);
    },
    Out() {
      t =>
        Math.sin(Math.PI / 2 * t);
    },
    InOut() {
      t =>
        (1 + Math.sin(Math.PI * t - Math.PI / 2)) / 2;
    },
  },
  // 返回
  Back: {
    Out(s = 1.70158) {
      return t =>
        (t -= 1) * t * ((s + 1) * t + s) + 1;
    },
    In(s = 1.70158) {
      return t =>
        t * t * ((s + 1) * t - s);
    }
  },
  // 弹性
  Elastic: {
    Out(amplitude, period = .3) {
      let round = Math.PI * 2;
      let p1 = Math.max(amplitude, 1);
      let p2 = period / Math.min(amplitude, 1);
      p2 = round / p2;
      return t => p1 * Math.pow(2, -10 * t) * Math.sin((t - p2 / round * (Math.asin(1 / p1) || 0)) * p2) + 1;
    },
  },
};
