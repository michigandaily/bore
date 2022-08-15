import {
  local,
  select,
  scaleLinear,
  scaleTime,
  max,
  extent,
  line,
  curveLinear,
} from "d3";
import Visual from "./Visual";
import { yAxisLeft } from "../util/axis";

export default class LineChart extends Visual {
  #curve;

  constructor() {
    super();
    this.height(150);
    this.margin({ top: 20, right: 40, bottom: 20, left: 40 });
    this.color(() => "steelblue");
    this.resize(true);
    this.redraw(false);
    this.wrappx(20);
    this.xAxis(null);
    this.yAxis(yAxisLeft);
    this.curve(curveLinear);

    this.x = null;
    this.y = local();
  }

  curve(c) {
    return arguments.length ? ((this.#curve = c), this) : this.#curve;
  }

  defaultXScale(data) {
    return scaleTime().domain(extent(data.keys(), (v) => v));
  }

  defaultYScale(data) {
    return scaleLinear().domain([0, max(data.values(), (v) => v)]);
  }

  appendOnce(svg, element, classSelector) {
    return this.redraw()
      ? svg.select(`.${classSelector}`)
      : svg.append(element).attr("class", classSelector);
  }

  draw(selections) {
    selections.each((data, i, selection) => {
      const { top, right, bottom, left } = this.margin();

      const node = selection[i];

      this.width(this.width() ?? node.parentNode.clientWidth);

      this.x = this.xScale() ?? this.defaultXScale(data);
      this.x.range([left, this.width() - right]);

      this.y
        .set(node, this.yScale() ?? this.defaultYScale(data))
        .range([this.height() - bottom, top]);

      const svg = select(node).attr("height", this.height());

      const path = this.appendOnce(svg, "path", "line-path");
      path.datum(data);

      const yAxisGroup = this.appendOnce(svg, "g", "y-axis");
      yAxisGroup
        .attr("transform", `translate(${left}, 0)`)
        .call(this.yAxis()(this.y.get(node), this.redraw()));

      const xAxisGroup = this.appendOnce(svg, "g", "x-axis");
      xAxisGroup.attr("transform", `translate(0, ${this.height() - bottom})`);

      const lineFunc = line()
        .y((v) => this.y.get(node)(v[1]))
        .curve(this.curve());

      const render = () => {
        const cw = node.parentNode.clientWidth;
        // eslint-disable-next-line no-nested-ternary
        const w = this.resize() ? cw : cw < this.width() ? cw : this.width();

        svg.attr("width", w);

        const lx = this.x.range([left, w - right]);

        lineFunc.x((v) => lx(v[0]));
        xAxisGroup.call(this.xAxis()(w, lx, this.redraw()));

        const p = this.redraw() ? path.transition().duration(1000) : path;
        p.attr("d", lineFunc)
          .attr("fill", "none")
          .attr("stroke", this.color())
          .attr("stroke-width", 5);
      };

      render();
      select(window).on(`resize.${i}`, render);
    });

    return this;
  }
}
