import { axisTop, axisLeft } from "d3";

export const xAxisTop = (width, scale, redraw) => g => {
  const axis = axisTop(scale).ticks(width / 80);
  const removeDomain = () => g.select(".domain").remove();
  if (redraw) {
    g.transition().duration(1000).call(axis)
      .on("start", removeDomain)
  } else {
    g.call(axis);
    removeDomain();
  }
}

export const yAxisLeft = (scale, redraw) => g => {
  const axis = axisLeft(scale);
  const styleDomain = () => {
    g.select(".domain").remove();
    g.selectAll(".tick text")
      .attr("font-weight", "bold");
  }

  if (redraw) {
    g.transition().duration(1000).call(axis)
      .on("start", styleDomain);
  } else {
    g.call(axis);
    styleDomain()
  }
}
