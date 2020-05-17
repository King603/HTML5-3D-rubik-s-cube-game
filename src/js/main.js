// Three.js - https://github.com/mrdoob/three.js/
// RoundedBoxGeometry - https://github.com/pailhead/three-rounded-box

import Game from "./Game.js";

// 监听触摸移动事件
window.addEventListener("touchmove", () => { });
document.addEventListener("touchmove", event => event.preventDefault(), { passive: false });
// 遍历所有rang元素
document.querySelectorAll("range").forEach(el => {
  // 建立一个div元素
  let temp = document.createElement("div");
  // 添加内部内容
  temp.innerHTML =
    `<div class="range">
      <div class="range__label"></div>
      <div class="range__track">
        <div class="range__track-line"></div>
        <div class="range__handle">
          <div></div>
        </div>
      </div>
      <div class="range__list"></div>
    </div>`;
  // 在temp里获取第一个样式名为rang的元素
  let range = temp.querySelector(".range");
  // 设置name属性何el的name属性一致
  range.setAttribute("name", el.getAttribute("name"));
  // 在range里设置第一个样式名为range__label的元素的内部内容为el的title的属性
  range.querySelector(".range__label").innerHTML = el.getAttribute("title");
  // 获取el的list属性并且以“,”分割为数组进行遍历
  el.getAttribute("list").split(",").forEach(listItemText => {
    // 建立一个div元素
    let listItem = document.createElement("div");
    // 内部内容为listItemText
    listItem.innerHTML = listItemText;
    // 在range里设置第一个样式名为range__label的元素并添加新增的div元素
    range.querySelector(".range__list").appendChild(listItem);
  });
  // 替换el的父级元素的自己元素
  el.parentNode.replaceChild(range, el);
});
new Game();
