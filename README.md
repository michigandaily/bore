# bore

> beautiful or else.

`bore` lets you write extendible, reusable, and stylistically consistent visualizations.

We use it for our data graphics at [The Michigan Daily](https://michigandaily.com).

## Installing `bore`

1. Add `bore` as a dependency:

   ```bash
   yarn add https://github.com/MichiganDaily/bore.git
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

### Build `bore` and serve `cookie`

1. In `bore`, run `yarn watch`.
   - This command will watch for changes in `src` and generate build files in `dist`.
   - Alternatively, run `yarn build` to build once without watching for changes.
2. In `cookie`, run `make dev`.
   - Whenever changes are made in `bore`, the `cookie` server will reload to reflect those changes.

### Unlink `bore` and `cookie`

1. In `bore`, run `yarn unlink`.
2. In `cookie`, run `yarn unlink "bore"`.
