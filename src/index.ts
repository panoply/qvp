/* -------------------------------------------- */
/* TYPES                                        */
/* -------------------------------------------- */

interface ViewportFunctions {
  /**
   * A method that runs when the viewport is first entered (triggered only once).
   */
  oninit?: {
    (): void;
    /**
     * QVP Events callback functions determination property
     */
    'qvp:event'?: number;
  }
  /**
   * A method to fire when you enter the viewport.
   */
  onenter?: {
    (): void;
    /**
     * QVP Events callback functions determination property
     */
    'qvp:event'?: number;
  }
  /**
   * A method to fire when you leave the viewport.
   */
  onexit?: {
    (): void;
    /**
     * QVP Events callback functions determination property
     */
    'qvp:event'?: number;
  }
  /**
   * A method to fire upon screen resize
   */
  onresize?: {
    (screenX?: number): void;
    /**
     * QVP Events callback functions determination property
     */
    'qvp:event'?: number;
  }
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
  /**
   * Holds an object reference for every event emitter.
   */
  events: { [name: string]: Array<() => void> }
}

interface ViewportQueries {
  /**
   * An id > media-query schema.
   *
   * @example
   *
   * import qvp from 'qvp'
   *
   * // Define a set of queries for listening
   * qvp.screens({
   *   mobile: '(max-width: 576px)',
   *   desktop: '(min-width: 1024px)'
   * })
   *
   * // Queries allow for listeners
   * qvp.on('mobile:onenter', () => {})
   * qvp.on('mobile:onexit', () => {})
   * qvp.on('mobile:onresize', (screenX: number) => {})
   */
  [id: string]: string;
}

type EventNames = (
  | `${string}:oninit`
  | `${string}:onenter`
  | `${string}:onexit`
  | `${string}:onresize`
)

type EventFunctions<T extends EventNames> = (
  /**
   * Fires when then viewport is first entered (triggered only once).
   */
  T extends `${string}:oninit` ? () => void :
  /**
   * Firse when you enter the viewport.
   */
  T extends `${string}:onenter` ? () => void :
  /**
   * Fire when you leave the viewport.
   */
  T extends `${string}:onexit` ? () => void :
  /**
   * Fires upon screen resize
   */
  T extends `${string}:onresize` ? (screenX?: number) => void : never
)

type EventParameters<T extends EventNames> = (
  /**
   * Fires when then viewport is first entered (triggered only once).
   */
  T extends `${string}:oninit` ? undefined :
  /**
   * Firse when you enter the viewport.
   */
  T extends `${string}:onenter` ? undefined :
  /**
   * Fire when you leave the viewport.
   */
  T extends `${string}:onexit` ? undefined :
  /**
   * Fires upon screen resize
   */
  T extends `${string}:onresize` ? number : never
)

/* -------------------------------------------- */
/* FUNCTIONS                                    */
/* -------------------------------------------- */


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
function methods (opts: ViewportOptions | ViewportFunctions, vp: ViewportScreen) {

  if (typeof opts.onenter === 'function') {
    if (!('qvp:event' in opts.onenter)) opts.onenter['qvp:event'] = NaN;
    vp.onenter.add(opts.onenter);
  }

  if (typeof opts.onexit === 'function') {
    if (!('qvp:event' in opts.onexit)) opts.onexit['qvp:event'] = NaN;
    vp.onexit.add(opts.onexit);
  }

  if (typeof opts.onresize === 'function') {
    if (!('qvp:event' in opts.onresize)) opts.onresize['qvp:event'] = NaN;
    vp.onresize.add(opts.onresize);
  }

  if (typeof opts.oninit === 'function') {
    if (!('qvp:event' in opts.oninit)) opts.oninit['qvp:event'] = NaN;
    vp.oninit.add(opts.oninit);
  }

}

/**
 * Emit Event
 *
 * Private function use for emitting events which users are subscribed.
 */
function emit<T extends EventNames> (name: T, ...args: EventParameters<T>[]) {

  const vp = qvp.get(name.split(':')[0]);

  if (vp === false) return;
  if (!(name in vp.events)) return;


  for (let i = 0; i < vp.events[name].length; i++) {
    vp.events[name][i].apply(null, args);
    if (name.endsWith(':oninit')) qvp.off(name, i);
    if(!(name in vp.events)) break
  }


}

/**
 * Create
 *
 * Create viewport states
 */
function create (opts: ViewportOptions) {

  const query = opts.query || 'all';
  const vp: ViewportScreen = {
    id: opts.id,
    query,
    active: false,
    test: matchMedia(query),
    onenter: new Set(),
    onexit: new Set(),
    onresize: new Set(),
    oninit: new Set(),
    events: Object.create(null)
  };

  methods(opts, vp);

  /**
   * Enter
   *
   * Invoked when the screen viewport has entered
   */
  const onenter = () => {

    if (vp.oninit.size > 0) {
      vp.oninit.forEach(method => !isNaN(method['qvp:event']) || method());
      emit(`${opts.id}:oninit`);
      vp.oninit.clear();
    }

    vp.onenter.forEach(method => !isNaN(method['qvp:event']) || method());
    emit(`${opts.id}:onenter`);
    vp.active = true;

  };

  /**
   * Exit
   *
   * Invoked when the screen viewport has existed
   */
  const onexit = () => {

    vp.onexit.forEach(method => !isNaN(method['qvp:event']) || method());
    emit(`${opts.id}:onexit`);
    vp.active = false;
  };

  /**
   * Resize
   *
   * Invoked when the screen is being resized within viewport bounds
   */
  const onresize = (x: number) => {

    vp.onresize.forEach(method => !isNaN(method['qvp:event']) || method());
    emit(`${opts.id}:onresize`, x);

  };

  /**
   * Listen
   *
   * Invoked when the screen viewport has exited
   */
  const listen = ({ matches }: MediaQueryListEvent) => matches ? onenter() : onexit();

  /**
   * Destroy
   *
   * Remove the `matchMedia` listener and all events
   */
  const destroy = () => {
    for (const event in vp.events) delete vp.events[event];
    vp.test.removeEventListener('change', listen);
  };

  vp.test.addEventListener('change', listen);

  if (vp.test.matches) onenter();

  return {
    onenter,
    onexit,
    onresize,
    destroy,
    get screen () { return vp; },
    get events () { return vp.events; }
  };

}


const qvp: {
  /**
   * Screens
   *
   * Define a set of viewports to match against. This method
   * accepts 3 different schema options. You can optionally include
   * methods or use `add` to set methods at a later time.
   *
   * ```ts
   *
   * import qvp from 'qvp'
   *
   * // Multiple Screens with methods
   * qvp.screens([
   *   {
   *     id: 'mobile',
   *     query: '(max-width: 576px)',
   *     events: true,
   *     onenter: () => {}
   *   },
   *   {
   *     id: 'md',
   *     query: '(min-width: 768px) and (max-width: 992px)',
   *     onresize: () => {}
   *   }
   * ]);
   *
   * // mobile screen will emit events
   * qvp.on('mobile:oninit', () => {});
   * qvp.on('mobile:onenter', () => {});
   * qvp.on('mobile:onexit', () => {});
   * qvp.on('mobile:onresize', (screenX: number) => {})
   *
   * ```
   *
   * #
   *
   * ---
   *
   * ### Screen Events Only
   *
   * When you require global usage of QVP, you can specify a set of
   * event queries. This structure will inform QVP to emit events.
   *
   * ```ts
   *
   * import qvp from 'qvp'
   *
   * qvp.screens({
   *   xs: '(max-width: 576px)',
   *   md: '(min-width: 768px) and (max-width: 992px)'
   * });
   *
   * // xs events
   * qvp.on('xs:oninit', () => {});
   * qvp.on('xs:onenter', () => {});
   * qvp.on('xs:onexit', () => {});
   * qvp.on('xs:onresize', (screenX: number) => {})
   *
   * // md events
   * qvp.on('md:oninit', () => {});
   * qvp.on('md:onenter', () => {});
   * qvp.on('md:onexit', () => {});
   * qvp.on('md:onresize', (screenX: number) => {})
   *
   * ```
   *
   */
  (options: ViewportQueries | ViewportOptions | ViewportOptions[]): void;
  /**
   * The Viewports store
   *
   * Holds a reference to all states
   */
  viewports: Map<string, ReturnType<typeof create>>;
  /**
   * This method is deprecated, use the default import
   *
   * @example
   * import qvp from 'qvp';
   *
   * // 𐄂 No longer supported.
   * qvp.screens();
   *
   * // ✓ Define screens on the default
   * qvp()
   *
   * @deprecated
   */
  screens?: (options: any) => void;
  /**
   * Get Viewport
   *
   * Returns a viewport instance by its `id` else `false`
   */
  get: (id: string) => false | ReturnType<typeof create>;
  /**
   * Add Methods
   *
   * Add methods to be invoked in when the viewport is matched.
   */
  add: (id: string, actions: ViewportFunctions) => void;
  /**
   * Remove an event listener. You can remove events a couple of different
   * ways depending on how you've configured QVP.
   *
   * ---
   *
   * ### Removing all events by id
   *
   * To remove all events, pass the event name and all instances of the event
   * will be removed.
   *
   * ```ts
   *
   * qvp.off('id:method')
   *
   *
   * ```
   *
   * ### Remove event via callback
   *
   * You can pass the callback function of the event to remove occurances in
   * the listener store.
   *
   * ```ts
   *
   * // Your listeners may look like this:
   * const fooTablet = () => {}
   * const barTablet = () => {}
   *
   * qvp.on('table:onenter', fooTablet);
   * qvp.on('table:onenter', barTablet);
   *
   * // ...
   *
   * // To remove the fooTablet listener only:
   * qvp.off('tablet:onenter', fooTablet)
   *
   *
   * ```
   *
   * ### Remove event via instance reference
   *
   * The `qvp.on()` method returns an integer reference
   * of the event listener which can used to remove the event.
   *
   * ```ts
   * // The value of event holds a number reference
   * const event = qvp('desktop:onresize', () => {})
   *
   * // ...
   *
   * // Remove the listener
   * qvp.off(event)
   *
   *
   * ```
   */
  off: (name: EventNames, callback?: number | (() => void)) => void;
  /**
   * On Event
   *
   * Event listeners for media queries. Optionally provide a `scope` value to
   * bind to the callback function. Returns a `number` value which can
   * be used to dispose events via the `qvp.off()` method.
   *
   * @example
   *
  * import qvp from 'qvp';
  *
  * qvp.screens({
  *    mobile: '(min-width: 768px) and (max-width: 992px)'
  * })
  *
  * // This is an example of how QVP might be setup
  * //
  * class Component {
  *
  *   constructor () {
  *      this.value = 'Hello World!'
  *      this.event = qvp.on('mobile:onenter', this.method, this) // bind context to callback
  *   }
  *
  *   method () {
  *      console.log(this.value) // logs "Hello World!"
  *   }
  *
  *   disconnect () {
  *     qvp.off(this.event) // remove this event
  *   }
  * }
  *
  *
  */
  on: <T extends EventNames> (name: T, callback: EventFunctions<EventNames>, scope?: any) => void;
  /**
   * List Screens
   *
   * Returns a list of viewport screens from the store. Optionally
   * provide a `string[]` list of ids.
   */
  list: (ids?: string[]) => ViewportScreen[];
  /**
   * Check State
   *
   * Returns a `boolean` value informing on whether the provided
   * viewport id is active or not. When no `id` parameter is passed
   * a list of viewport screens which are active will be returned.
   */
  active: (id?: string) => boolean | ViewportScreen | ViewportScreen[];

  /**
   * Test viewport
   *
   * Test whether or not we are within a screen viewport. Accepts
   * a string with optional seperator character of screen ids or an array list.
   *
   * @example
   *
   * import viewport from 'qvp'
   *
   * // Define some screens
   * vp.screens([
   *   {
   *     id: 'sm',
   *     query: '(max-width: 576px)',
   *   },
   *   {
   *     id: 'md',
   *     query: '(min-width: 768px) and (max-width: 992px)'
   *   }
   * ]);
   *
   * // See if we are in viewport
   * if(viewport.test('xs,sm')) {
   *    console.log('screen size is within sm and xs range')
   * }
   */
  test: (screens: string | string[], separator?: string) => boolean;
  /**
   * Remove viewport query
   *
   * Removes and destroys the viewport screen and store with
   * the matching `id` provided.
   */
  remove: (id: string) => void;
  /**
   * Destroy
   *
   * Removes all instances and tears down the listeners.
   */
  destroy: () => void

} = function QVP (options: ViewportQueries | ViewportOptions | ViewportOptions[]) {

  if (Array.isArray(options)) return options.forEach(qvp);

  if (!('id' in options)) {

    for (const prop of [ 'onenter', 'onexit', 'oninit', 'onresize' ]) {
      if (prop in options) {
        throw new Error('qvp: Missing an "id" reference');
      }
    }

    return Object.entries(options).forEach(([ id, query ]) => {
      const type = typeof options[id];
      if (type === 'string') return qvp({ id, query });
      throw new TypeError(`qvp: Invalid query type. Expected "string" received "${type}"`);
    });

  }

  const state = create(options as ViewportOptions);
  const { id } = state.screen;

  if (!qvp.viewports.size) {

    addEventListener('resize', debounce(() => {
      qvp.viewports.forEach((viewport) => {
        if (viewport.screen.active) viewport.onresize(window.innerWidth);
      });
    }, 25), true);

  }

  if (!qvp.viewports.has(id)) {
    qvp.viewports.set(id, state);
  } else {
    console.warn(`qvp: The id "${id}" is already defined, use qvp.add() instead.`);
  }
};


{

  qvp.viewports = new Map();

  qvp.get = (id: string) => {

    return qvp.viewports.has(id) ? qvp.viewports.get(id) : false

  };

  qvp.add = (id: string, actions: ViewportFunctions) => {

    const vp = qvp.get(id);

    if (vp === false) return console.error(`qvp: There is no viewport using an id of "${id}"`);

    methods(actions as ViewportOptions, vp.screen);

    if (vp.screen.test.matches) vp.onenter();

  };

  qvp.off = (name: EventNames, callback?: number | (() => void)) => {

    const vp = qvp.get(name.split(':')[0]);

    if (vp === false) return;

    if (!(name in vp.events)) return;

    const size = vp.events[name].length;

    if (typeof callback === 'number') {

      if (callback <= size - 1) vp.events[name].splice(callback, 1);

    } else if (typeof callback === 'function') {

      const live = [];

      for (let i = 0; i < size; i++) if (vp.events[name][i] !== callback) live.push(vp.events[name][i]);

      if (live.length > 0) vp.events[name] = live;

    } else {

      delete vp.events[name];

    }
  };

  qvp.on = <T extends EventNames> (name: T, callback: EventFunctions<EventNames>, scope?: any) => {

    const [ id, fn ] = name.split(':');
    const vp = qvp.get(id);

    if (vp === false) return;
    if (!(name in vp.events)) vp.events[name] = [];

    const cb = scope ? callback.bind(scope) : callback;

    cb['qvp:event'] = vp.events[name].length;
    vp.events[name].push(cb);

    if (vp.screen.test.matches) {
      if (fn === 'oninit') {
        cb.call();
      } else {
        if (fn === 'onenter') cb.call();
        methods({ [fn]: cb }, vp.screen);
      }
    } else {
      methods({ [fn]: cb }, vp.screen);
    }

    return cb['qvp:event'];

  };

  qvp.list = (ids?: string[]) => {

    const items = Array.from(qvp.viewports.values()).map(({ screen }) => screen);

    return ids
      ? items.filter(({ id }) => ids.includes(id))
      : items;

  };

  qvp.active = (id?: string) => {

    const items = qvp.list();

    if (id) {
      const find = qvp.get(id);
      return find ? find.screen.active : false;
    }

    const filter = items.filter(({ active }) => active === true);

    return filter.length > 1 ? filter : filter[0];

  };

  qvp.test = (screens: string | string[], separator = ',') => {

    if (typeof screens === 'string') {
      return screens.indexOf(separator) > -1 ? screens.split(separator).some(qvp.active) : !!qvp.active(screens);
    }

    return screens.some(qvp.active);

  };

  qvp.remove = (id: string) => {

    if (qvp.viewports.has(id)) {
      qvp.viewports.get(id).destroy();
      qvp.viewports.delete(id);
    }

  };

  qvp.destroy = () => {

    removeEventListener('resize', debounce());

    qvp.viewports.forEach(vp => vp.destroy());
    qvp.viewports.clear();

  };

  qvp.screens = () => {

    throw Error('qvp: The qvp.screens() is deprecated, use the default import, e.g: qvp(...)')

  }
}


export default qvp

