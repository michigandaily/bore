# bore

> beautiful or else.

**bore** lets you write extendible, reusable, and stylistically consistent
visualizations. We're using it for our interactive graphics at the [Michigan
Daily](https://michigandaily.com).

## Installation

Minified CSS and JS files are in `dist/`.

Depends on:

- [d3v5](https://d3js.org/)
- [d3-array](https://github.com/d3/d3-array) to use the most up-to-date array
  functions
- [d3-annotations](https://d3-annotation.susielu.com/) for annotations

## Usage

### Example

In your HTML, have a parent figure element with class `vis` and another
identifying class name.
```html
<figure class="vis cases_closings"></figure>
```
In your JavaScript, declare a new visualization by inheriting one of our base
visualization classes (documentation coming soon™). Create an instance of the
visualization and call its `draw()` function to render.
```js
class CasesClosings extends bore.MultiLinePlot {
  constructor(el, width, height, margins, data) {
    super(el, width, height, margins, data);
    this.title = "A Late Start and a Rush to Catch Up";
    this.subtitle = "Cumulative case and school count on a log scale (slope is rate of exponential increase)."
    this.author = "Naitian Zhou";

    this.yscale = d3.scaleLog().range([this.height, 0]).nice();
    this.yaxis.ticks(6);

    this.xaxis.tickFormat(d3.timeFormat("%m-%d"));
    this.draw();
  }

  hoverFormat(d) {
    // this is a shorthand because index is 0 or 1
    return !d.ind ? `${d.y} schools` : `${d.y} cases`;
  }

  draw() {
    super.draw();
  }
}
const closings_counts = closings_ct.getData();
const case_counts = Array.from(
d3.rollup(
  nytcases_data,
  (g) => d3.sum(g.map((s) => s.cases)),
  (d) => formatTime(d.date)
).entries(),
d => ({x: parseTime(d[0]), y: d[1]})
).sort((a, b) => d3.ascending(a.x, b.x));
const cases_closings = new CasesClosings(
  ".vis.cases_closings",
  400,
  300,
  { top: 60, bottom: 50, left: 50, right: 60 },
  [closings_counts, case_counts]
)
```

## Contributing

Clone the repository, and install the node modules with `yarn`.

To build for production (compiles and minifies SCSS and Javascript), just run
`gulp`.
