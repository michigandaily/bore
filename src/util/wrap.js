import { select } from "d3";

const length = el => el.node().getComputedTextLength();

// This function is adapted from a Mike Bostock implementation of text wrapping
// https://bl.ocks.org/mbostock/7555321
const wrap = (selection, w) => {
  let maxTextL = 0;
  let maxSpanL = 0;
  let l;

  const lencomp = (text, context) => {
    l = length(text);
    return Math.max(l, context);
  }

  // eslint-disable-next-line func-names
  selection.each(function () {
    const text = select(this);

    // get the maximum possible length of a label
    maxTextL = lencomp(text, maxTextL);

    const words = text.text().split(/\s+/).reverse();
    if (words.length === 1) return;
    let word;
    let line = [];
    const x = text.attr("x");
    const y = text.attr("y");
    let tspan = text
      .text(null)
      .append("tspan")
      .attr("x", x)
      .attr("y", y);

    // eslint-disable-next-line no-cond-assign
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));

      l = length(tspan);
      if (l > w) {
        tspan.attr("y", text.attr("y") - 5);
        line.pop();
        tspan.text(line.join(" "));

        // get the maximum length of a line
        maxSpanL = lencomp(tspan, maxSpanL);

        line = [word];
        tspan = text
          .append("tspan")
          .attr("x", x)
          .attr("y", y)
          .attr("dy", "1em")
          .text(word);

        maxSpanL = lencomp(tspan, maxSpanL);
      }
    }
  });

  return (maxSpanL && maxSpanL < maxTextL) ? maxSpanL : maxTextL;
}

export default wrap;
