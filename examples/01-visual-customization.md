# visual-customization

The following visual customizations apply to essentially every visual type. When we get to other chart types, we'll go over any customizations that apply specifically to those charts, or if a customization does not apply.

We'll use a bar chart in all of these examples.

Let's start with the following `data.csv` file:

```csv
key,value
A,5
B,2
C,2
D,10
E,4
F,1
G,20
```

and JavaScript code from the the last example:

```javascript
import { csv, autoType, select } from "d3";
import { build, BarChart } from "@michigandaily/bore";
import datafile from "../data/data.csv";

const draw = async () => {
  const csvdata = await csv(datafile, autoType);
  const data = csvdata.map((d) => [d.key, d.value]);

  const figure = select("figure");
  figure.append("svg")
    .datum(new Map(data))
    .call(
      build(
        new BarChart()
      )
    );
};
```

As a start, you can change the height of the chart with the `height` method. This will set the height of the chart to 500 pixels:

```javascript
figure.append("svg")
  .datum(new Map(data))
  .call(
    build(
      new BarChart()
        .height(500)
    )
  );
```

With that, you might expect that you can change the width of the chart with the `width` method. However, `bore` will resize to the parent container by default. In order to control the width, you'll also have to turn resizing off:

```javascript
figure.append("svg")
  .datum(new Map(data))
  .call(
    build(
      new BarChart()
        .width(300)
        .resize(false)
    )
  );
```

Perhaps it should be the case that if a `width` is specified, `bore` should assume that resizing should also be turned off.

The last caveat for setting width is that if the parent container's width is less than the specified width, `bore` will resize to fit the parent container, even if resizing is set to `false`.

The appropriate responsive width is exposed through the `getResponsiveWidth` function.

You can also specify the chart's margin with the `margin` method. You only need to pass in the `left`, `top`, `bottom`, or `right` properties that you want to change from default. In this example, we only want to change the left margin but leave all the other margins as default:

```javascript
figure
  .append("svg")
  .datum(new Map(data))
  .call(
    build(
      new BarChart()
        .margin({ left: 50 })
    )
  );
```

You can change the chart's scales using the `xScale` and `yScale` methods:

```javascript
figure
  .append("svg")
  .datum(new Map(data))
  .call(
    build(
      new BarChart()
        .xScale(d3.scaleLinear().domain([0, 100]))
        .yScale(d3.scaleBand().domain(new Map(data).keys()))
    )
  );
```

Note that we don't set the `range` of either scale. This is because `bore` will always set the range according to the width and height of the graphic.

Setting a custom scale is particularly useful when making small multiples. We'll talk more about this in the small multiples example.

You can change the chart's axes with the `xAxis` and `yAxis` methods.

For the `xAxis` method, you need to pass in a [curried function](https://en.wikipedia.org/wiki/Currying) with `scale` as the first function parameter, and `g` as the second function parameter:

```javascript
const height = 250;

figure
  .append("svg")
  .datum(new Map(data))
  .call(
    build(
      new BarChart()
        .height(height)
        .xAxis(function (scale) {
          return (g) => {
            const width = this.getResponsiveWidth();
            const { bottom } = this.margin();
            g.attr("transform", `translate(0, ${height - bottom})`).call(
              d3.axisBottom(scale).ticks(width / 80)
            );
          };
        })
    )
  );
```

Make note of the `function` keyword usage. This is necessary for having access to the appropriate `this` keyword inside the function body.

The `yAxis` method also requires a curried function:

```javascript
figure
  .append("svg")
  .datum(new Map(data))
  .call(
    build(
      new BarChart()
        .yAxis((scale) => (g) => {
          g.call(d3.axisLeft(scale).tickSize(0));
          g.select(".domain").remove();
        })
    )
  );
```

In the above example, we don't use the `function` keyword because we don't use `this`.

We'll return to the `redraw` parameter when we get to updating data.

You can specify a bar's color using the `color` method. This method can either receive a string:

```javascript
figure
  .append("svg")
  .datum(new Map(data))
  .call(
    build(
        new BarChart()
          .color("red")
      )
    );
```

or a function:

```javascript
const c = d3
  .scaleOrdinal()
  .domain(new Map(data).keys())
  .range(d3.schemeBlues[data.length]);

figure
  .append("svg")
  .datum(new Map(data))
  .call(
    build(
      new BarChart()
        .color((d) => c(d[0]))
      )
    );
```

The first parameter corresponds to the bar's bound datum, which is a Map entry. You can retrieve the key with `d[0]` and the value with `d[1]`. If needed, the second paramter will correspond to the bar's index.

You can add a label to each bar using the `label` method which takes a string or function (just like the `color` method):

```javascript
figure
  .append("svg")
  .datum(new Map(data))
  .call(
    build(
      new BarChart()
        .label((d, i) => i)
      )
    );
```

You can change how many horizontal pixels a x-axis label takes up using the `wrappx` method:

```javascript
figure
  .append("svg")
  .datum(new Map(data))
  .call(
    build(
      new BarChart()
        .wrappx(100)
      )
    );
```

If there are no x-axis labels that are over 100 pixels in length, then the left margin of the bar chart will be set to the maximum length among the labels.

If a label does exceed 100 pixels, that label will begin to wrap it's text to a line below. The left margin will be set to 100 pixels.
