import "../css/visual.scss";

export default class Visual {
  #width;
  #height;
  #margin;
  #xScale;
  #xAxis;
  #yScale;
  #yAxis;
  #color;
  #label;
  #resize;
  #redraw;
  #wrappx;

  width(w) {
    return arguments.length ? ((this.#width = w), this) : this.#width;
  }

  height(h) {
    return arguments.length ? ((this.#height = h), this) : this.#height;
  }

  margin(m) {
    return arguments.length
      ? ((this.#margin = { ...this.#margin, ...m }), this)
      : this.#margin;
  }

  xScale(s) {
    return arguments.length ? ((this.#xScale = s), this) : this.#xScale;
  }

  xAxis(a) {
    return arguments.length ? ((this.#xAxis = a), this) : this.#xAxis;
  }

  yScale(s) {
    return arguments.length ? ((this.#yScale = s), this) : this.#yScale;
  }

  yAxis(a) {
    return arguments.length ? ((this.#yAxis = a), this) : this.#yAxis;
  }

  color(c) {
    return arguments.length ? ((this.#color = c), this) : this.#color;
  }

  label(l) {
    return arguments.length ? ((this.#label = l), this) : this.#label;
  }

  resize(r) {
    return arguments.length ? ((this.#resize = r), this) : this.#resize;
  }

  redraw(r) {
    return arguments.length ? ((this.#redraw = r), this) : this.#redraw;
  }

  wrappx(px) {
    return arguments.length ? ((this.#wrappx = px), this) : this.#wrappx;
  }

  appendOnce(element, classSelector) {
    return this.redraw()
      ? this.svg.select(`.${classSelector}`)
      : this.svg.append(element).attr("class", classSelector);
  }

  getResponsiveWidth() {
    // If the graphic should resize, return the parent container's width.
    // If the graphic should not resize and the desired width is greater
    // than the parent container's width, return the parent container's width.
    // Otherwise, return the desired width.
    const node = this.svg.node();
    const cw = node.parentNode.clientWidth;
    return this.resize() ? cw : cw < this.width() ? cw : this.width();
  }
}
