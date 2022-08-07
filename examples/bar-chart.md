# bar-chart

Here's a basic bar chart:

```javascript
import pym from "pym.js";
import * as d3 from "d3";
import { build, BarChart } from "@michigandaily/bore";

const draw = () => {
  const figure = d3.select("figure");

  const data = new Map()
    .set("A", 5)
    .set("B", 2)
    .set("C", 2)
    .set("D", 10)
    .set("E", 4)
    .set("F", 1)
    .set("G", 20)

  figure.append("svg")
    .datum(data)
    .call(
      build(
        new BarChart()
      )
    )
}
```

The bar chart data has to be a [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) data structure. However, we typically deal with arrays and objects. We'll need to convert these data structures to maps.

Consider the following CSV file:

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

Here's how we can still use `BarChart`.

1. Import your CSV:

   ```javascript
   import datafile from "../data/data.csv";
 
   // d3.autoType infers ISO 8601 strings and numbers into the correct JavaScript types
   const csvdata = await d3.csv(datafile, d3.autoType);
 
   // After reading the CSV file with `d3.csv`, we get the following as `data`:
   // [
   //   { key: "A", value: 5 },
   //   { key: "B", value: 2 },
   //   { key: "C", value: 2 },
   //   { key: "D", value: 10 },
   //   { key: "E", value: 4 },
   //   { key: "F", value: 1 },
   //   { key: "G", value: 20 }
   // ]
   ```

2. Use the `map` function to convert the data into something usable by the `Map` constructor:

   ```javascript
   // We can convert this array of objects to a map by doing the following:
   
   const data = csvdata.map((d) => [d.key, d.value]);
   
   // That gives us the following structure:
   
   // [
   //   ["A", 5],
   //   ["B", 2],
   //   ["C", 2],
   //   ["D", 10],
   //   ["E", 4],
   //   ["F", 1],
   //   ["G", 20],
   // ];
   ```

3. Then we can use the `Map` constructor:

   ```javascript
   new Map(data)
   ```

Here's it all put together:

```javascript
import pym from "pym.js";
import * as d3 from "d3";
import { build, BarChart } from "@michigandaily/bore";
import datafile from "../data/data.csv";

const draw = async () => {
  const figure = d3.select("figure");
  const csvdata = await d3.csv(datafile, d3.autoType);

  const data = csvdata.map((d) => [d.key, d.value]);

  figure.append("svg")
    .datum(new Map(data))
    .call(
      build(
        new BarChart()
      )
    )
};
```

[`d3.group`, `d3.rollup`, and `d3.index`](https://observablehq.com/@d3/d3-group) are also very helpful `d3` functions that can convert data into a `Map`.
