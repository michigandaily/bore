export * from "./util/color";
export { default as wrap } from "./util/wrap";
export { default as BarChart } from "./graphic/BarChart";
export { default as GroupedBarChart } from "./graphic/GroupedBarChart";
export { default as LineChart } from "./graphic/LineChart";

const build = (chart) => chart.draw.bind(chart);

export { build };
