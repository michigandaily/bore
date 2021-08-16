import * as d3 from "d3";

export function barChart() {
  let width, height = 150;
  let x = d3.local(), y, xScale, yScale;
  let margin = { top: 20, right: 40, bottom: 20, left: 40 };
  let color = () => "steelblue", label = d => d[1];
  let resize = true;

  const xAxis = scale => g => {
    g.call(d3.axisTop(scale));
    g.select(".domain").remove();
  }

  const yAxis = scale => g => {
    g.call(d3.axisLeft(scale).tickSize(0));
    g.select(".domain").remove();
    g.selectAll(".tick text")
      .attr("font-weight", "bold");
    // .call(wrap, 150);
  }

  const xSplit = scale => g => {
    g.selectAll("line")
      .data(scale.ticks())
      .join("line")
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .attr("x1", scale).attr("x2", scale)
      .attr("y2", height - margin.bottom - margin.top);
  }

  const bar = g => g.append("rect")
    .attr("y", d => y(d[0]))
    .attr("height", y.bandwidth())
    .attr("fill", d => color(d[0]));

  const barLabel = g => g.append("text")
    .attr("dx", "0.25em")
    .attr("y", d => y(d[0]) + y.bandwidth() / 2)
    .attr("alignment-baseline", "central")
    .attr("font-family", "sans-serif")
    .attr("font-weight", 600)
    .attr("font-size", 10)
    .text(label);

  const init = svg => {
    const data = d3.select(svg).datum();

    if (width === undefined)
      width = svg.parentNode.clientWidth;

    x.set(svg, ((xScale === undefined)
      ? d3.scaleLinear().domain([0, d3.max(data.values())]).nice()
      : xScale)
      .range([margin.left, width - margin.right])
    );

    y = ((yScale === undefined)
      ? d3.scaleBand().domain(data.keys()).padding(0.3)
      : yScale)
      .range([height - margin.bottom, margin.top]);
  }

  function main(selection) {
    selection.each(function (data, index) {
      init(this);

      const svg = d3.select(this)
        .attr("height", height);

      const bind = svg.selectAll(".bind")
        .data(data);

      const bars = bind.join("g")
        .attr("class", "bar")
        .call(bar);

      svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(yAxis(y));

      const xAxisGroup = svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${margin.top})`);

      const xSplitGroup = svg.append("g")
        .attr("class", "split")
        .attr("transform", `translate(0, ${margin.top})`);

      const labels = bind.join("g")
        .attr("class", "label")
        .call(barLabel);

      const render = () => {
        const cw = this.parentNode.clientWidth;
        const w = (resize) ? cw : (cw < width) ? cw : width;

        svg.attr("width", w);

        const _x = x.get(this)
          .range([margin.left, w - margin.right]);

        xAxisGroup.call(xAxis(_x));
        xSplitGroup.call(xSplit(_x));

        const min = _x.domain()[0];

        bars.selectAll("rect")
          .attr("x", _x(min))
          .attr("width", d => _x(d[1]) - _x(min));

        labels.selectAll("text")
          .attr("x", d => _x(d[1]));
      }

      render();
      d3.select(window).on(`resize.${index}`, render);
    });
  }

  main.width = function (w) {
    return (arguments.length) ? (width = w, main) : width;
  }

  main.height = function (h) {
    return (arguments.length) ? (height = h, main) : height;
  }

  main.margin = function (m) {
    return (arguments.length) ? (margin = m, main) : margin;
  }

  main.xScale = function (_) {
    return (arguments.length) ? (xScale = _, main) : xScale;
  }

  main.yScale = function (_) {
    return (arguments.length) ? (yScale = _, main) : yScale;
  }

  main.color = function (c) {
    return (arguments.length) ? (color = c, main) : color;
  }

  main.label = function (l) {
    return (arguments.length) ? (label = l, main) : label;
  }

  main.resize = function (r) {
    return (arguments.length) ? (resize = r, main) : resize;
  }

  return main;
}
