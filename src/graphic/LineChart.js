import {
  local,
  select,
  scaleLinear,
  scaleTime,
  max,
  extent,
  line,
  curveLinear,
  axisLeft,
} from "d3";
import Visual from "./Visual";
import { xAxisBottom } from "../util/axis";

export default class LineChart extends Visual {
  #curve;

  constructor() {
    super();
    this.height(150);
    this.margin({ top: 20, right: 20, bottom: 20, left: 30 });
    this.color("steelblue");
    // this.label();
    this.resize(true);
    this.redraw(false);
    // this.wrappx();
    this.xAxis(xAxisBottom);
    this.yAxis(function (scale) {
      return (g) => {
        const selection = this.getSelectionWithRedrawContext(g);
        selection.call(axisLeft(scale));
      };
    });
    this.curve(curveLinear);

    this.x = null;
    this.y = local();
  }

  curve(c) {
    return arguments.length ? ((this.#curve = c), this) : this.#curve;
  }

  defaultXScale(data) {
    const domain = Array.isArray(data)
      ? extent(data.map((d) => extent(d.keys())).flat())
      : extent(data.keys());
    return scaleTime().domain(domain);
  }

  defaultYScale(data) {
    const maximum = Array.isArray(data)
      ? max(data.map((d) => max(d.values())))
      : max(data.values());
    return scaleLinear().domain([0, maximum]);
  }

  draw(selections) {
    selections.each((data, i, selection) => {
      const { top, right, bottom, left } = this.margin();

      const node = selection[i];

      this.x = this.xScale() ?? this.defaultXScale(data);
      this.y
        .set(node, this.yScale() ?? this.defaultYScale(data))
        .range([this.height() - bottom, top]);

      const svg = select(node)
        .attr("height", this.height())
        .attr("class", "line-chart");
      this.svg = svg;

      const yAxisGroup = this.appendOnce("g", "y-axis");
      yAxisGroup
        .attr("transform", `translate(${left}, 0)`)
        .call(this.yAxis().bind(this)(this.y.get(node)));

      const xAxisGroup = this.appendOnce("g", "x-axis");
      xAxisGroup.attr("transform", `translate(0, ${this.height() - bottom})`);

      let path;
      if (Array.isArray(data)) {
        path = svg
          .selectAll(".line-path")
          .data(data)
          .join("path")
          .attr("class", "line-path");
      } else {
        path = this.appendOnce("path", "line-path").datum(data);
      }

      const lineGenerator = line()
        .y((v) => this.y.get(node)(v[1]))
        .curve(this.curve());

      const render = () => {
        const w = this.getResponsiveWidth();

        svg.attr("width", w);

        const lx = this.x.range([left, w - right]);
        lineGenerator.x((v) => lx(v[0]));
        xAxisGroup.call(this.xAxis().bind(this)(lx));

        this.getSelectionWithRedrawContext(path)
          .attr("d", lineGenerator)
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
