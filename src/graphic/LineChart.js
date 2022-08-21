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
import "../css/line-chart.scss";

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
    const domain = this.multiple
      ? extent(
          Array.from(data.values())
            .map((d) => extent(d.keys()))
            .flat()
        )
      : extent(data.keys());
    return scaleTime().domain(domain);
  }

  defaultYScale(data) {
    const maximum = this.multiple
      ? max(Array.from(data.values()).map((d) => max(d.values())))
      : max(data.values());
    return scaleLinear().domain([0, maximum]).nice();
  }

  draw(selections) {
    selections.each((data, i, selection) => {
      this.multiple = data.values().next().value instanceof Map;
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
      if (this.multiple) {
        path = svg
          .selectAll(".line-path")
          .data(data)
          .join("path")
          .attr(
            "class",
            (d) => `line-path ${this.multiple ? d[0].toLowerCase() : ""}`
          );
      } else {
        path = this.appendOnce("path", "line-path").datum(data);
      }

      const lineFunc = line()
        .y((v) => this.y.get(node)(v[1]))
        .curve(this.curve());

      const render = () => {
        const w = this.getResponsiveWidth();

        svg.attr("width", w);

        const lx = this.x.range([left, w - right]);
        lineFunc.x((v) => lx(v[0]));
        xAxisGroup.call(this.xAxis().bind(this)(lx));

        this.getSelectionWithRedrawContext(path)
          .attr("d", (d) => lineFunc(this.multiple ? d[1] : d))
          .attr("stroke", this.color());
      };

      render();
      select(window).on(`resize.${i}`, render);
    });

    return this;
  }
}
