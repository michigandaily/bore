import * as d3 from "d3";
import { wrap } from "./util.js";
import { xAxisTop, yAxisLeft } from "./axis.js";

export * from "./color.js";

export function barChart() {
  let width, height = 150;
  let x = d3.local(), y, xScale, yScale;
  let margin = { top: 20, right: 40, bottom: 20, left: 40 };
  let color = () => "steelblue", label = d => d[1];
  let resize = true;
  let redraw = false;

  let xAxis = xAxisTop;
  let yAxis = yAxisLeft;

  const xSplit = (width, scale) => g => {
    g.selectAll("line")
      .data(scale.ticks(width / 80))
      .join(
        enter => enter.append("line")
          .attr("x1", scale).attr("x2", scale),
        update => ((redraw) ? update.transition().duration(1000) : update)
          .attr("x1", scale).attr("x2", scale)
      )
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .attr("y2", height - margin.bottom - margin.top)
  }

  const bar = rect => rect
    .attr("class", "bar")
    .attr("y", d => y(d[0]))
    .attr("height", y.bandwidth())
    .attr("fill", d => color(d[0]));

  const barLabel = text => text
    .attr("class", "label")
    .attr("dx", "0.25em")
    .attr("y", d => y(d[0]) + y.bandwidth() / 2)
    .attr("alignment-baseline", "central")
    .attr("font-family", "sans-serif")
    .attr("font-weight", 600)
    .attr("font-size", 10)
    .text(label);

  const init = svg => {
    const data = d3.select(svg).datum();

    if (width === undefined)
      width = svg.parentNode.clientWidth;

    x.set(svg, ((xScale === undefined)
      ? d3.scaleLinear().domain([0, d3.max(data.values())]).nice()
      : xScale)
      .range([margin.left, width - margin.right])
    );

    y = ((yScale === undefined)
      ? d3.scaleBand().domain(data.keys()).padding(0.3)
      : yScale)
      .range([height - margin.bottom, margin.top]);
  }

  function main(selection) {
    selection.each(function (data, index) {
      init(this);

      const svg = d3.select(this)
        .attr("height", height);

      ((redraw) ? svg.select(".y-axis") : svg.append("g"))
        .call(yAxis(y))
        .call(g => {
          let text = g.selectAll(".tick text");
          margin.left = wrap(text, 100) + 5;
        })
        .attr("class", "y-axis")
        .attr("transform", `translate(${margin.left}, 0)`);

      const bars = svg.selectAll(".bar")
        .data(data)
        .join("rect")
        .call(bar);

      const xAxisGroup = ((redraw) ? svg.select(".x-axis") : svg.append("g"))
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${margin.top})`);

      const xSplitGroup = ((redraw) ? svg.select(".x-split") : svg.append("g"))
        .attr("class", "x-split")
        .attr("transform", `translate(0, ${margin.top})`);

      const labels = svg.selectAll(".label")
        .data(data)
        .join("text")
        .call(barLabel);

      const render = () => {
        const cw = this.parentNode.clientWidth;
        const w = (resize) ? cw : (cw < width) ? cw : width;

        svg.attr("width", w);

        const _x = x.get(this)
          .range([margin.left, w - margin.right]);

        xAxisGroup.call(xAxis(w, _x, redraw));
        xSplitGroup.call(xSplit(w, _x));

        const min = _x.domain()[0];

        ((redraw) ? bars.transition().duration(1000) : bars)
          .attr("x", _x(min))
          .attr("width", d => _x(d[1]) - _x(min));

        ((redraw) ? labels.transition().duration(1000) : labels)
          .attr("x", d => _x(d[1]));
      }

      render();
      d3.select(window).on(`resize.${index}`, render);
    });
  }

  main.width = function (w) {
    return (arguments.length) ? (width = w, main) : width;
  }

  main.height = function (h) {
    return (arguments.length) ? (height = h, main) : height;
  }

  main.margin = function (m) {
    return (arguments.length) ? (margin = m, main) : margin;
  }

  main.xScale = function (_) {
    return (arguments.length) ? (xScale = _, main) : xScale;
  }

  main.xAxis = function (f) {
    return (arguments.length) ? (xAxis = f, main) : xAxis;
  }

  main.yAxis = function (f) {
    return (arguments.length) ? (yAxis = f, main) : yAxis;
  }

  main.yScale = function (_) {
    return (arguments.length) ? (yScale = _, main) : yScale;
  }

  main.color = function (c) {
    return (arguments.length) ? (color = c, main) : color;
  }

  main.label = function (l) {
    return (arguments.length) ? (label = l, main) : label;
  }

  main.resize = function (r) {
    return (arguments.length) ? (resize = r, main) : resize;
  }

  main.redraw = function () {
    redraw = true;
    return main;
  }

  return main;
}
