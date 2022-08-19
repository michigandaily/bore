import { local, scaleBand, scaleLinear, max, select } from "d3";
import { xAxisBottom, yAxisLeft } from "../util/axis";
import Visual from "./Visual";
import "../css/column-chart.scss";
export default class ColumnChart extends Visual {
  constructor() {
    super();
    this.height(400);
    this.margin({ top: 20, right: 20, bottom: 40, left: 20 });
    this.color(() => "steelblue");
    this.resize(true);
    this.redraw(false);
    this.wrappx(50);
    this.xAxis(xAxisBottom);
    this.yAxis(yAxisLeft);

    this.x = null;
    this.y = local();
  }

  defaultXScale(data) {
    return scaleBand().domain(data.keys()).padding(0.3);
  }

  defaultYScale(data) {
    return scaleLinear().domain([0, max(data.values())]);
  }

  bar(rect) {
    const scale = this.y.get(this.svg.node());
    const min = scale.domain()[0];
    return rect
      .attr("class", "bar")
      .attr("y", (d) => scale(d[1]))
      .attr("height", (d) => scale(min) - scale(d[1]))
      .attr("fill", this.color());
  }

  barLabel(text) {
    const scale = this.y.get(this.svg.node());
    return text
      .attr("class", "label")
      .attr("y", (d) => scale(d[1]))
      .attr("dy", "-0.25em")
      .text(this.label());
  }

  draw(selections) {
    selections.each((data, i, selection) => {
      const { top, right, bottom, left } = this.margin();

      const node = selection[i];

      this.width(this.width() ?? node.parentNode.clientWidth);

      this.x = this.xScale() ?? this.defaultXScale(data);
      this.y
        .set(node, this.yScale() ?? this.defaultYScale(data))
        .range([this.height() - bottom, top]);

      const svg = select(node)
        .attr("height", this.height())
        .attr("class", "column-chart");
      this.svg = svg;

      this.appendOnce("g", "y-axis")
        .call(this.yAxis()(this.y.get(node), this.redraw()))
        .attr("transform", `translate(${left}, 0)`);

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

      const xAxisGroup = this.appendOnce("g", "x-axis").attr(
        "transform",
        `translate(0, ${this.height() - bottom})`
      );

      const render = () => {
        const cw = svg.node().parentNode.clientWidth;
        // eslint-disable-next-line no-nested-ternary
        const w = this.resize() ? cw : cw < this.width() ? cw : this.width();

        this.x.range([left, w - right]);
        svg.attr("width", w);

        xAxisGroup.call(this.xAxis()(w, this.x, this.redraw()));

        (this.redraw() ? bars.transition().duration(1000) : bars)
          .attr("x", (d) => this.x(d[0]))
          .attr("width", this.x.bandwidth());

        (this.redraw() ? labels.transition().duration(1000) : labels).attr(
          "x",
          (d) => this.x(d[0]) + this.x.bandwidth() / 2
        );
      };

      render();
      select(window).on(`resize.${i}`, render);
    });
  }
}
