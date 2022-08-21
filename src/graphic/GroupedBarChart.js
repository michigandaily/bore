import { local, scaleLinear, scaleBand, select, max } from "d3";
import Visual from "./Visual";
import wrap from "../util/wrap";
import { xAxisTop, yAxisLeft } from "../util/axis";
import "../css/grouped-bar-chart.scss";

export default class GroupedBarChart extends Visual {
  constructor() {
    super();
    this.height(200);
    this.margin({ top: 20, right: 20, bottom: 20, left: 20 });
    this.color("steelblue");
    this.label((d) => d[1]);
    this.resize(true);
    this.redraw(false);
    this.wrappx(50);
    this.xAxis(xAxisTop);
    this.yAxis(yAxisLeft);

    this.x = local();
    this.y0 = null;
    this.y1 = null;
  }

  bar(rect) {
    return rect
      .attr("class", "bar")
      .attr("y", (d) => this.y1(d[0]))
      .attr("height", this.y1.bandwidth())
      .attr("fill", this.color());
  }

  barLabel(text) {
    return text
      .attr("class", "label")
      .attr("dx", "0.25em")
      .attr("y", (d) => this.y1(d[0]) + this.y1.bandwidth() / 2)
      .text(this.label());
  }

  defaultXScale(data) {
    return scaleLinear()
      .domain([0, max(data, (d) => max(Object.entries(d[1]), (v) => +v[1]))])
      .nice();
  }

  draw(selections) {
    selections.each((data, i, selection) => {
      const { top, right, bottom } = this.margin();
      let { left } = this.margin();

      const node = selection[i];
      const keys = Object.keys(data.values().next().value);

      this.width(this.width() ?? node.parentNode.clientWidth);

      this.x.set(node, this.xScale() ?? this.defaultXScale(data));

      this.y0 = scaleBand()
        .domain(data.keys())
        .range([top, this.height() - bottom])
        .padding(0.3);

      this.y1 = scaleBand().domain(keys).range([0, this.y0.bandwidth()]);

      const svg = select(node)
        .attr("height", this.height())
        .attr("class", "grouped-bar-chart");
      this.svg = svg;

      this.appendOnce("g", "y-axis")
        .call(this.yAxis().bind(this)(this.y0))
        .call((g) => {
          const text = g.selectAll(".tick text");
          left += wrap(text, this.wrappx());
        })
        .attr("transform", `translate(${left}, 0)`);

      const xAxisGroup = this.appendOnce("g", "x-axis").attr(
        "transform",
        `translate(0, ${top})`
      );

      const groups = svg
        .selectAll(".bar-group")
        .data(data)
        .join("g")
        .attr("class", "bar-group")
        .attr("transform", (d) => `translate(0, ${this.y0(d[0])})`);

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

        const lx = this.x.get(node).range([left, w - right]);
        xAxisGroup.call(this.xAxis().bind(this)(lx));

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
