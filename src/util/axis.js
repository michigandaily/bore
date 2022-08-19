import { axisTop, axisLeft, axisBottom } from "d3";

export const xAxisTop = (width, scale, redraw) => (g) => {
  const axis = axisTop(scale).ticks(width / 80);
  const selection = redraw ? g.transition().duration(1000) : g;
  selection.call(axis);
};

export const xAxisBottom = (width, scale, redraw) => (g) => {
  const axis = axisBottom(scale)
    .ticks(width / 80)
    .tickSize(0);
  const selection = redraw ? g.transition().duration(1000) : g;
  selection.call(axis);
};

export const yAxisLeft = (scale) => (g) => {
  g.call(axisLeft(scale).tickSize(0));
};
