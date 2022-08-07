/* eslint-disable lines-between-class-members */
/* eslint-disable no-return-assign */

import { local, select, scaleLinear, scaleTime, max, extent, line } from "d3";
import Visual from "./Visual";
import { yAxisLeft } from "../util/axis";

export default class LineChart extends Visual {
  #xAccess;
  #yAccess;
  #curve;

  constructor() {
    super();
    this.height(150);
    this.margin({ top: 20, right: 40, bottom: 20, left: 40 });
    this.color(() => "steelblue");
    this.resize(true);
    this.redraw(false);
    this.wrappx(20);
    this.xAxis(null);
    this.yAxis(yAxisLeft);

    this.x = null;
    this.y = local();
  }

  xAccess(x) {
    return arguments.length ? ((this.#xAccess = x), this) : this.#xAccess;
  }

  yAccess(y) {
    return arguments.length ? ((this.#yAccess = y), this) : this.#yAccess;
  }

  curve(c) {
    return arguments.length ? ((this.#curve = c), this) : this.#curve;
  }

  draw(selection) {
    selection.each((d, i, s) => {
      const { top, right, bottom, left } = this.margin();

      let svg = s[i];

      if (!this.width()) {
        this.width(svg.parentNode.clientWidth);
      }

      this.x = (
        !this.xScale()
          ? scaleTime().domain(extent(d, (v) => v[this.xAccess()]))
          : this.xScale()
      ).range([left, this.width() - right]);

      this.y.set(
        svg,
        (!this.yScale()
          ? scaleLinear().domain([0, max(d, (v) => v[this.yAccess()])])
          : this.yScale()
        ).range([this.height() - bottom, top])
      );

      svg = select(svg).attr("height", this.height());

      const path = this.redraw()
        ? svg.select(".line-path")
        : svg.append("path").attr("class", "line-path").datum(d);

      (this.redraw() ? svg.select(".y-axis") : svg.append("g"))
        .call(this.yAxis()(this.y.get(svg.node()), this.redraw()))
        .attr("class", "y-axis")
        .attr("transform", `translate(${left}, 0)`);

      const lineFunc = line().y((v) =>
        this.y.get(svg.node())(v[this.yAccess()])
      );

      if (this.curve()) {
        lineFunc.curve(this.curve());
      }

      const xAxisGroup = (
        this.redraw() ? svg.select(".x-axis") : svg.append("g")
      )
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${this.height() - bottom})`);

      const render = () => {
        const cw = svg.node().parentNode.clientWidth;
        // eslint-disable-next-line no-nested-ternary
        const w = this.resize() ? cw : cw < this.width() ? cw : this.width();

        svg.attr("width", w);

        const lx = this.x.range([left, w - right]);

        lineFunc.x((v) => lx(v[this.xAccess()]));
        xAxisGroup.call(this.xAxis()(w, lx, this.redraw()));

        const p = this.redraw() ? path.transition().duration(1000) : path;
        p.attr("d", lineFunc)
          .attr("fill", "none")
          .attr("stroke", this.color())
          .attr("stroke-width", 5);
      };

      render();
      select(window).on(`resize.${i}`, render);
    });

    return this;
  }
}
