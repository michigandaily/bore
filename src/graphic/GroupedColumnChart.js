import { local, max, scaleLinear, select, scaleBand, axisLeft } from "d3";
import Visual from "./Visual";
import { xAxisBottom } from "../util/axis";
import "../css/grouped-column-chart.scss";
export default class GroupedColumnChart extends Visual {
  constructor() {
    super();
    this.height(400);
    this.margin({ top: 20, right: 20, bottom: 40, left: 30 });
    this.color(() => "steelblue");
    this.label((d) => d[1]);
    this.resize(true);
    this.redraw(false);
    this.wrappx(50);
    this.xAxis(xAxisBottom);
    this.yAxis((scale, redraw) => (g) => {
      const selection = redraw ? g.transition().duration(1000) : g;
      selection.call(axisLeft(scale));
    });

    this.y = local();
    this.x0 = null;
    this.x1 = null;
  }

  bar(rect) {
    const scale = this.y.get(this.svg.node());
    const min = scale.domain()[0];
    const selection = this.redraw() ? rect.transition().duration(1000) : rect;
    return selection
      .attr("y", (d) => scale(d[1]))
      .attr("height", (d) => scale(min) - scale(d[1]))
      .attr("fill", this.color());
  }

  barLabel(text) {
    const scale = this.y.get(this.svg.node());
    const selection = this.redraw() ? text.transition().duration(1000) : text;
    return selection
      .attr("y", (d) => scale(d[1]))
      .attr("class", "label")
      .attr("dy", "-0.25em")
      .attr("y", (d) => scale(d[1]))
      .attr("text-anchor", "middle")
      .attr("font-family", "sans-serif")
      .attr("font-weight", 600)
      .attr("font-size", 10)
      .text(this.label());
  }

  defaultYScale(data) {
    return scaleLinear()
      .domain([0, max(data, (d) => max(Object.entries(d[1]), (v) => +v[1]))])
      .nice();
  }

  draw(selections) {
    selections.each((data, i, selection) => {
      const { top, right, bottom, left } = this.margin();
      const node = selection[i];
      const keys = Object.keys(data.values().next().value);

      this.width(this.width() ?? node.parentNode.clientWidth);

      this.x0 = scaleBand().domain(data.keys()).padding(0.3);
      this.x1 = scaleBand().domain(keys);

      this.y
        .set(node, this.yScale() ?? this.defaultYScale(data))
        .range([this.height() - bottom, top]);

      const svg = select(node)
        .attr("height", this.height())
        .attr("class", "grouped-column-chart");
      this.svg = svg;

      this.appendOnce("g", "y-axis")
        .call(this.yAxis()(this.y.get(node), this.redraw()))
        .attr("transform", `translate(${left}, 0)`);

      const xAxisGroup = this.appendOnce("g", "x-axis").attr(
        "transform",
        `translate(0, ${this.height() - bottom})`
      );

      const groups = svg
        .selectAll(".bargroup")
        .data(data)
        .join("g")
        .attr("class", "bargroup");

      const bars = groups
        .selectAll("rect")
        .data((d) => Object.entries(d[1]))
        .join("rect")
        .call(this.bar.bind(this));

      const labels = groups
        .selectAll("text")
        .data((d) => Object.entries(d[1]))
        .join("text")
        .call(this.barLabel.bind(this));

      const render = () => {
        const cw = node.parentNode.clientWidth;
        const w = this.resize() ? cw : cw < this.width() ? cw : this.width();

        svg.attr("width", w);

        this.x0.range([left, w - right]);
        this.x1.range([0, this.x0.bandwidth()]);

        xAxisGroup.call(this.xAxis()(w, this.x0, this.redraw()));

        groups.attr("transform", (d) => `translate(${this.x0(d[0])}, 0)`);
        bars.attr("x", (d) => this.x1(d[0])).attr("width", this.x1.bandwidth());
        labels.attr("x", (d) => this.x1(d[0]) + this.x1.bandwidth() / 2);
      };

      render();
      select(window).on(`resize.${i}`, render);
    });
  }
}
