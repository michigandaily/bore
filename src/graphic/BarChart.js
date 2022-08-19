import { local, select, scaleLinear, scaleBand, max } from "d3";
import Visual from "./Visual";
import wrap from "../util/wrap";
import { xAxisTop, yAxisLeft } from "../util/axis";
import "../css/bar-chart.scss";
export default class BarChart extends Visual {
  constructor() {
    super();
    this.height(150);
    this.margin({ top: 20, right: 40, bottom: 20, left: 40 });
    this.color(() => "steelblue");
    this.label((d) => d[1]);
    this.resize(true);
    this.redraw(false);
    this.wrappx(50);
    this.xAxis(xAxisTop);
    this.yAxis(yAxisLeft);

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
    return scaleBand().domain(data.keys()).padding(0.3);
  }

  draw(selections) {
    selections.each((data, i, selection) => {
      const { top, right, bottom } = this.margin();
      let { left } = this.margin();

      const node = selection[i];

      this.width(this.width() ?? node.parentNode.clientWidth);

      this.x
        .set(node, this.xScale() ?? this.defaultXScale(data))
        .range([left, this.width() - right]);

      this.y = this.yScale() ?? this.defaultYScale(data);
      this.y.range([top, this.height() - bottom]);

      const svg = select(node)
        .attr("height", this.height())
        .attr("class", "bar-chart");
      this.svg = svg;

      this.appendOnce("g", "y-axis")
        .call(this.yAxis()(this.y))
        .call((g) => {
          const text = g.selectAll(".tick text");
          left += wrap(text, this.wrappx());
        })
        .attr("transform", `translate(${left}, 0)`);

      const bars = svg
        .selectAll(".bar")
        .data(data)
        .join("rect")
        .call(this.bar.bind(this));

      const xAxisGroup = this.appendOnce("g", "x-axis").attr(
        "transform",
        `translate(0, ${top})`
      );

      const labels = svg
        .selectAll(".label")
        .data(data)
        .join("text")
        .call(this.barLabel.bind(this));

      const render = () => {
        const cw = node.parentNode.clientWidth;
        // eslint-disable-next-line no-nested-ternary
        const w = this.resize() ? cw : cw < this.width() ? cw : this.width();

        svg.attr("width", w);

        const lx = this.x.get(node).range([left, w - right]);

        xAxisGroup.call(this.xAxis()(w, lx, this.redraw()));

        const min = lx.domain()[0];

        (this.redraw() ? bars.transition().duration(1000) : bars)
          .attr("x", lx(min))
          .attr("width", (d) => lx(d[1]) - lx(min));

        (this.redraw() ? labels.transition().duration(1000) : labels).attr(
          "x",
          (d) => lx(d[1])
        );
      };

      render();
      select(window).on(`resize.${i}`, render);
    });

    return this;
  }
}
