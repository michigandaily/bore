/* eslint-disable func-names */
/* eslint-disable no-return-assign */
/* eslint-disable no-underscore-dangle */
import * as d3 from "d3";
import { wrap } from "./util";
import { xAxisTop, yAxisLeft } from "./axis";

export * from "./color";
export * from "./util";

export class Visual {
  constructor() {
    let width;
    let height = 150;
    let xScale;
    let yScale;
    let margin = { top: 20, right: 40, bottom: 20, left: 40 };
    let color = () => "steelblue"; let label = d => d[1];
    let resize = true;
    let redraw = false;
    let wrappx = 50;

    let xAxis = xAxisTop;
    let yAxis = yAxisLeft;

    this.main = function () { };

    this.main.width = function (w) {
      return (arguments.length) ? (width = w, this) : width;
    };

    this.main.height = function (h) {
      return (arguments.length) ? (height = h, this) : height;
    };

    this.main.margin = function (m) {
      return (arguments.length) ? (margin = m, this) : margin;
    };

    this.main.xScale = function (_) {
      return (arguments.length) ? (xScale = _, this) : xScale;
    };

    this.main.xAxis = function (f) {
      return (arguments.length) ? (xAxis = f, this) : xAxis;
    };

    this.main.yAxis = function (f) {
      return (arguments.length) ? (yAxis = f, this) : yAxis;
    };

    this.main.yScale = function (_) {
      return (arguments.length) ? (yScale = _, this) : yScale;
    };

    this.main.color = function (c) {
      return (arguments.length) ? (color = c, this) : color;
    };

    this.main.label = function (l) {
      return (arguments.length) ? (label = l, this) : label;
    };

    this.main.resize = function (r) {
      return (arguments.length) ? (resize = r, this) : resize;
    };

    this.main.redraw = function (r) {
      return (arguments.length) ? (redraw = r, this) : redraw;
    };

    this.main.wrappx = function (px) {
      return (arguments.length) ? (wrappx = px, this) : wrappx;
    };

    this.main.draw = function () {
      redraw = true;
      return this;
    };
  }
}

export function barChart() {
  const v = new Visual();
  const x = d3.local();
  let y;

  const xSplit = (w, scale) => g => {
    g.selectAll("line")
      .data(scale.ticks(w / 80))
      .join(
        enter => enter.append("line")
          .attr("x1", scale).attr("x2", scale),
        update => ((v.main.redraw()) ? update.transition().duration(1000) : update)
          .attr("x1", scale).attr("x2", scale)
      )
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .attr("y2", v.main.height() - v.main.margin().bottom - v.main.margin().top)
  }

  const bar = rect => rect
    .attr("class", "bar")
    .attr("y", d => y(d[0]))
    .attr("height", y.bandwidth())
    .attr("fill", v.main.color());

  const barLabel = text => text
    .attr("class", "label")
    .attr("dx", "0.25em")
    .attr("y", d => y(d[0]) + y.bandwidth() / 2)
    .attr("alignment-baseline", "central")
    .attr("font-family", "sans-serif")
    .attr("font-weight", 600)
    .attr("font-size", 10)
    .text(v.main.label());

  const init = svg => {
    const data = d3.select(svg).datum();

    if (v.main.width() === undefined)
      v.main.width(svg.parentNode.clientWidth);

    x.set(svg, ((v.main.xScale() === undefined)
      ? d3.scaleLinear().domain([0, d3.max(data.values())]).nice()
      : v.main.xScale())
      .range([v.main.margin().left, v.main.width() - v.main.margin().right])
    );

    y = ((v.main.yScale() === undefined)
      ? d3.scaleBand().domain(data.keys()).padding(0.3)
      : v.main.yScale())
      .range([v.main.height() - v.main.margin().bottom, v.main.margin().top]);
  }

  const funcs = Object.entries(v.main);
  const margin = v.main.margin();

  v.main = function (selection) {
    selection.each(function (data, index) {
      init(this);

      v.main.margin({ ...margin });

      const svg = d3.select(this)
        .attr("height", v.main.height());

      ((v.main.redraw()) ? svg.select(".y-axis") : svg.append("g"))
        .call(v.main.yAxis()(y))
        .call(g => {
          const text = g.selectAll(".tick text");
          v.main.margin().left += wrap(text, v.main.wrappx());
        })
        .attr("class", "y-axis")
        .attr("transform", `translate(${v.main.margin().left}, 0)`);

      const bars = svg.selectAll(".bar")
        .data(data)
        .join("rect")
        .call(bar);

      const xAxisGroup = ((v.main.redraw()) ? svg.select(".x-axis") : svg.append("g"))
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${v.main.margin().top})`);

      const xSplitGroup = ((v.main.redraw()) ? svg.select(".x-split") : svg.append("g"))
        .attr("class", "x-split")
        .attr("transform", `translate(0, ${v.main.margin().top})`);

      const labels = svg.selectAll(".label")
        .data(data)
        .join("text")
        .call(barLabel);

      const render = () => {
        const cw = this.parentNode.clientWidth;
        // eslint-disable-next-line no-nested-ternary
        const w = (v.main.resize()) ? cw : (cw < v.main.width()) ? cw : v.main.width();

        svg.attr("width", w);

        const _x = x.get(this)
          .range([v.main.margin().left, w - v.main.margin().right]);

        xAxisGroup.call(v.main.xAxis()(w, _x, v.main.redraw()));
        xSplitGroup.call(xSplit(w, _x));

        const min = _x.domain()[0];

        ((v.main.redraw()) ? bars.transition().duration(1000) : bars)
          .attr("x", _x(min))
          .attr("width", d => _x(d[1]) - _x(min));

        ((v.main.redraw()) ? labels.transition().duration(1000) : labels)
          .attr("x", d => _x(d[1]));
      }

      render();
      d3.select(window).on(`resize.${index}`, render);
    });
  }

  funcs.forEach(([prop, func]) => {
    v.main[prop] = func;
  });

  return v.main;
}

export function groupedBarChart() {
  const v = new Visual();
  const x = d3.local();
  let y0;
  let y1;

  const barLabel = text => text
    .attr("class", "label")
    .attr("dx", "0.25em")
    .attr("y", d => y1(d[0]) + y1.bandwidth() / 2)
    .attr("alignment-baseline", "central")
    .attr("font-family", "sans-serif")
    .attr("font-weight", 600)
    .attr("font-size", 10)
    .text(v.main.label());

  const init = svg => {
    const data = d3.select(svg).datum();
    const keys = Object.keys(data.values().next().value);

    if (v.main.width() === undefined)
      v.main.width(svg.parentNode.clientWidth);

    x.set(svg, ((v.main.xScale() === undefined)
      ? d3.scaleLinear().domain(
        // eslint-disable-next-line no-shadow
        [0, d3.max(data, d => d3.max(Object.entries(d[1]), d => +d[1]))]
      ).nice()
      : v.main.xScale())
      .range([v.main.margin().left, v.main.width() - v.main.margin().right])
    );

    y0 = d3.scaleBand()
      .domain(data.keys())
      .range([v.main.height() - v.main.margin().bottom, v.main.margin().top])
      .padding(0.3);

    y1 = d3.scaleBand()
      .domain(keys)
      .range([0, y0.bandwidth()]);
  }

  const funcs = Object.entries(v.main);
  const margin = v.main.margin();

  v.main = function (selection) {
    selection.each(function (data, index) {
      init(this);

      v.main.margin({ ...margin });

      const svg = d3.select(this)
        .attr("height", v.main.height());

      ((v.main.redraw()) ? svg.select(".y-axis") : svg.append("g"))
        .call(v.main.yAxis()(y0))
        .call(g => {
          const text = g.selectAll(".tick text");
          margin.left += wrap(text, v.main.wrappx());
        })
        .attr("class", "y-axis")
        .attr("transform", `translate(${margin.left}, 0)`);

      const xAxisGroup = ((v.main.redraw()) ? svg.select(".x-axis") : svg.append("g"))
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${margin.top})`);

      const groups = svg.selectAll(".bargroup")
        .data(data)
        .join("g")
        .attr("class", "bargroup")
        .attr("transform", d => `translate(0, ${y0(d[0])})`)

      const bars = groups
        .selectAll("rect")
        .data(d => Object.entries(d[1]))
        .join("rect")
        .attr("y", d => y1(d[0]))
        .attr("height", y1.bandwidth())
        .attr("fill", v.main.color());

      const labels = groups
        .selectAll("text")
        .data(d => Object.entries(d[1]))
        .join("text")
        .attr("y", d => y1(d[0]))
        .call(barLabel)

      const render = () => {
        const cw = this.parentNode.clientWidth;
        // eslint-disable-next-line no-nested-ternary
        const w = (v.main.resize()) ? cw : (cw < v.main.width()) ? cw : v.main.width();

        svg.attr("width", w);
        const _x = x.get(this)
          .range([margin.left, w - margin.right]);

        xAxisGroup.call(v.main.xAxis()(w, _x, v.main.redraw()));
        const min = _x.domain()[0];

        ((v.main.redraw()) ? bars.transition().duration(1000) : bars)
          .attr("x", _x(min))
          .attr("width", d => _x(d[1]) - _x(min));

        ((v.main.redraw()) ? labels.transition().duration(1000) : labels)
          .attr("x", d => _x(d[1]));
      };

      render();
      d3.select(window).on(`resize.${index}`, render);
    });
  }

  funcs.forEach(([prop, func]) => {
    v.main[prop] = func;
  });

  return v.main;
}