import * as d3 from "d3";

const length = el => el.node().getComputedTextLength();

// This function is adapted from a Mike Bostock implementation of text wrapping
// https://bl.ocks.org/mbostock/7555321
export const wrap = (selection, w) => {
  let maxTextL = 0, maxSpanL = 0, l;
  selection.each(function () {
    let text = d3.select(this);

    // get the maximum possible length of a label
    if ((l = length(text)) > maxTextL) {
      maxTextL = l;
    }

    let words = text.text().split(/\s+/).reverse();
    if (words.length === 1) return;
    let word;
    let line = Array();
    let x = text.attr("x"), y = text.attr("y");
    let tspan = text
      .text(null)
      .append("tspan")
      .attr("x", x)
      .attr("y", y);
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if ((l = length(tspan)) > w) {
        text.attr("y", text.attr("y") - 5);
        line.pop();
        tspan.text(line.join(" "));

        // get the maximum length of a line
        if ((l = length(tspan)) > maxSpanL) {
          maxSpanL = l;
        }

        line = [word];
        tspan = text
          .append("tspan")
          .attr("x", x)
          .attr("y", y)
          .attr("dy", "1.1em")
          .text(word);
      }
    }
  });

  return (maxSpanL && maxSpanL < maxTextL) ? maxSpanL : maxTextL;
}
