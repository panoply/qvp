export interface ViewportFunctions {
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

export interface ViewportOptions extends ViewportFunctions {
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

export interface ViewportScreen {
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
