import { local, select, scaleLinear, scaleBand, max, axisLeft } from "d3";
import Visual from "./Visual";
import wrap from "../util/wrap";
import { xAxisTop } from "../util/axis";
import "../css/bar-chart.scss";
export default class BarChart extends Visual {
  constructor() {
    super();
    this.height(150);
    this.margin({ top: 20, right: 20, bottom: 20, left: 20 });
    this.color("steelblue");
    this.label((d) => d[1]);
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

  bar(rect) {
    return rect
      .attr("class", "bar")
      .attr("y", (d) => this.y(d[0]))
      .attr("height", this.y.bandwidth())
      .attr("fill", this.color());
  }

  barLabel(text) {
    return text
      .attr("class", "label")
      .attr("dx", "0.25em")
      .attr("y", (d) => this.y(d[0]) + this.y.bandwidth() / 2)
      .text(this.label());
  }

  defaultXScale(data) {
    return scaleLinear()
      .domain([0, max(data.values())])
      .nice();
  }

  defaultYScale(data) {
    return scaleBand().domain(data.keys()).padding(0.25);
  }

  draw(selections) {
    selections.each((data, i, selection) => {
      const { top, right, bottom } = this.margin();
      let { left } = this.margin();

      const node = selection[i];

      this.x.set(node, this.xScale() ?? this.defaultXScale(data));

      this.y = this.yScale() ?? this.defaultYScale(data);
      this.y.range([top, this.height() - bottom]);

      const svg = select(node)
        .attr("height", this.height())
        .attr("class", "bar-chart");
      this.svg = svg;

      this.appendOnce("g", "y-axis")
        .call(this.yAxis().bind(this)(this.y))
        .call((g) => {
          const text = g.selectAll(".tick text");
          left += wrap(text, this.wrappx());
        })
        .attr("transform", `translate(${left}, 0)`);

      const xAxisGroup = this.appendOnce("g", "x-axis").attr(
        "transform",
        `translate(0, ${top})`
      );

      const bars = svg
        .selectAll(".bar")
        .data(data)
        .join("rect")
        .call(this.bar.bind(this));

      const labels = svg
        .selectAll(".label")
        .data(data)
        .join("text")
        .call(this.barLabel.bind(this));

      const render = () => {
        const w = this.getResponsiveWidth();
        svg.attr("width", w);

        const lx = this.x.get(node).range([left, w - right]);
        xAxisGroup.call(this.xAxis().bind(this)(lx));

        const min = lx.domain()[0];

        this.getSelectionWithRedrawContext(bars)
          .attr("x", lx(min))
          .attr("width", (d) => lx(d[1]) - lx(min));

        this.getSelectionWithRedrawContext(labels).attr("x", (d) => lx(d[1]));
      };

      render();
      select(window).on(`resize.${i}`, render);
    });

    return this;
  }
}
