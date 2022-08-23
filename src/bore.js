export * from "./util/color";
export { default as wrap } from "./util/wrap";
export { default as AreaChart } from "./graphic/AreaChart";
export { default as BarChart } from "./graphic/BarChart";
export { default as ColumnChart } from "./graphic/ColumnChart";
export { default as GroupedBarChart } from "./graphic/GroupedBarChart";
export { default as GroupedColumnChart } from "./graphic/GroupedColumnChart";
export { default as StackedBarChart } from "./graphic/StackedBarChart";
export { default as StackedColumnChart } from "./graphic/StackedColumnChart";
export { default as LineChart } from "./graphic/LineChart";
export { default as ScatterPlot } from "./graphic/ScatterPlot";
export { default as SankeyDiagram } from "./graphic/SankeyDiagram";

const build = (chart) => chart.draw.bind(chart);

export { build };
