# bore

> beautiful or else.

`bore` is a library built on top of [D3](https://github.com/d3/d3) that lets you create extendible, reusable, and stylistically consistent visualizations. It follows from the article ["Towards Reusable Charts"](https://bost.ocks.org/mike/chart/) written by [Mike Bostock](https://github.com/d3/d3).

We use it for our data graphics at [The Michigan Daily](https://michigandaily.com).

## Installing `bore`

1. Add `bore` as a dependency:

   ```bash
   yarn add "https://github.com/MichiganDaily/bore.git#dev"
   ```

2. Import `bore`:

   ```javascript
   import * as bore from "bore";
   ```

## API Reference

TODO

## Developing `bore`

### Install `bore` and `cookie`

1. In the same parent directory, clone `bore` and `cookie`.
2. In `cookie`, run `make`.
3. In `bore`, run `yarn`.

### Link `bore` and `cookie`

1. In `bore`, run `yarn link`.
2. In `cookie`, run `yarn link "bore"`.
3. Import `bore` in `cookie`:

   ```javascript
   // cookie/src/graphic/js/graphic.js
   import * as bore from "bore";
   ```

### Serve `cookie`

In `cookie`, run `make dev`.

Whenever changes are made in `bore`, the `cookie` server will reload to reflect those changes.

### Unlink `bore` and `cookie`

When finished developing, unlink the repositories.

1. In `cookie`, run `yarn unlink "bore"`.
2. In `bore`, run `yarn unlink`.
