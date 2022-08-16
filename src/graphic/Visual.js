/* eslint-disable lines-between-class-members */
/* eslint-disable no-return-assign */

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
    return arguments.length ? ((this.#margin = m), this) : this.#margin;
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

  appendOnce(svg, element, classSelector) {
    return this.redraw()
      ? svg.select(`.${classSelector}`)
      : svg.append(element).attr("class", classSelector);
  }
}
