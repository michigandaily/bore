import { axisTop, axisLeft, axisBottom } from "d3";

export const xAxisTop = (width, scale, redraw) => (g) => {
  const axis = axisTop(scale).ticks(width / 80);
  const removeDomain = () => g.select(".domain").remove();
  if (redraw) {
    g.transition().duration(1000).call(axis).on("start", removeDomain);
  } else {
    g.call(axis);
    removeDomain();
  }
};

export const xAxisBottom = (width, scale, redraw) => (g) => {
  const axis = axisBottom(scale).ticks(width / 80);
  const removeDomain = () => g.select(".domain").remove();
  if (redraw) {
    g.transition().duration(1000).call(axis).on("start", removeDomain);
  } else {
    g.call(axis);
    removeDomain();
  }
};

export const yAxisLeft = (scale) => (g) => {
  g.call(axisLeft(scale).tickSize(0));
  g.select(".domain").remove();
  g.selectAll(".tick text").attr("font-weight", "bold");
};
