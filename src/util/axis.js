import { axisTop, axisLeft, axisBottom } from "d3";

export const xAxisTop = function (scale) {
  return (g) => {
    const { top, bottom } = this.margin();
    const axis = axisTop(scale).ticks(this.getResponsiveWidth() / 80);
    const selection = this.getSelectionWithRedrawContext(g);
    selection.call(axis);
    selection.selectAll(".tick line").attr("y2", this.height() - top - bottom);
  };
};

export const xAxisBottom = function (scale) {
  return (g) => {
    const axis = axisBottom(scale)
      .ticks(this.getResponsiveWidth() / 80)
      .tickSize(0);
    const selection = this.getSelectionWithRedrawContext(g);
    selection.call(axis);
  };
};

export const yAxisLeft = function (scale) {
  return (g) => {
    const selection = this.getSelectionWithRedrawContext(g);
    selection.call(axisLeft(scale));

    const { left, right } = this.margin();
    const w = this.getResponsiveWidth();
    selection.selectAll(".tick line").attr("x2", w - left - right);
  };
};
