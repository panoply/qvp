interface ViewportFunctions {
  /**
   * A method that runs when the viewport is first entered (triggered only once).
   */
   oninit?(): void
   /**
    * A method to fire when you enter the viewport.
    */
   onenter?(): void
   /**
    * A method to fire when you leave the viewport.
    */
   onexit?(): void
   /**
    * A method to fire upon screen resize
    */
   onresize?(screenX?: number): void
}

interface ViewportOptions extends ViewportFunctions {
  /**
   * An ID reference for the viewport. This will be used in queries
   */
  id: string;
  /**
   * The media query to match
   *
   * @example
   *
   * '(min-width: 768px)'
   */
  query: string;
}

interface ViewportScreen {
  /**
   * Whether or not viewport is active
   */
  active: boolean;
  /**
   * The ID reference for the viewport
   */
  id: string
  /**
   * The media query being matches
   */
  query: string;
  /**
   * Match media instances
   */
  test: MediaQueryList;
  /**
   * A `Set` List of methods that will be triggered upon initializing within the viewport
   */
  oninit: Set<() => void>;
  /**
  * A `Set` List of methods that will be triggered when entering the viewport
  */
  onenter: Set<() => void>;
  /**
  * A `Set` List of methods that will be triggered when existing the viewport
  */
  onexit: Set<() => void>;
  /**
  * A `Set` List of methods that will be triggered when resizing the screen.
  */
  onresize: Set<(screenX?: number) => void>;
}

/**
 * The Viewports store
 *
 * Holds a reference to all states
 */
export const viewports: Map<string, ReturnType<typeof create>> = new Map();

/**
 * Debounce
 *
 * Throttles the dimension calculation references
 */
function debounce (func?: Function, wait?: number) {

  let timeout: number = wait;

  return function () {

    const later = () => {
      timeout = null;
      func.apply(this, arguments);
    };

    if (timeout) cancelAnimationFrame(timeout);
    timeout = requestAnimationFrame(later);

  };
}

/**
 * Methods
 *
 * Adds methods to the viewports instance that are to be
 * triggered when matched.
 */
function methods (opts: ViewportOptions, vp: ViewportScreen) {

  if (typeof opts.onenter === 'function') {
    vp.onenter.add(opts.onenter);
  }

  if (typeof opts.onexit === 'function') {
    vp.onexit.add(opts.onexit);
  }

  if (typeof opts.onresize === 'function') {
    vp.onresize.add(opts.onresize);
  }

  if (typeof opts.oninit === 'function') {
    vp.onresize.add(opts.oninit);
  }
}

/**
 * Create
 *
 * Create viewport states
 */
function create (opts: ViewportOptions) {

  const vp: ViewportScreen = Object.create(null);

  vp.id = opts.id;
  vp.query = opts.query || 'all';
  vp.active = false;
  vp.test = matchMedia(vp.query);

  vp.onenter = new Set();
  vp.onexit = new Set();
  vp.onresize = new Set();
  vp.oninit = new Set();

  methods(opts, vp);

  /**
   * Enter
   *
   * Invoked when the screen viewport has entered
   */
  const onenter = () => {

    if (vp.oninit.size > 0) {
      vp.oninit.forEach(method => method());
      vp.oninit.clear();
    }

    vp.onenter.forEach(method => method());
    vp.active = true;
  };

  /**
   * Exit
   *
   * Invoked when the screen viewport has existed
   */
  const onexit = () => {

    vp.onexit.forEach(method => method());
    vp.active = false;

  };

  /**
   * Resize
   *
   * Invoked when the screen is being resized within viewport bounds
   */
  const onresize = (x: number) => vp.onresize.forEach(method => method(x));

  if (vp.test.matches) onenter();

  /**
   * Listen
   *
   * Invoked when the screen viewport has existed
   */
  const listen = ({ matches }: MediaQueryListEvent) => matches ? onenter() : onexit();

  /**
   * Destroy
   *
   * Remove the `matchMedia` listener
   */
  const destroy = () => vp.test.removeListener(listen);

  vp.test.addListener(listen);

  return {
    onenter,
    onexit,
    onresize,
    destroy,
    get screen () { return vp; }
  };

}

/**
 * Create Screens
 *
 * Define a set of viewports to match against. You can
 * optionally include methods or use `add` to set methods
 * at a later time.
 */
export const screens = (options: ViewportOptions | ViewportOptions[]) => {

  if (Array.isArray(options)) return options.forEach(screens);

  if (!('id' in options)) throw new Error('viewports: Missing an "id" reference');

  const state = create(options);
  const { id } = state.screen;

  if (!viewports.size) {
    addEventListener('resize', debounce(() => {
      viewports.forEach((viewport) => {
        if (viewport.screen.active) viewport.onresize(window.innerWidth);
      });
    }, 25), true);
  }

  if (!viewports.has(id)) {
    viewports.set(id, state);
  } else {
    console.warn(`viewports: The id "${id}" is already defined, use viewports.add() instead.`);
  }
};

/**
 * Get Viewport
 *
 * Returns a viewport instance by its `id` else `false`
 */
export const get = (id: string) => {

  if (!viewports.has(id)) return false;

  return viewports.get(id);

};

/**
 * Add Methods
 *
 * Add methods to be invoked in when the viewport is matched.
 */
export const add = (id: string, actions: ViewportFunctions) => {

  const vp = get(id);

  if (vp === false) return console.error(`viewports: There is no viewport using id "${id}"`);

  methods(actions as ViewportOptions, vp.screen);

  if (vp.screen.test.matches) vp.onenter();

};

/**
 * List Screens
 *
 * Returns a list of viewport screens from the store. Optionally
 * provide a `string[]` list of ids.
 */
export const list = (ids?: string[]) => {

  const items = Array.from(viewports.values()).map(({ screen }) => screen);

  return ids
    ? items.filter(({ id }) => ids.includes(id))
    : items;

};

/**
 * Check State
 *
 * Returns a `boolean` value informing on whether the provided
 * viewport id is active or not. When no `id` parameter is passed
 * a list of viewport screens which are active will be returned.
 */
export const active = (id?: string) => {

  const items = list();

  if (id) {
    const find = get(id);
    return find ? find.screen.active : false;
  }

  const filter = items.filter(({ active }) => active === true);

  return filter.length > 1 ? filter : filter[0];

};

/**
 * Remove viewport query
 *
 * Removes and destroys the viewport screen and store with
 * the matching `id` provided.
 */
export const remove = (id: string) => {

  if (viewports.has(id)) {
    viewports.get(id).destroy();
    viewports.delete(id);
  }

};

/**
 * Destroy
 *
 * Removes all instances and tears down the listeners.
 */
export const destroy = () => {

  removeEventListener('resize', debounce());
  viewports.forEach(viewport => viewport.destroy());
  viewports.clear();

};
