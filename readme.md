# qvp

A tiny (900 byte gzipped) media query utility for programmatic control in different screen viewports within the browser.

### Install

The module is shipped for ESM consumption in the Browser.

```bash
pnpm add qvp
```

# Basic Usage

The module uses named exports, so assign a default.

```js
import * as vp from 'qvp';

vp.screens([
  {
    id: 'sm',
    query: '(max-width: 576px)',
    onenter: () => {
      console.log('Screen size is below 576px');
    },
    onexit: () => {
      console.log('Screen size is above 576px');
    }
  },
  {
    id: 'md',
    query: '(min-width: 768px) and (max-width: 992px)',
    onenter: () => {
      console.log('Screen size above 768px but below 992px');
    },
    onresize: x => {
      console.log('Screen size is: ' + x);
    },
    onexit: () => {
      console.log('Left the viewport');
    }
  }
]);
```

> You can optionally choose to provide an `{}` instead of array list. The `id` value is **required** and if no `query` is provided it will default to `all`.

### Methods

The module provides several helpful methods for querying and retrieving context of the browsers screen.

<!-- prettier-ignore -->
```ts
import * as vp from 'qvp';

vp.add(id, {})       // Extends the screen with new methods
vp.get(id)           // Returns the viewport and screen matching the id
vp.active()          // List of active screens or single screen
vp.active(id)        // Boolean indicating whether the screen is active
vp.list()            // List of viewport screens states
vp.list(ids[])       // List of viewport screen states matching the ids
vp.remove(id)        // Remove a viewport matching the id from store
vp.destroy()         // Tear down and remove all instances

```

### Store

The module maintains a store within a constant named `viewports` which you can access as a named import. The store is maintained within a `Map`and each `key` value uses the screen ids, that values hold the screen instances.

<!-- prettier-ignore -->
```ts
import { viewports } from 'qvp';

viewports.forEach(viewport => {


  // SCREEN INSTANCE GETTER

  viewport.screen            // The screen instance
  viewport.screen.id         // The screen id value
  viewport.screen.query      // The media query value
  viewport.screen.active     // A boolean value indicating whether the viewport is active
  viewport.screen.oninit     // A Set list of methods to invoke oninit
  viewport.screen.onenter    // A Set list of methods to invoke onenter
  viewport.screen.onexit     // A Set list of methods to invoke onexit
  viewport.screen.onresize   // A Set list of methods to invoke when resizing

  // METHOD TRIGGERS

  viewport.oninit()          // Calls all methods in screen.oninit Set (null if already invoked)
  viewport.onenter()         // Calls all methods in screen.onenter Set
  viewport.onexit()          // Calls all methods in screen.onexit Set
  viewport.onresize()        // Calls all methods in screen.onresize Set

})

```
