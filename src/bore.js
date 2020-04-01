const bore = function () {
  let CREDIT_HEIGHT = 14;
  let ORG_NAME = "Michigan Daily";
  // Base Visualization class
  class Visualization {
    constructor(el, width, height, margins, data) {
      this.el = document.querySelector(el);
      this.width = width;
      this.height = height;
      this.margins = margins;
      this.data = data;

      [this.g, this.svg, this.trueWidth, this.trueHeight] = this.initVis(
        this.el,
        width,
        height,
        margins
      );
      this.draw = this.draw.bind(this);
    }

    initVis(el, width, height, margins) {
      // Calculate total size of figure
      const trueWidth = width + margins.left + margins.right;
      const trueHeight = height + margins.top + margins.bottom + CREDIT_HEIGHT;
      // Add SVG element
      const svg = d3
        .select(el)
        .append("svg")
        .attr("viewBox", `0 0 ${trueWidth} ${trueHeight}`)
        .attr("width", trueWidth);
      // .attr("height", trueHeight);
      // Add g element (this is like our "canvas")
      const g = svg
        .append("g")
        .attr("transform", `translate(${margins.left}, ${margins.top})`);
      return [g, svg, trueWidth, trueHeight];
    }

    draw() {
      this.svg
        .append("text")
        .text(`${this.author} / ${ORG_NAME}`)
        .attr(
          "transform",
          `translate(${this.trueWidth - this.margins.right - 4}, ${
            this.trueHeight - 4
          })`
        )
        .attr("text-anchor", "end")
        .attr("alignment-baseline", "baseline")
        .attr("class", "credit-text");
    }
  }

  const titleMixin = (Base) =>
    class extends Base {
      draw() {
        // TODO: handle line wrapping
        // draw title
        super.draw();
        const title = this.svg
          .append("text")
          .text(this.title)
          .attr("class", "title-text")
          .attr("transform", "translate(10, 10)")
          .attr("alignment-baseline", "hanging");
        if (this.subtitle) {
          this.svg
            .append("text")
            .text(this.subtitle)
            .attr("class", "subtitle-text")
            .attr(
              "transform",
              `translate(10, ${title.node().getBBox().height + 20})`
            );
        }
      }
    };

  class LinePlot extends titleMixin(Visualization) {
    // TODO: replace this with by inheriting from MultiLinePlot OR remove it
    // entirely
    // Generates a simple interactive line plot
    // Requires:
    // - data is a sorted list of objects: [{x: *, y: *}...]
    // - set this.title
    // - set this.author
    // Optional:
    // - set this.stroke

    constructor(el, width, height, margins, data) {
      super(el, width, height, margins, data);

      // TODO: move this into an `options` parameter
      this.stroke = "black";
      this.pointerStroke = this.stroke;

      // TODO: implement log scale
      // Better yet, implement arbitrary scale picking
      // Also move axes and scales into mixin
      this.xscale = d3
        .scaleLinear()
        .domain(d3.extent(this.data.map((d) => d.x)))
        .range([0, this.width]);
      this.xaxis = d3.axisBottom(this.xscale);
      this.yscale = d3
        .scaleLinear()
        .domain(d3.extent(this.data.map((d) => d.y)))
        .range([this.height, 0]);
      this.yaxis = d3.axisLeft(this.yscale);

      this.mouseMove = this.mouseMove.bind(this);
    }

    getData() {
      return this.data;
    }

    hoverFormat(d) {
      return d.y;
    }

    // TODO: move mouse interaction into mixin
    mouseMove() {
      const bisect = d3.bisector(function (d) {
        return d.x;
      }).right;
      const data = this.getData();
      const x0 = this.xscale.invert(d3.mouse(d3.event.currentTarget)[0]);
      const i1 = bisect(data, x0, 0);
      const i0 = i1 - 1;
      const dist = [x0 - data[i0].x, data[i1].x - x0];
      const d = data[i0 + d3.minIndex(dist)];
      const circ = this.g.selectAll("circle").data([d]);
      circ
        .enter()
        .append("circle")
        .merge(circ)
        .attr("r", "2.5")
        .attr("stroke", this.pointerStroke)
        .attr("fill", "none")
        .attr("cx", (d) => this.xscale(d.x))
        .attr("cy", (d) => this.yscale(d.y));
      circ.exit().remove();
      const label = this.g.selectAll("text").filter(".hover-label").data([d]);
      label
        .enter()
        .append("text")
        .attr("class", "hover-label")
        .merge(label)
        .attr("x", (d) => this.xscale(d.x) + 5)
        .attr("y", (d) => this.yscale(d.y) + 5)
        .attr("alignment-baseline", "hanging")
        .text((d) => this.hoverFormat(d));
    }

    draw() {
      const data = this.getData();
      this.xscale.domain(d3.extent(data.map((d) => d.x)));
      this.yscale.domain(d3.extent(data.map((d) => d.y)));

      const line = d3.line()(
        data.map((d) => [this.xscale(d.x), this.yscale(d.y)])
      );
      this.g
        .append("path")
        .attr("d", line)
        .attr("stroke", this.stroke)
        .attr("fill", "none");
      this.g
        .append("rect")
        .attr("fill", "none")
        .attr("width", this.width)
        .attr("height", this.height)
        .style("pointer-events", "all")
        .on("mousemove", this.mouseMove);
      this.g.append("g").call(this.yaxis).attr("transform", "translate(-5, 0)");
      this.g
        .append("g")
        .call(this.xaxis)
        .attr("transform", `translate(0, ${this.height + 5})`);
      super.draw();
    }
  }

  class MultiLinePlot extends titleMixin(Visualization) {
    // Generates a simple interactive multiline plot
    // Requires:
    // - data OR data.map(d => getData(d)) is a list of
    //   sorted lists of objects: [{x: *, y: *}...]
    // - set this.title
    // - set this.author
    // Optional:
    // - set this.stroke
    // - set this.pointerStroke

    constructor(el, width, height, margins, data) {
      super(el, width, height, margins, data);

      this.stroke = "black";
      this.pointerStroke = this.stroke;
      this.colors = d3.schemeCategory10;

      // TODO: implement log scale
      // Better yet, implement arbitrary scale picking
      // Also move axes and scales into mixin
      this.xscale = d3.scaleLinear().range([0, this.width]);
      this.xaxis = d3.axisBottom(this.xscale);
      this.yscale = d3.scaleLinear().range([this.height, 0]);
      this.yaxis = d3.axisLeft(this.yscale);

      this.mouseMove = this.mouseMove.bind(this);
    }

    getData(data) {
      return data;
    }

    hoverFormat(d) {
      return d.y;
    }

    // TODO: move mouse interaction into mixin
    mouseMove() {
      const bisect = d3.bisector(function (d) {
        return d.x;
      }).right;
      const x0 = this.xscale.invert(d3.mouse(d3.event.currentTarget)[0]);
      const highlight = [];
      for (const [i, line_data] of this.data.entries()) {
        const data = this.getData(line_data);
        const i1 =
          bisect(data, x0, 0) >= data.length
            ? data.length - 1
            : bisect(data, x0, 0);
        const i0 = i1 - 1 < 0 ? 0 : i1 - 1;
        const dist = [x0 - data[i0].x, data[i1].x - x0];
        const d = data[i0 + d3.minIndex(dist)];
        d.ind = i;
        highlight.push(d);
      }
      const circ = this.g.selectAll("circle").data(highlight);
      circ
        .enter()
        .append("circle")
        .merge(circ)
        .attr("r", "2.5")
        .attr("stroke", this.pointerStroke)
        .attr("fill", "none")
        .attr("cx", (d) => this.xscale(d.x))
        .attr("cy", (d) => this.yscale(d.y));
      circ.exit().remove();
      const label = this.g
        .selectAll("text")
        .filter(".hover-label")
        .data(highlight);
      label
        .enter()
        .append("text")
        .attr("class", "hover-label")
        .merge(label)
        .attr("x", (d) => this.xscale(d.x) + 5)
        .attr("y", (d) => this.yscale(d.y) + 5)
        .attr("alignment-baseline", "hanging")
        .text((d) => this.hoverFormat(d));
    }

    draw() {
      const flat = this.data.map((d) => this.getData(d)).flat();
      const line = d3.line();
      for (const [i, lineData] of this.data.entries()) {
        const data = this.getData(lineData);
        // use correct scale if array of scales
        let xscale, yscale;
        if (this.xscale[i]) {
          xscale = this.xscale[i].domain(d3.extent(data.map((d) => d.x)));
        } else {
          xscale = this.xscale.domain(d3.extent(flat.map((d) => d.x)));
        }
        if (this.yscale[i]) {
          yscale = this.yscale[i].domain(d3.extent(data.map((d) => d.y)));
        } else {
          yscale = this.yscale.domain(d3.extent(flat.map((d) => d.y)));
        }
        if (this.yaxis[i]) {
          this.yaxis[i].scale(yscale);
        } else {
          this.yaxis.scale(yscale);
        }
        if (this.xaxis[i]) {
          this.xaxis[i].scale(xscale);
        } else {
          this.xaxis.scale(xscale);
        }
        this.g
          .append("path")
          .attr("d", line(data.map((d) => [xscale(d.x), yscale(d.y)])))
          .attr("stroke", this.colors[i % this.colors.length])
          .attr("fill", "none");
      }

      this.g
        .append("rect")
        .attr("fill", "none")
        .attr("width", this.width)
        .attr("height", this.height)
        .style("pointer-events", "all")
        .on("mousemove", this.mouseMove);
      if (this.yaxis[0]) {
        // Handle left and right axes
        // FIXME: This assumes left is first, right is second.
        this.g
          .append("g")
          .call(this.yaxis[0])
          .attr("transform", "translate(-5, 0)");
        this.g
          .append("g")
          .call(this.yaxis[1])
          .attr("transform", `translate(${this.width + 5}, 0)`);
      } else {
        this.g
          .append("g")
          .call(this.yaxis)
          .attr("transform", "translate(-5, 0)");
      }
      this.g
        .append("g")
        .call(this.xaxis)
        .attr("transform", `translate(0, ${this.height + 5})`);
      super.draw();
    }
  }

  class CumulativeCount extends LinePlot {
    // Generates cumulative sum plot
    // Requires:
    // - data is a sorted list of objects: [{x: *, y: *}...]
    //   y-values are not yet accumulated -- this plot handles that part.
    // - set this.title
    // - set this.author

    constructor(el, width, height, margins, data) {
      super(el, width, height, margins, data);
    }

    getData() {
      const cumsums = d3.cumsum(this.data.map((d) => d.y));
      return this.data.map((d, i) => ({ x: d.x, y: cumsums[i] }));
    }

    draw() {
      super.draw();
    }
  }

  return {
    Visualization,
    titleMixin,
    LinePlot,
    MultiLinePlot,
    CumulativeCount
  }
}();
