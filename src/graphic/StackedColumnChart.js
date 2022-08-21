import {
  select,
  local,
  scaleLinear,
  max,
  sum,
  scaleBand,
  stack,
  axisLeft,
} from "d3";
import { xAxisBottom } from "../util/axis";
import Visual from "./Visual";

export default class StackedColumnChart extends Visual {
  constructor() {
    super();
    this.height(300);
    this.margin({ top: 20, right: 20, left: 30, bottom: 20 });
    this.yAxis((scale, redraw) => (g) => {
      const selection = redraw ? g.transition().duration(1000) : g;
      selection.call(axisLeft(scale));
    });
    this.xAxis(xAxisBottom);
    this.resize(true);
    this.redraw(false);
    this.color(() => "steelblue");
    this.label((d) => d[1]);
    this.wrappx(50);

    this.y = local();
    this.x = null;
  }

  defaultYScale(data) {
    const maximum = max(data.values(), (d) => sum(this.keys.map((k) => d[k])));
    return scaleLinear().domain([0, maximum]);
  }

  defaultXScale(data) {
    return scaleBand().domain(data.keys()).padding(0.3);
  }

  bar(rect) {
    const scale = this.y.get(this.svg.node());
    const selection = this.redraw() ? rect.transition().duration(1000) : rect;
    return selection
      .attr("y", (y) => scale(y[1]))
      .attr("height", ([y0, y1]) => scale(y0) - scale(y1));
  }

  draw(selections) {
    selections.each((data, i, selection) => {
      this.keys = Object.keys(data.values().next().value);
      const { top, left, bottom, right } = this.margin();
      const node = selection[i];

      const svg = select(node)
        .attr("height", this.height())
        .attr("class", "stacked-column-chart");
      this.svg = svg;

      this.x = this.xScale() ?? this.defaultXScale(data);

      this.y
        .set(node, this.yScale() ?? this.defaultYScale(data))
        .range([this.height() - bottom, top]);

      this.appendOnce("g", "y-axis")
        .call(this.yAxis()(this.y.get(node), this.redraw()))
        .attr("transform", `translate(${left}, 0)`);

      const xAxisGroup = this.appendOnce("g", "x-axis").attr(
        "transform",
        `translate(0, ${this.height() - bottom})`
      );

      const series = stack().keys(this.keys)(data.values());

      const rect = svg
        .selectAll(".bar-group")
        .data(series)
        .join("g")
        .attr("class", "bar-group")
        .attr("fill", this.color())
        .selectAll("rect")
        .data((d) => d)
        .join("rect")
        .call(this.bar.bind(this));

      const render = () => {
        const w = this.getResponsiveWidth();

        svg.attr("width", w);
        this.x.range([left, w - right]);
        xAxisGroup.call(this.xAxis()(w, this.x, this.redraw()));

        rect
          .attr("width", this.x.bandwidth())
          .attr("x", (_, i) => this.x(Array.from(data.keys())[i]));
      };

      render();
      select(window).on(`resize.${i}`, render);
    });
  }
}
