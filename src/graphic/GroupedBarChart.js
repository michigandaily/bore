import { local, scaleLinear, scaleBand, select, max } from "d3";
import Visual from "./Visual";
import wrap from "../util/wrap";
import { xAxisTop, yAxisLeft } from "../util/axis";

export default class GroupedBarChart extends Visual {
  constructor() {
    super();
    this.height(200);
    this.margin({ top: 20, right: 40, bottom: 20, left: 20 });
    this.color(() => "steelblue");
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

  barLabel(text) {
    return text
      .attr("class", "label")
      .attr("dx", "0.25em")
      .attr("y", d => this.y1(d[0]) + this.y1.bandwidth() / 2)
      .attr("alignment-baseline", "central")
      .attr("font-family", "sans-serif")
      .attr("font-weight", 600)
      .attr("font-size", 10)
      .text(this.label());
  }

  draw(selection) {
    selection.each((data, i, s) => {
      const { top, right, bottom } = this.margin();
      let { left } = this.margin();

      let svg = s[i];
      const keys = Object.keys(data.values().next().value);

      if (!this.width()) {
        this.width(svg.parentNode.clientWidth);
      }

      this.x.set(svg, ((!this.xScale())
        ? scaleLinear().domain(
          [0, max(data, d => max(Object.entries(d[1]), v => +v[1]))]
        ).nice()
        : this.xScale())
        .range([left, this.width - right])
      );

      this.y0 = scaleBand()
        .domain(data.keys())
        .range([this.height() - bottom, top])
        .padding(0.3);

      this.y1 = scaleBand()
        .domain(keys)
        .range([0, this.y0.bandwidth()]);

      svg = select(svg)
        .attr("height", this.height());

      ((this.redraw()) ? svg.select(".y-axis") : svg.append("g"))
        .call(this.yAxis()(this.y0))
        .call(g => {
          const text = g.selectAll(".tick text");
          left += wrap(text, this.wrappx());
        })
        .attr("class", "y-axis")
        .attr("transform", `translate(${left}, 0)`);

      const xAxisGroup = ((this.redraw()) ? svg.select(".x-axis") : svg.append("g"))
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${top})`);

      const groups = svg.selectAll(".bargroup")
        .data(data)
        .join("g")
        .attr("class", "bargroup")
        .attr("transform", d => `translate(0, ${this.y0(d[0])})`)

      const bars = groups
        .selectAll("rect")
        .data(d => Object.entries(d[1]))
        .join("rect")
        .attr("y", d => this.y1(d[0]))
        .attr("height", this.y1.bandwidth())
        .attr("fill", this.color());

      const labels = groups
        .selectAll("text")
        .data(d => Object.entries(d[1]))
        .join("text")
        .attr("y", d => this.y1(d[0]))
        .call(this.barLabel.bind(this));

      const render = () => {
        const cw = svg.node().parentNode.clientWidth;
        // eslint-disable-next-line no-nested-ternary
        const w = (this.resize()) ? cw : (cw < this.width()) ? cw : this.width();

        svg.attr("width", w);

        const lx = this.x.get(svg.node())
          .range([left, w - right]);

        xAxisGroup.call(this.xAxis()(w, lx, this.redraw()));
        const min = lx.domain()[0];

        ((this.redraw()) ? bars.transition().duration(1000) : bars)
          .attr("x", lx(min))
          .attr("width", d => lx(d[1]) - lx(min));

        ((this.redraw()) ? labels.transition().duration(1000) : labels)
          .attr("x", d => lx(d[1]));
      };

      render();
      select(window).on(`resize.${i}`, render);
    })

    return this;
  }
}