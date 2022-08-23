# bore

> beautiful or else.

`bore` is a library built on top of [D3](https://github.com/d3/d3) that lets you create extendible, reusable and stylistically consistent visualizations. It follows from the article ["Towards Reusable Charts"](https://bost.ocks.org/mike/chart/) written by [Mike Bostock](https://github.com/mbostock).

We use it for our data graphics at [The Michigan Daily](https://michigandaily.com).

If you're familiar with D3, using `bore` should be fairly intuitive because it follows from the function pattern in D3 (and jQuery).

  ```javascript
  const svg = d3.select("figure")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const x = d3.scaleLinear()
    .domain([0, 100])
    .range([margin.left, width - margin.right])

  const xAxis = svg.append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(x).ticks(width / 80));
  ```

Here we append a `g` element to the `svg` and call the `axisLeft` function with the `x` scale. We chain the `ticks` function to modify the default behavior of the axis function.

The purpose of `bore` is to create a higher-level API on top of D3 that can be used to create common chart types. Like how D3 has a built-in API for creating axes, `bore` has a built-in API for creating charts.

In addition to providing chart types, `bore` also exports several useful utility constructs such as a text-wrapping, styled axes and color schemes.

## Using `bore`

- Add `bore` as a dependency:

  ```bash
  yarn add michigandaily/bore
  ```

   You can use a specific version or branch of `bore` by adding a `#` to the end and specifying a version or branch (e.g., `#v2.0.0`).

- Import `bore`:

  ```javascript
  import * as bore from "@michigandaily/bore";
  ```

- Bind your data to an SVG:

  ```javascript
  const svg = d3.select("figure")
    .append("svg")
    .datum(data);
  ```

  This library is being made with [maps](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)* in mind, but it may also work with other iterables.

- Call a `bore` chart on your SVG selection:

  ```javascript
  svg.call(
    bore.build(
      new bore.BarChart()
        .color(color)
        .height(175)
        .label(d => `${d[1].toPrecision(3)}%`)
        .wrappx(75);
    )
  );
  ```

  Make note of the `new` keyword. Internally, `bore` implements each chart type as a class. The `new` keyword is necessary to create a new instance of a class (as is usual in OOP).
  
  Also make note of the `build` function that wraps the entire `BarChart` construction. Internally, this is necessary to correctly bind the `this` context of the chart to itself instead of to the D3 selection.

  Using other chart types will follow a nearly identical pattern, though the functions that can be chained to a chart type may differ from chart to chart. Refer to the [API Reference](#api-reference) for more details or take a look at the [examples](./examples/).

<!-- Make a note of redrawing, small multiples, resizing -->

\* I initially chose maps over objects because I felt it'd be less ergonomic to have to specify an x or y accessor. However, it may be preferable to specify accessors in some chart types. I have not done research into the performance benefits of maps or objects.

## [API Reference](#api-reference)

TODO

## Developing `bore`

Work on a branch if you plan on adding something to `bore` -- the `main` branch is protected.

### Install `bore` and `cookie`

1. Clone `cookie`.
2. Inside `cookie`, clone `bore`.
   - This is necessary for Parcel 2 hot reloading. Be careful of the nested repositories here. If it helps, you may want to run `rm -rf .git` in `cookie`.
3. In `cookie`, run `make`.
4. In `bore`, run `yarn`.

### Link `bore` and `cookie`

1. In `bore`, run `yarn link`.
2. In `cookie`, run `yarn link "@michigandaily/bore"`.
3. Import `bore` in `cookie`:

   ```javascript
   // cookie/src/graphic/js/graphic.js
   import * as bore from "@michigandaily/bore";
   ```

### Serve `cookie`

In `cookie`, run `yarn dev`.

Whenever changes are made in `bore`, the `cookie` server will reload to reflect those changes.

### Unlink `bore` and `cookie`

When finished developing, unlink the repositories.

1. In `cookie`, run `yarn unlink "@michigandaily/bore"`.
2. In `bore`, run `yarn unlink`.

### Git and releases

- Run `yarn build` to create a minified version of `bore` in the `dist` directory.
- Update the version in `package.json` according to [semantic versioning](https://semver.org/).
- Create a pull request to `main`.
- Once merged, create a new tag and release with the same version number in `package.json` prefxied with `v`.
