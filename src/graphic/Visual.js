/* eslint-disable no-underscore-dangle */
/* eslint-disable no-return-assign */

export default class Visual {
  width(w) {
    return (arguments.length) ? (this._width = w, this) : this._width;
  }

  height(h) {
    return (arguments.length) ? (this._height = h, this) : this._height;
  }

  margin(m) {
    return (arguments.length) ? (this._margin = m, this) : this._margin;
  }

  xScale(s) {
    return (arguments.length) ? (this._xScale = s, this) : this._xScale;
  }

  yScale(s) {
    return (arguments.length) ? (this._yScale = s, this) : this._yScale;
  }

  color(c) {
    return (arguments.length) ? (this._color = c, this) : this._color;
  }

  label(l) {
    return (arguments.length) ? (this._label = l, this) : this._label;
  }

  resize(r) {
    return (arguments.length) ? (this._resize = r, this) : this._resize;
  }

  redraw() {
    this._redraw = true;
    return this;
  }

  wrappx(px) {
    return (arguments.length) ? (this._wrappx = px, this) : this._wrappx;
  }
};