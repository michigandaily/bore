import {
  local,
  max,
  scaleBand,
  scaleLinear,
  sum,
  select,
  stack,
  axisLeft,
} from "d3";
import wrap from "../util/wrapLeft";
import { xAxisTop } from "../util/axis";
import Visual from "./Visual";

export default class StackedBarChart extends Visual {
  constructor() {
    super();
    this.height(200);
    this.margin({ top: 20, right: 20, bottom: 20, left: 20 });
    this.color("steelblue");
    // this.label();
    this.resize(true);
    this.redraw(false);
    this.wrappx(50);
    this.xAxis(xAxisTop);
    this.yAxis(function (scale) {
      return (g) => {
        const selection = this.getSelectionWithRedrawContext(g);
        selection.call(axisLeft(scale).tickSize(0));
      };
    });

    this.x = local();
    this.y = null;
  }

  defaultXScale(data) {
    const maximum = max(data.values(), (d) => sum(this.keys.map((k) => d[k])));
    return scaleLinear().domain([0, maximum]);
  }

  defaultYScale(data) {
    return scaleBand().domain(data.keys()).padding(0.3);
  }

  draw(selections) {
    selections.each((data, i, selection) => {
      const { top, right, bottom } = this.margin();
      let { left } = this.margin();
      this.keys = Object.keys(data.values().next().value);
      const node = selection[i];

      this.x.set(node, this.xScale() ?? this.defaultXScale(data));

      this.y = this.yScale() ?? this.defaultYScale(data);
      this.y.range([top, this.height() - bottom]);

      const svg = select(node)
        .attr("height", this.height())
        .attr("class", "stacked-bar-chart");
      this.svg = svg;

      this.appendOnce("g", "y-axis")
        .call(this.yAxis().bind(this)(this.y))
        .call((g) => {
          const text = g.selectAll(".tick text");
          const shift = wrap(text, this.wrappx());
          left = shift + 5;
        })
        .attr("transform", `translate(${left}, 0)`);

      const xAxisGroup = this.appendOnce("g", "x-axis").attr(
        "transform",
        `translate(0, ${top})`
      );

      const series = stack().keys(this.keys)(data.values());

      const bars = svg
        .selectAll(".bar-group")
        .data(series)
        .join("g")
        .attr("fill", this.color())
        .attr("class", "bar-group")
        .selectAll(".bar")
        .data((d) => d)
        .join("rect")
        .attr("class", "bar")
        .attr("y", (_, i) => this.y(Array.from(data.keys())[i]))
        .attr("height", this.y.bandwidth());

      const render = () => {
        const w = this.getResponsiveWidth();

        svg.attr("width", w);
        const lx = this.x.get(node).range([left, w - right]);
        xAxisGroup.call(this.xAxis().bind(this)(lx));

        this.getSelectionWithRedrawContext(bars)
          .attr("width", ([x0, x1]) => lx(x1) - lx(x0))
          .attr("x", ([x0]) => lx(x0));
      };

      render();
      select(window).on(`resize.${i}`, render);
    });
  }
}
