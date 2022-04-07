/* eslint-disable no-underscore-dangle */
import { local, select, scaleLinear, scaleBand, max } from "d3";
import Visual from "./Visual";
import wrap from "../util/wrap";
import { xAxisTop, yAxisLeft } from "../util/axis";

export default class BarChart extends Visual {
  constructor() {
    super();
    this._height = 150;
    this._width = null;
    this._margin = { top: 20, right: 40, bottom: 20, left: 40 };
    this._xScale = null;
    this._yScale = null;
    this._color = () => "steelblue";
    this._label = (d) => d[1];
    this._resize = true;
    this._redraw = false;
    this._wrappx = 50;

    this.x = local();
    this.y = null;

    this.xAxis = xAxisTop;
    this.yAxis = yAxisLeft;
  }

  draw(selection) {
    const xSplit = (width, scale) => g => {
      g.selectAll("line")
        .data(scale.ticks(width / 80))
        .join(
          enter => enter.append("line")
            .attr("x1", scale).attr("x2", scale),
          update => ((this._redraw) ? update.transition().duration(1000) : update)
            .attr("x1", scale).attr("x2", scale)
        )
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .attr("y2", this._height - this._margin.bottom - this._margin.top)
    }

    const bar = rect => rect
      .attr("class", "bar")
      .attr("y", d => this.y(d[0]))
      .attr("height", this.y.bandwidth())
      .attr("fill", this._color);

    const barLabel = text => text
      .attr("class", "label")
      .attr("dx", "0.25em")
      .attr("y", d => this.y(d[0]) + this.y.bandwidth() / 2)
      .attr("alignment-baseline", "central")
      .attr("font-family", "sans-serif")
      .attr("font-weight", 600)
      .attr("font-size", 10)
      .text(this._label);

    const m = { ...this.margin() };

    selection.each((d, i, s) => {
      this.margin({ ...m });

      let svg = s[i];

      if (this.width() === null) {
        this.width(svg.parentNode.clientWidth);
      }

      this.x.set(svg, ((this._xScale === null)
        ? scaleLinear().domain([0, max(d.values())]).nice()
        : this._xScale)
        .range([this._margin.left, this._width - this._margin.right])
      );

      this.y = ((this._yScale === null)
        ? scaleBand().domain(d.keys()).padding(0.3)
        : this._yScale)
        .range([this._height - this._margin.bottom, this._margin.top]);

      svg = select(svg)
        .attr("height", this._height);

      ((this._redraw) ? svg.select(".y-axis") : svg.append("g"))
        .call(this.yAxis(this.y))
        .call(g => {
          const text = g.selectAll(".tick text");
          this._margin.left += wrap(text, this._wrappx);
        })
        .attr("class", "y-axis")
        .attr("transform", `translate(${this._margin.left}, 0)`);

      const bars = svg.selectAll(".bar")
        .data(d)
        .join("rect")
        .call(bar);

      const xAxisGroup = ((this._redraw) ? svg.select(".x-axis") : svg.append("g"))
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${this._margin.top})`);

      const xSplitGroup = ((this._redraw) ? svg.select(".x-split") : svg.append("g"))
        .attr("class", "x-split")
        .attr("transform", `translate(0, ${this._margin.top})`);

      const labels = svg.selectAll(".label")
        .data(d)
        .join("text")
        .call(barLabel);

      const render = () => {
        const cw = svg.node().parentNode.clientWidth;
        // eslint-disable-next-line no-nested-ternary
        const w = (this._resize) ? cw : (cw < this._width) ? cw : this._width;

        svg.attr("width", w);

        const _x = this.x.get(svg.node())
          .range([this._margin.left, w - this._margin.right]);

        xAxisGroup.call(this.xAxis(w, _x, this._redraw));
        xSplitGroup.call(xSplit(w, _x));

        const min = _x.domain()[0];

        ((this._redraw) ? bars.transition().duration(1000) : bars)
          .attr("x", _x(min))
          .attr("width", datum => _x(datum[1]) - _x(min));

        ((this._redraw) ? labels.transition().duration(1000) : labels)
          .attr("x", datum => _x(datum[1]));
      }

      render();
      select(window).on(`resize.${i}`, render);
    });
    return this
  }
}
