import * as d3 from "d3";

export function barChart() {
  let width, height = 150;
  let margin = { top: 20, right: 40, bottom: 20, left: 40 };
  let x, y, color = () => "steelblue";
  let label = d => d[1];
  let resize = true;

  const bar = g => g.append("rect")
    .attr("class", "bar")
    .attr("y", d => y(d[0]))
    .attr("height", y.bandwidth())
    .attr("fill", d => color(d[0]));

  const barLabel = g => g.append("text")
    .attr("class", "label")
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
    if (x === undefined)
      x = d3.scaleLinear()
        .domain([0, d3.max(data.values())]).nice();
    if (y === undefined)
      y = d3.scaleBand()
        .domain(data.keys())
        .padding(0.3);

    x.range([margin.left, width - margin.right]);
    y.range([height - margin.bottom, margin.top]);
  }

  function main(selection) {
    selection.each(function (data, index) {
      init(this);
      const svg = d3.select(this)
        .attr("height", height);

      const bind = svg.selectAll(".bind").data(data);
      const bars = bind.join("g").call(bar);

      svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(g => {
          g.call(d3.axisLeft(y).tickSize(0));
          g.select(".domain").remove();
          g.selectAll(".tick text")
            .attr("font-weight", "bold")
          // .call(wrap, 150)
        });

      const xAxis = svg.append("g")
        .attr("transform", `translate(0, ${margin.top})`);

      const xSplit = xAxis.append("g")
        .attr("stroke", "white")
        .attr("stroke-width", 1)

      const labels = bind.join("g").call(barLabel);

      const render = () => {
        let cw = this.parentNode.clientWidth;
        let w = (resize) ? cw : (cw < width) ? cw : width;

        x.range([margin.left, w - margin.right]);

        xAxis
          .call(d3.axisTop(x))
          .select(".domain").remove();

        xSplit
          .selectAll(".split")
          .data(x.ticks())
          .join("line")
          .attr("class", "split")
          .attr("x1", x).attr("x2", x)
          .attr("y2", height - margin.bottom - margin.top);

        const min = x.domain()[0];

        svg.attr("width", w);
        bars.selectAll("rect")
          .attr("x", x(min))
          .attr("width", d => x(d[1]) - x(min));
        labels.selectAll("text")
          .attr("x", d => x(d[1]));
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
    return (arguments.length) ? (x = _, main) : x;
  }

  main.yScale = function (_) {
    return (arguments.length) ? (y = _, main) : y;
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
