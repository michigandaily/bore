import { local, scaleBand, scaleLinear, max, select } from "d3";
import { xAxisBottom, yAxisLeft } from "../util/axis";
import Visual from "./Visual";
import "../css/column-chart.scss";
import wrap from "../util/wrapBottom";

export default class ColumnChart extends Visual {
  constructor() {
    super();
    this.height(400);
    this.margin({ top: 20, right: 20, bottom: 40, left: 30 });
    this.color("steelblue");
    this.label((d) => d[1]);
    this.resize(true);
    this.redraw(false);
    this.wrappx(50);
    this.xAxis(xAxisBottom);
    this.yAxis(yAxisLeft);

    this.x = null;
    this.y = local();
  }

  bar(rect) {
    const scale = this.y.get(this.svg.node());
    const min = scale.domain()[0];
    const selection = this.getSelectionWithRedrawContext(rect);
    return selection
      .attr("class", "bar")
      .attr("y", (d) => scale(d[1]))
      .attr("height", (d) => scale(min) - scale(d[1]))
      .attr("fill", this.color());
  }

  barLabel(text) {
    const scale = this.y.get(this.svg.node());
    const selection = this.getSelectionWithRedrawContext(text);
    return selection
      .attr("class", "label")
      .attr("y", (d) => scale(d[1]))
      .attr("dy", "-0.25em")
      .text(this.label());
  }

  defaultXScale(data) {
    return scaleBand().domain(data.keys()).padding(0.25);
  }

  defaultYScale(data) {
    return scaleLinear()
      .domain([0, max(data.values())])
      .nice();
  }

  draw(selections) {
    selections.each((data, i, selection) => {
      const { top, right, left } = this.margin();
      let { bottom } = this.margin();

      const node = selection[i];

      const svg = select(node)
        .attr("height", this.height())
        .attr("class", "column-chart");
      this.svg = svg;

      const yAxisGroup = this.appendOnce("g", "y-axis").attr(
        "transform",
        `translate(${left}, 0)`
      );

      this.x = this.xScale() ?? this.defaultXScale(data);
      this.x.range([left, this.getResponsiveWidth() - right]);

      const shiftXAxis = (g) => {
        const text = g.selectAll(".tick text");
        const shift = wrap(text, this.wrappx());
        bottom = shift + 5;
      };

      const xAxisGroup = this.appendOnce("g", "x-axis")
        .call(this.xAxis().bind(this)(this.x))
        .call(shiftXAxis)
        .attr("transform", `translate(0, ${this.height() - bottom})`);

      this.y
        .set(node, this.yScale() ?? this.defaultYScale(data))
        .range([this.height() - bottom, top]);

      const bars = svg
        .selectAll(".bar")
        .data(data, (d) => d[0])
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

        this.x.range([left, w - right]);
        xAxisGroup.call(this.xAxis().bind(this)(this.x)).call(shiftXAxis);
        yAxisGroup.call(this.yAxis().bind(this)(this.y.get(node)));

        bars.attr("x", (d) => this.x(d[0])).attr("width", this.x.bandwidth());
        labels.attr("x", (d) => this.x(d[0]) + this.x.bandwidth() / 2);
      };

      render();
      select(window).on(`resize.${i}`, render);
    });
  }
}
