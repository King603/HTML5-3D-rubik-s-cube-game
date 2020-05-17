export default class {
  /**
   * 图标转换器
   * @param {{}} options 选项
   */
  constructor(options = {}) {
    options = Object.assign({
      tagName: "icon",
      className: "icon",
      styles: false,
      icons: {},
      observe: false,
      convert: false,
    }, options);
    this.tagName = options.tagName;
    this.className = options.className;
    this.icons = options.icons;
    this.svgTag = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svgTag.setAttribute("class", this.className);
    if (options.styles)
      this.addStyles();
    if (options.convert)
      this.convertAllIcons();
    if (options.observe) {
      this.observer = new (window.MutationObserver || window.WebKitMutationObserver)(() => this.convertAllIcons());
      this.observer.observe(document.documentElement, { childList: true, subtree: true });
    }
    return this;
  }
  // 转换所有图标
  convertAllIcons() {
    document.querySelectorAll(this.tagName).forEach(icon => this.convertIcon(icon));
  }
  /**
   * 转换图标
   * @param {Element} icon 图片元素
   */
  convertIcon(icon) {
    let svgData = this.icons[icon.attributes[0].localName];
    if (typeof svgData === "undefined")
      return;
    let svg = this.svgTag.cloneNode(true);
    let viewBox = svgData.viewbox.split(" ");
    svg.setAttributeNS(null, "viewBox", svgData.viewbox);
    svg.style.width = viewBox[2] / viewBox[3] + "em";
    svg.style.height = "1em";
    svg.innerHTML = svgData.content;
    icon.parentNode.replaceChild(svg, icon);
  }
  addStyles() {
    let style = document.createElement("style");
    style.innerHTML = `.${this.className} { 
      display: inline-block; 
      font-size: inherit; 
      overflow: visible; 
      vertical-align: -.125em; 
      preserveAspectRatio: none; 
    }`;
    document.head.appendChild(style);
  }
}
