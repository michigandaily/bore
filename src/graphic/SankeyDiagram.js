import { select } from "d3";
import { sankey, sankeyLinkHorizontal, sankeyCenter } from "d3-sankey";
import Visual from "./Visual";

export default class SankeyDiagram extends Visual {
  constructor() {
    super();
    this.height(500);
    this.margin({ left: 0, right: 0, top: 10, bottom: 10 });
    this.resize(true);
    this.redraw(false);
  }

  draw(selections) {
    selections.each((data, i, selection) => {
      const { left, right, top, bottom } = this.margin();
      const node = selection[i];
      const svg = select(node)
        .attr("height", this.height())
        .attr("class", "sankey-diagram");
      this.svg = svg;

      const sankeyGenerator = sankey()
        .nodeId((d) => d.id)
        .nodeAlign(sankeyCenter)
        .nodeSort(null);

      const links = this.appendOnce("g", "link-group")
        .attr("stroke-opacity", 0.5)
        .attr("fill", "none")
        .attr("stroke", "gray");

      const nodes = this.appendOnce("g", "node-group")
        .attr("fill", "steelblue")
        .attr("opacity", 0.8);

      const labels = this.appendOnce("g", "label-group");

      const render = () => {
        const w = this.getResponsiveWidth();
        svg.attr("width", w);

        sankeyGenerator.extent([
          [left, top],
          [w - right, this.height() - bottom],
        ]);

        const graph = sankeyGenerator(data);

        links
          .selectAll(".link")
          .data(graph.links)
          .join("path")
          .attr("class", "link")
          .attr("d", sankeyLinkHorizontal())
          .attr("stroke-width", (d) => d.width);

        nodes
          .selectAll(".node")
          .data(graph.nodes)
          .join("rect")
          .attr("class", "node")
          .attr("x", (d) => d.x0)
          .attr("y", (d) => d.y0)
          .attr("width", (d) => d.x1 - d.x0)
          .attr("height", (d) => d.y1 - d.y0);

        labels
          .selectAll(".label")
          .data(graph.nodes)
          .join("text")
          .attr("class", "label")
          .attr("x", (d) => (d.x0 < w / 2 ? d.x1 + 6 : d.x0 - 6))
          .attr("y", (d) => (d.y1 + d.y0) / 2)
          .attr("dy", "0.35em")
          .attr("text-anchor", (d) => (d.x0 < w / 2 ? "start" : "end"))
          .text((d) => d.name);
      };
      render();
      select(window).on(`resize.${i}`, render);
    });
  }
}
