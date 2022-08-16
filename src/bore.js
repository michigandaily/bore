export * from "./util/color";
export { default as wrap } from "./util/wrap";
export { default as BarChart } from "./graphic/BarChart";
export { default as GroupedBarChart } from "./graphic/GroupedBarChart";
export { default as ScatterPlot } from "./graphic/ScatterPlot";

const build = (chart) => chart.draw.bind(chart);

export { build };
