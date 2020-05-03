const isIntersecting = ({isIntersecting}) => isIntersecting;

const tagName = 'lazy-image';
const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: inline-block;
      position: relative;
    }
    #image,
    #placeholder ::slotted(*) {
      display: block;
      transition:
        opacity
        var(--lazy-image-fade-duration, 0.3s)
        var(--lazy-image-fade-easing, ease);
      object-fit: var(--lazy-image-fit, contain);
      height: var(--lazy-image-height, auto);
      width: var(--lazy-image-width, auto);
    }
    :host([fade]) #placeholder:not([aria-hidden="true"]) ::slotted(*),
    :host([fade]) #image:not([aria-hidden="true"]) {
      opacity: 1;
    }
    :host([fade]) #image,
    :host([fade]) #placeholder[aria-hidden="true"] ::slotted(*) {
      opacity: 0;
    }
  </style>
  <div id="placeholder" aria-hidden="false">
    <slot name="placeholder"></slot>
  </div>
  <img id="image" aria-hidden="true"/>
`;

/* istanbul ignore next */
if (window.ShadyCSS) window.ShadyCSS.prepareTemplate(template, tagName);

export class GcpImg extends HTMLElement {
  /**
   * Guards against loops when reflecting observed attributes.
   * @param  {String} name Attribute name
   * @param  {any} value
   * @protected
   */
  safeSetAttribute(name, value) {
    if (this.getAttribute(name) !== value) this.setAttribute(name, value);
  }

  static get observedAttributes() {
    return ['src', 'alt', 'size'];
  }

  /**
   * Image URI.
   * @type {String}
   */
  set src(value) {
    this.safeSetAttribute('src', value);
    if (this.intersecting) this.loadImage();
  }

  get src() {
    return this.getAttribute('src');
  }

  /**
   * Image alt-text.
   * @type {String}
   */
  set alt(value) {
    this.safeSetAttribute('alt', value);
    this.shadowImage.alt = value;
  }

  get alt() {
    return this.getAttribute('alt');
  }

  /**
   * Image size.
   * @type {String}
   */
  set size(value) {
    this.safeSetAttribute('size', value);
    this.shadowImage.size = value;
    this.src = this.getAttribute('src');
  }

  get size() {
    return this.getAttribute('size');
  }

  /**
   * Gets the sizes attribute.
   * @type {Boolean}
   */
  get sizes() {
    return this.hasAttribute('sizes');
  }

  set sizes(v) {}

  /**
   * Gets the Cache Time to live attribute.
   * @type {Boolean}
   */
  get ttl() {
    return this.hasAttribute('ttl');
  }

  set ttl(v) {}

  /**
   * Whether the element is on screen.
   * @type {Boolean}
   */
  get intersecting() {
    return this.hasAttribute('intersecting');
  }

  set intersecting(v) {}

  constructor() {
    super();
    this.observerCallback = this.observerCallback.bind(this);
    this.loadImage = this.loadImage.bind(this);
    this.onLoad = this.onLoad.bind(this);
    this.onError = this.onError.bind(this);
    this.attachShadow({mode: 'open'});
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.shadowImage = this.shadowRoot.getElementById('image');
    this.shadowImage.onload = this.onLoad;
    this.shadowImage.onerror = this.onError;
    this.shadowPlaceholder = this.shadowRoot.getElementById('placeholder');
    this.extraProperties = '';
    // TODO: Implement Network Aware Detection to change this value
    this.isConnectionFast = true;
  }

  connectedCallback() {
    this.src = this.getAttribute('src');
    this.alt = this.getAttribute('alt') || '';
    this.size = this.getAttribute('size');
    this.placeholder = this.getAttribute('placeholder');
    this.getProperties_()
    this.updateShadyStyles();
    if ('IntersectionObserver' in window) this.initIntersectionObserver();
    else this.loadImage();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    this[name] = newVal;
  }

  disconnectedCallback() {
    this.disconnectObserver();
  }

  /**
   * Sets the intersecting attribute and reload styles if the polyfill is at play.
   */
  loadImage() {
    const hasSources = this.hasAttribute('sizes');
    const hasSize = this.hasAttribute('size');
    const size = (hasSize) ? `=s${this.size}` : '';
    const separator = (hasSize) ? '-' : '=';
    const extra = this.extraProperties;

    this.setAttribute('intersecting', '');
    this.shadowImage.src = `${this.src}${size}${separator}${extra}`;

    if (hasSources) {
      this.shadowImage.srcset = this.getMediaSources_();
    }
  }

  onLoad(event) {
    this.dispatchEvent(new CustomEvent('loadend', {detail: {success: true}}));
    this.shadowImage.removeAttribute('aria-hidden');
    this.shadowPlaceholder.setAttribute('aria-hidden', 'true');
    this.disconnectObserver();
    this.updateShadyStyles();
  }

  onError(event) {
    this.dispatchEvent(new CustomEvent('loadend', {detail: {success: false}}));
  }

  /**
   * Return image srcset sttribute.
   */
  getMediaSources_() {
    if (!this.getAttribute('sizes')) {
      return;
    }

    const extra = this.extraProperties;
    const sizesAttribute = this.getAttribute('sizes');
    const sizesAdjusted = sizesAttribute.replace(/'/g, '"');
    const sizes = JSON.parse(sizesAdjusted);
    const imgSource = this.src;
    let sourcesArray = [];

    for (const key in sizes) {
      if (sizes.hasOwnProperty(key)) {
        const sourceSet = sizes[key];
        const screen = sourceSet.screen;
        const size = sourceSet.size;
        const source = sourceSet.source;
        const imgUrl = (source) ? source : imgSource;

        if (screen && size) {
          sourcesArray.push(`${imgUrl}=s${size}-${extra} ${screen}w`);
        }
      }
    }

    return sourcesArray.join(',');
  }

  /**
   * Returns the propeties string.
   */
  getProperties_() {
    const quality = this.isConnectionFast ? 'v1' : 'v2';
    const cacheDays = this.getAttribute('ttl');
    const ttl = (cacheDays) ? `e${cacheDays}` : 'e365';
    let props = [];

    props.push(quality);
    props.push(ttl);

    this.extraProperties = props.join('-');
  }

  /**
   * When the polyfill is at play, ensure that styles are updated.
   * @protected
   */
  updateShadyStyles() {
    /* istanbul ignore next */
    if(window.ShadyCSS) {
      window.ShadyCSS.styleElement(this);
    }
  }

  /**
   * Sets the `intersecting` property when the element is on screen.
   * @param  {[IntersectionObserverEntry]} entries
   * @protected
   */
  observerCallback(entries) {
    if (entries.some(isIntersecting)) {
      this.loadImage();
    }
  }

  /**
   * Initializes the IntersectionObserver when the element instantiates.
   * @protected
   */
  initIntersectionObserver() {
    /* istanbul ignore if */
    if (this.observer) {
      return;
    }

    const rootMargin = '10px';

    this.observer =
      new IntersectionObserver(this.observerCallback, { rootMargin });
    this.observer.observe(this);
  }


  /**
   * Disconnects and unloads the IntersectionObserver.
   * @protected
   */
  disconnectObserver() {
    if (!this.observer) {
      return;
    };

    this.observer.disconnect();
    this.observer = null;
    delete this.observer;
  }
}