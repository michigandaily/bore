import { axisTop, axisLeft, axisBottom } from "d3";

export const xAxisTop = function (scale) {
  return (g) => {
    const axis = axisTop(scale).ticks(this.getResponsiveWidth() / 80);
    const selection = this.redraw() ? g.transition().duration(1000) : g;
    selection.call(axis);
  };
};

export const xAxisBottom = function (scale) {
  return (g) => {
    const axis = axisBottom(scale)
      .ticks(this.getResponsiveWidth() / 80)
      .tickSize(0);
    const selection = this.redraw() ? g.transition().duration(1000) : g;
    selection.call(axis);
  };
};

export const yAxisLeft = function (scale) {
  return (g) => {
    const selection = this.redraw() ? g.transition().duration(1000) : g;
    selection.call(axisLeft(scale).tickSize(0));
  };
};
