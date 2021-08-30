import * as d3 from "d3";

export const xAxisTop = (width, scale) => g => {
  g.call(d3.axisTop(scale).ticks(width / 80));
  g.select(".domain").remove();
}

export const yAxisLeft = scale => g => {
  g.call(d3.axisLeft(scale).tickSize(0));
  g.select(".domain").remove();
  g.selectAll(".tick text")
    .attr("font-weight", "bold");
}
