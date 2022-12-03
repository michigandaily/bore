import { select } from "d3";

// This function is adapted from a Mike Bostock implementation of text wrapping
// https://bl.ocks.org/mbostock/7555321
const wrap = (selection, allottedWidth) => {
  const textElements = selection.nodes();

  let pixelsToWrapAt = Math.max(
    ...textElements
      .filter((element) => element.textContent.split(/\s+/).length === 1)
      .map((element) => element.getComputedTextLength()),
    allottedWidth
  );

  textElements.forEach((element) => {
    const words = element.textContent.split(/\s+/).reverse();

    if (words.length === 1) {
      return;
    }

    const clone = select(element).clone();
    let tspan = clone
      .append("tspan")
      .attr("x", clone.attr("x"))
      .attr("y", 0)
      .attr("dy", clone.attr("dy"));

    const height = 16.5;

    let word = String();
    let line = Array();
    let maximumSpanLengthNecessary = 0;
    while (words.length > 0) {
      word = words.pop();
      line.push(word);
      tspan.text(line.join(" "));

      const lineLength = tspan.node().getComputedTextLength();
      if (lineLength > pixelsToWrapAt) {
        if (line.length === 1) {
          tspan.attr("y", `${tspan.attr("y")}`).text(line.join(" "));
          maximumSpanLengthNecessary = Math.max(
            maximumSpanLengthNecessary,
            tspan.node().getComputedTextLength()
          );
          continue;
        }
        line.pop();
        tspan
          .attr("y", `-${height / 3 + Number(tspan.attr("y"))}`)
          .text(line.join(" "));
        maximumSpanLengthNecessary = Math.max(
          maximumSpanLengthNecessary,
          tspan.node().getComputedTextLength()
        );

        line = [word];
        tspan = clone
          .append("tspan")
          .attr("x", clone.attr("x"))
          .attr("y", `${height / 3 + clone.attr("y")}`)
          .attr("dy", clone.attr("dy"))
          .text(word);

        maximumSpanLengthNecessary = Math.max(
          maximumSpanLengthNecessary,
          tspan.node().getComputedTextLength()
        );
      } else {
        maximumSpanLengthNecessary = Math.max(
          maximumSpanLengthNecessary,
          lineLength
        );
      }

      pixelsToWrapAt = Math.max(pixelsToWrapAt, maximumSpanLengthNecessary);
    }

    select(element).remove();
  });

  return pixelsToWrapAt;
};

export default wrap;
