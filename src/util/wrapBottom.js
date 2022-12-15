import { select } from "d3";

/**
 *
 * @param {d3.Selection<HTMLElement>} selection
 * @param {Number} allottedWidth
 * @returns {Number}
 */
const wrap = (selection, allottedWidth) => {
  const textElements = selection.nodes();
  const height = 12;

  let pixelsToWrapAt = Math.max(
    ...textElements
      .filter((element) => element.textContent.split(/\s+/).length === 1)
      .map((element) => element.getComputedTextLength()),
    allottedWidth
  );

  let linesToWrapAt = 1;

  textElements.forEach((element) => {
    let lines = 1;
    const words = element.textContent.split(/\s+/).reverse();
    if (words.length === 1) {
      return;
    }

    const clone = select(element).clone();
    let tspan = clone
      .append("tspan")
      .attr("x", 0)
      .attr("y", 3)
      .attr("dy", clone.attr("dy"));

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
        tspan.text(line.join(" "));
        maximumSpanLengthNecessary = Math.max(
          maximumSpanLengthNecessary,
          tspan.node().getComputedTextLength()
        );

        line = [word];
        tspan = clone
          .append("tspan")
          .attr("x", 0)
          .attr("y", `${height * lines + Number(clone.attr("y"))}`)
          .attr("dy", clone.attr("dy"))
          .text(word);

        lines++;
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
    linesToWrapAt = Math.max(linesToWrapAt, lines);
  });

  return linesToWrapAt * height;
};

export default wrap;
