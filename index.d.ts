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
    };
    /**
     * A method to fire when you enter the viewport.
     */
    onenter?: {
        (): void;
        /**
         * QVP Events callback functions determination property
         */
        'qvp:event'?: number;
    };
    /**
     * A method to fire when you leave the viewport.
     */
    onexit?: {
        (): void;
        /**
         * QVP Events callback functions determination property
         */
        'qvp:event'?: number;
    };
    /**
     * A method to fire upon screen resize
     */
    onresize?: {
        (screenX?: number): void;
        /**
         * QVP Events callback functions determination property
         */
        'qvp:event'?: number;
    };
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
    id: string;
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
    events: {
        [name: string]: Array<() => void>;
    };
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
declare type EventNames = (`${string}:oninit` | `${string}:onenter` | `${string}:onexit` | `${string}:onresize`);
declare type EventFunctions<T extends EventNames> = (
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
T extends `${string}:onresize` ? (screenX?: number) => void : never);
declare const qvp: {
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
    on: <T extends EventNames>(name: T, callback: EventFunctions<EventNames>, scope?: any) => void;
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
    destroy: () => void;
    /**
     * Touch
     *
     * Whether or not the current device is a touch device or not.
     */
    isTouch: boolean;
};
/**
 * Create
 *
 * Create viewport states
 */
declare function create(opts: ViewportOptions): {
    onenter: () => void;
    onexit: () => void;
    onresize: (x: number) => void;
    destroy: () => void;
    readonly screen: ViewportScreen;
    readonly events: {
        [name: string]: (() => void)[];
    };
};

export { qvp as default };
