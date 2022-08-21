import { local, select, scaleLinear, max, axisBottom, axisLeft } from "d3";
import Visual from "./Visual";

export default class ScatterPlot extends Visual {
  constructor() {
    super();
    this.height(300);
    this.margin({ top: 20, right: 20, bottom: 40, left: 40 });
    this.color("steelblue");
    // this.label();
    this.resize(true);
    this.redraw(false);
    // this.wrappx();
    this.xAxis(
      function (scale) {
        return (g) => {
          const axis = axisBottom(scale).ticks(this.getResponsiveWidth() / 80);
          const selection = this.redraw() ? g.transition().duration(1000) : g;
          selection.call(axis);
        };
      }.bind(this)
    );
    this.yAxis(function (scale) {
      return (g) => {
        const selection = this.redraw() ? g.transition().duration(1000) : g;
        selection.call(axisLeft(scale));
      };
    });

    this.x = local();
    this.y = local();
  }

  defaultXScale(data) {
    return scaleLinear()
      .domain([0, max(data.keys())])
      .nice();
  }

  defaultYScale(data) {
    return scaleLinear()
      .domain([0, max(data.values())])
      .nice();
  }

  draw(selections) {
    selections.each((data, i, selection) => {
      const { top, right, bottom, left } = this.margin();

      const node = selection[i];

      this.x.set(node, this.xScale() ?? this.defaultXScale(data));
      this.y
        .set(node, this.yScale() ?? this.defaultYScale(data))
        .range([this.height() - bottom, top]);

      const svg = select(node)
        .attr("height", this.height())
        .attr("class", "scatter-plot");
      this.svg = svg;

      this.appendOnce("g", "y-axis")
        .call(this.yAxis().bind(this)(this.y.get(node)))
        .attr("transform", `translate(${left}, 0)`);

      const xAxisGroup = this.appendOnce("g", "x-axis").attr(
        "transform",
        `translate(0, ${this.height() - bottom})`
      );

      const circles = svg
        .selectAll(".circle")
        .data(data)
        .join("circle")
        .attr("class", "circle")
        .attr("fill", this.color())
        .attr("r", 5)
        .attr("cy", (d) => this.y.get(node)(d[1]));

      const render = () => {
        const w = this.getResponsiveWidth();
        svg.attr("width", w);

        const lx = this.x.get(node).range([left, w - right]);
        xAxisGroup.call(this.xAxis().bind(this)(lx));

        circles.attr("cx", (d) => lx(d[0]));
      };

      render();
      select(window).on(`resize.${i}`, render);
    });
  }
}
