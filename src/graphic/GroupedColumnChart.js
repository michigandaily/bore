import { local, max, scaleLinear, select, scaleBand } from "d3";
import Visual from "./Visual";
import { xAxisBottom, yAxisLeft } from "../util/axis";
import "../css/grouped-column-chart.scss";
import wrap from "../util/wrapBottom";

export default class GroupedColumnChart extends Visual {
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

    this.y = local();
    this.x0 = null;
    this.x1 = null;
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

  defaultYScale(data) {
    return scaleLinear()
      .domain([0, max(data, (d) => max(Object.entries(d[1]), (v) => +v[1]))])
      .nice();
  }

  draw(selections) {
    selections.each((data, i, selection) => {
      const { top, right, left } = this.margin();
      let { bottom } = this.margin();

      const node = selection[i];
      const keys = Object.keys(data.values().next().value);

      const svg = select(node)
        .attr("height", this.height())
        .attr("class", "grouped-column-chart");
      this.svg = svg;

      const yAxisGroup = this.appendOnce("g", "y-axis").attr(
        "transform",
        `translate(${left}, 0)`
      );

      this.x0 = scaleBand().domain(data.keys()).padding(0.3);
      this.x1 = scaleBand().domain(keys);

      const shiftXAxis = (g) => {
        const text = g.selectAll(".tick text");
        const shift = wrap(text, this.wrappx());
        bottom = shift + 5;
      };

      const xAxisGroup = this.appendOnce("g", "x-axis")
        .call(this.xAxis().bind(this)(this.x0))
        .call(shiftXAxis)
        .attr("transform", `translate(0, ${this.height() - bottom})`);

      this.y
        .set(node, this.yScale() ?? this.defaultYScale(data))
        .range([this.height() - bottom, top]);

      const groups = svg
        .selectAll(".bar-group")
        .data(data)
        .join("g")
        .attr("class", "bar-group");

      const bars = groups
        .selectAll(".bar")
        .data((d) => Object.entries(d[1]))
        .join("rect")
        .call(this.bar.bind(this));

      const labels = groups
        .selectAll(".label")
        .data((d) => Object.entries(d[1]))
        .join("text")
        .call(this.barLabel.bind(this));

      const render = () => {
        const w = this.getResponsiveWidth();
        svg.attr("width", w);

        this.x0.range([left, w - right]);
        this.x1.range([0, this.x0.bandwidth()]);

        xAxisGroup.call(this.xAxis().bind(this)(this.x0)).call(shiftXAxis);
        yAxisGroup.call(this.yAxis().bind(this)(this.y.get(node)));

        groups.attr("transform", (d) => `translate(${this.x0(d[0])}, 0)`);
        bars.attr("x", (d) => this.x1(d[0])).attr("width", this.x1.bandwidth());
        labels.attr("x", (d) => this.x1(d[0]) + this.x1.bandwidth() / 2);
      };

      render();
      select(window).on(`resize.${i}`, render);
    });
  }
}
