import {
  local,
  extent,
  scaleLinear,
  scaleTime,
  curveLinear,
  select,
  max,
  stack,
  sum,
  area,
  axisLeft,
} from "d3";
import Visual from "./Visual";
import { xAxisBottom } from "../util/axis";
export default class AreaChart extends Visual {
  #curve;

  constructor() {
    super();
    this.height(200);
    this.margin({ left: 30, top: 20, right: 20, bottom: 20 });
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
    return scaleTime().domain(extent(data.keys()));
  }

  defaultYScale(data) {
    const maximum = this.multiple
      ? max(Array.from(data.values()).map((d) => sum(d.values())))
      : max(data.values());
    return scaleLinear().domain([0, maximum]).nice();
  }

  draw(selections) {
    selections.each((data, i, selection) => {
      this.multiple = data.values().next().value instanceof Map;
      if (this.multiple) {
        this.keys = data.values().next().value.keys();
      }
      const { left, top, right, bottom } = this.margin();
      const node = selection[i];

      this.x = this.xScale() ?? this.defaultXScale(data);
      this.y
        .set(node, this.yScale() ?? this.defaultYScale(data))
        .range([this.height() - bottom, top]);

      const svg = select(node)
        .attr("height", this.height())
        .attr("class", "area-chart");
      this.svg = svg;

      const yAxisGroup = this.appendOnce("g", "y-axis");
      yAxisGroup
        .attr("transform", `translate(${left}, 0)`)
        .call(this.yAxis().bind(this)(this.y.get(node)));

      const xAxisGroup = this.appendOnce("g", "x-axis");
      xAxisGroup.attr("transform", `translate(0, ${this.height() - bottom})`);

      if (this.multiple) {
        this.series = stack()
          .keys(this.keys)
          .value((d, key) => d.get(key))(data.values());
      }

      const scale = this.y.get(node);
      const min = scale.domain()[0];
      const areaGenerator = area()
        .y1((d) => scale(d[1]))
        .y0((d) => scale(this.multiple ? d[0] : min))
        .curve(this.curve());

      let path;
      if (this.multiple) {
        path = svg
          .selectAll(".area-path")
          .data(this.series)
          .join("path")
          .attr("class", "area-path");
      } else {
        path = this.appendOnce("path", "area-path").datum(data);
      }

      const render = () => {
        const w = this.getResponsiveWidth();
        svg.attr("width", w);

        this.x.range([left, w - right]);
        areaGenerator.x((d, i) =>
          this.x(this.multiple ? Array.from(data.keys())[i] : d[0])
        );
        xAxisGroup.call(this.xAxis().bind(this)(this.x));

        this.getSelectionWithRedrawContext(path)
          .attr("d", areaGenerator)
          .attr("fill", this.color());
      };

      render();
      select(window).on(`resize.${i}`, render);
    });
  }
}
