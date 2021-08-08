import * as d3 from "d3";

export function barChart() {
  let width, height;
  let margin = { top: 0, right: 40, bottom: 0, left: 40 }; 
  let x, y, color;
  let label = d => d[1];

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
    if (height === undefined)
      height = 100;
    if (x === undefined)
      x = d3.scaleLinear()
        .domain([0, d3.max(data.values())]).nice()
        .range([margin.left, width - margin.right]);
    if (y === undefined)
      y = d3.scaleBand()
        .domain(data.keys())
        .range([height - margin.bottom, margin.top])
        .padding(0.3)
    if (color === undefined)
      color = () => "steelblue";
  }

  function main(selection) {
    selection.each(function(data) {
      init(this);
      const svg = d3.select(this)
        .attr("height", height);

      const bind = svg.selectAll(".bar").data(data);
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
        .attr("transform", `translate(0, ${height - margin.top})`)
      
      const labels = bind.join("g").call(barLabel);

      const render = () => {
        width = this.parentNode.clientWidth;
        x.range([margin.left, width - margin.right]);
        xAxis.call(g => {
          g.call(d3.axisTop(x).tickSize(height - margin.top - margin.bottom))
          g.select(".domain").remove();
          g.selectAll(".tick text").remove();
          g.selectAll(".tick line")
            .attr("stroke", "white");
        });

        svg.attr("width", width);
        bars.selectAll("rect")
          .attr("x", x(0))
          .attr("width", d => x(d[1]) - x(0));
        labels.selectAll("text")
          .attr("x", d => x(d[1]));
      }

      render();
      window.onresize = render
    });
  }

  main.width = function(w) {
    return (arguments.length) ? (width = w, main) : width;
  }

  main.height = function(h) {
    return (arguments.length) ? (height = h, main) : height;
  }

  main.margin = function(m) {
    return (arguments.length) ? (margin = m, main) : margin;
  }

  main.xScale = function(_) {
    return (arguments.length) ? (x = _, main) : x;
  }

  main.yScale = function(_) {
    return (arguments.length) ? (y = _, main) : y;
  }

  main.color = function(c) {
    return (arguments.length) ? (color = c, main) : color;
  }

  main.label = function(l) {
    return (arguments.length) ? (label = l, main) : label;
  }

  return main;
}
