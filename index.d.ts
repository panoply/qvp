interface ViewportFunctions {
    /**
     * A method that runs when the viewport is first entered (triggered only once).
     */
    oninit?(): void;
    /**
     * A method to fire when you enter the viewport.
     */
    onenter?(): void;
    /**
     * A method to fire when you leave the viewport.
     */
    onexit?(): void;
    /**
     * A method to fire upon screen resize
     */
    onresize?(screenX?: number): void;
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
}
/**
 * The Viewports store
 *
 * Holds a reference to all states
 */
declare const viewports: Map<string, ReturnType<typeof create>>;
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
};
/**
 * Create Screens
 *
 * Define a set of viewports to match against. You can
 * optionally include methods or use `add` to set methods
 * at a later time.
 */
declare const screens: (options: ViewportOptions | ViewportOptions[]) => void;
/**
 * Get Viewport
 *
 * Returns a viewport instance by its `id` else `false`
 */
declare const get: (id: string) => false | {
    onenter: () => void;
    onexit: () => void;
    onresize: (x: number) => void;
    destroy: () => void;
    readonly screen: ViewportScreen;
};
/**
 * Add Methods
 *
 * Add methods to be invoked in when the viewport is matched.
 */
declare const add: (id: string, actions: ViewportFunctions) => void;
/**
 * List Screens
 *
 * Returns a list of viewport screens from the store. Optionally
 * provide a `string[]` list of ids.
 */
declare const list: (ids?: string[]) => ViewportScreen[];
/**
 * Check State
 *
 * Returns a `boolean` value informing on whether the provided
 * viewport id is active or not. When no `id` parameter is passed
 * a list of viewport screens which are active will be returned.
 */
declare const active: (id?: string) => boolean | ViewportScreen | ViewportScreen[];
/**
 * Test viewport
 *
 * Test whether or not we are within a screen viewport. Accepts
 * a string with optional seperator character of screen ids or an array list.
 *
 * @example
 *
 * import * as viewport from 'qvp'
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
declare const test: (screens: string | string[], separator?: string) => boolean;
/**
 * Remove viewport query
 *
 * Removes and destroys the viewport screen and store with
 * the matching `id` provided.
 */
declare const remove: (id: string) => void;
/**
 * Destroy
 *
 * Removes all instances and tears down the listeners.
 */
declare const destroy: () => void;

export { active, add, destroy, get, list, remove, screens, test, viewports };
