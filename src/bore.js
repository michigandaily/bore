export * from "./util/color";
export { default as wrap } from "./util/wrap";
export { default as BarChart } from "./graphic/BarChart";
export { default as GroupedBarChart } from "./graphic/GroupedBarChart";
export { default as LineChart } from "./graphic/LineChart";
export { default as ScatterPlot } from "./graphic/ScatterPlot";
export { default as ColumnChart } from "./graphic/ColumnChart";

const build = (chart) => chart.draw.bind(chart);

export { build };
