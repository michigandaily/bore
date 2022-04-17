import { local, select, scaleLinear, scaleBand, max } from "d3";
import Visual from "./Visual";
import wrap from "../util/wrap";
import { xAxisTop, yAxisLeft } from "../util/axis";

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

  xSplit(width, scale) {
    return (g) => {
      g.selectAll("line")
        .data(scale.ticks(width / 80))
        .join(
          enter => enter.append("line")
            .attr("x1", scale).attr("x2", scale),
          update => ((this.redraw()) ? update.transition().duration(1000) : update)
            .attr("x1", scale).attr("x2", scale)
        )
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .attr("y2", this.height() - this.margin().bottom - this.margin().top)
    }
  }

  bar(rect) {
    return rect
      .attr("class", "bar")
      .attr("y", d => this.y(d[0]))
      .attr("height", this.y.bandwidth())
      .attr("fill", this.color());
  }

  barLabel(text) {
    return text
      .attr("class", "label")
      .attr("dx", "0.25em")
      .attr("y", d => this.y(d[0]) + this.y.bandwidth() / 2)
      .attr("alignment-baseline", "central")
      .attr("font-family", "sans-serif")
      .attr("font-weight", 600)
      .attr("font-size", 10)
      .text(this.label());
  }

  draw(selection) {
    selection.each((d, i, s) => {
      const { top, right, bottom } = this.margin();
      let { left } = this.margin();

      let svg = s[i];

      if (!this.width()) {
        this.width(svg.parentNode.clientWidth);
      }

      this.x.set(svg, ((!this.xScale())
        ? scaleLinear().domain([0, max(d.values())]).nice()
        : this.xScale())
        .range([left, this.width() - right])
      );

      this.y = ((!this.yScale())
        ? scaleBand().domain(d.keys()).padding(0.3)
        : this.yScale())
        .range([this.height() - bottom, top]);

      svg = select(svg)
        .attr("height", this.height());

      ((this.redraw()) ? svg.select(".y-axis") : svg.append("g"))
        .call(this.yAxis()(this.y))
        .call(g => {
          const text = g.selectAll(".tick text");
          left += wrap(text, this.wrappx());
        })
        .attr("class", "y-axis")
        .attr("transform", `translate(${left}, 0)`);

      const bars = svg.selectAll(".bar")
        .data(d)
        .join("rect")
        .call(this.bar.bind(this));

      const xAxisGroup = ((this.redraw()) ? svg.select(".x-axis") : svg.append("g"))
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${top})`);

      const xSplitGroup = ((this.redraw()) ? svg.select(".x-split") : svg.append("g"))
        .attr("class", "x-split")
        .attr("transform", `translate(0, ${top})`);

      const labels = svg.selectAll(".label")
        .data(d)
        .join("text")
        .call(this.barLabel.bind(this));

      const render = () => {
        const cw = svg.node().parentNode.clientWidth;
        // eslint-disable-next-line no-nested-ternary
        const w = (this.resize()) ? cw : (cw < this.width()) ? cw : this.width();

        svg.attr("width", w);

        const lx = this.x.get(svg.node())
          .range([left, w - right]);

        xAxisGroup.call(this.xAxis()(w, lx, this.redraw()));
        xSplitGroup.call(this.xSplit(w, lx));

        const min = lx.domain()[0];

        ((this.redraw()) ? bars.transition().duration(1000) : bars)
          .attr("x", lx(min))
          .attr("width", datum => lx(datum[1]) - lx(min));

        ((this.redraw()) ? labels.transition().duration(1000) : labels)
          .attr("x", datum => lx(datum[1]));
      }

      render();
      select(window).on(`resize.${i}`, render);
    });

    return this;
  }
}
