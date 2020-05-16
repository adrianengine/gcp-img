const observerIsIntersecting = ({ isIntersecting }) => isIntersecting;

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
      height: var(--lazy-image-height, auto);
      transition:
        opacity
        var(--lazy-image-fade-duration, 1s)
        var(--lazy-image-fade-easing, ease-out);
      object-fit: var(--lazy-image-fit, contain);
      width: var(--lazy-image-width, auto);
    }

    #placeholder ::slotted(*) {
      height: 100%;
      left: 0;
      position: absolute;
      top: 0;
      width: 100%;
    }

    :host([fade]) #placeholder:not([aria-hidden="true"]) ::slotted(*),
    :host([fade]) #image:not([aria-hidden="true"]) {
      opacity: 1;
      visibility: visible;
    }

    :host([fade]) #image,
    :host([fade]) #placeholder[aria-hidden="true"] ::slotted(*) {
      opacity: 0;
      visibility: hidden;
    }
  </style>
  <div id="placeholder" aria-hidden="false">
    <slot name="placeholder"></slot>
  </div>
  <img id="image" loading="lazy" aria-hidden="true"/>
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
    return [
      'src',
      'alt',
      'size',
      'rotate',
      'flip',
      'filter',
      'radius',
      'color',
    ];
  }

  /**
   * Image URI.
   * @type {String}
   */
  set src(value) {
    this.safeSetAttribute('src', value);

    if (this.intersecting) {
      this.loadImage();
    }
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

  set sizes(val) {
    return this.sizes;
  }

  /**
   * Gets the Cache Time to live attribute.
   * @type {Boolean}
   */
  get ttl() {
    return this.hasAttribute('ttl');
  }

  set ttl(val) {
    return this.val;
  }

  /**
   * Sets the Rotate attribute.
   * @type {Boolean}
   */
  set rotate(value) {
    this.safeSetAttribute('rotate', value);
    this.shadowImage.rotate = value;
  }

  get rotate() {
    return this.getAttribute('rotate');
  }

  /**
   * Sets the Flip attribute.
   * @type {Boolean}
   */
  set flip(value) {
    this.safeSetAttribute('flip', value);
    this.shadowImage.flip = value;
  }

  get flip() {
    return this.getAttribute('flip');
  }

  /**
   * Sets the filter attribute.
   * @type {Boolean}
   */
  set filter(value) {
    this.safeSetAttribute('filter', value);
    this.shadowImage.filter = value;
  }

  get filter() {
    return this.getAttribute('filter');
  }

  /**
   * Sets the filter radius attribute.
   * @type {Boolean}
   */
  set radius(value) {
    this.safeSetAttribute('radius', value);
    this.shadowImage.radius = value;
  }

  get radius() {
    return this.getAttribute('radius');
  }

  /**
   * Sets the filter vignnete color attribute.
   * @type {Boolean}
   */
  set color(value) {
    this.safeSetAttribute('color', value);
    this.shadowImage.color = value;
  }

  get color() {
    return this.getAttribute('color');
  }

  /**
   * Whether the element is on screen.
   * @type {Boolean}
   */
  get intersecting() {
    return this.hasAttribute('intersecting');
  }

  set intersecting(val) {
    return this.intersecting;
  }

  constructor() {
    super();
    this.observerCallback = this.observerCallback.bind(this);
    this.loadImage = this.loadImage.bind(this);
    this.onLoad = this.onLoad.bind(this);
    this.onError = this.onError.bind(this);
    this.attachShadow({ mode: 'open' });
    this.applyTemplate();
    this.extraProperties = '';
    // TODO: Implement Network Aware Detection to change this value
    this.isConnectionFast = true;
  }

  applyTemplate() {
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.shadowImage = this.shadowRoot.getElementById('image');
    this.shadowImage.onload = this.onLoad;
    this.shadowImage.onerror = this.onError;
    this.shadowPlaceholder = this.shadowRoot.getElementById('placeholder');
  }

  connectedCallback() {
    this.src = this.getAttribute('src');
    this.alt = this.getAttribute('alt') || '';
    this.size = this.getAttribute('size');
    this.rotate = this.getAttribute('rotate');
    this.flip = this.getAttribute('flip');
    this.filter = this.getAttribute('filter');
    this.radius = this.getAttribute('radius');
    this.color = this.getAttribute('color');
    this.placeholder = this.getAttribute('placeholder');
    this.getProperties_();
    this.updateShadyStyles();

    if ('IntersectionObserver' in window) {
      this.initIntersectionObserver();
    } else {
      this.loadImage();
    }
  }

  attributeChangedCallback(name, oldVal, newVal) {
    this[name] = newVal;
    this.getProperties_();
    this.src = this.getAttribute('src');
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
    const size = hasSize ? `=w${this.size}` : '';
    const separator = hasSize ? '-' : '=';
    const extra = this.extraProperties;

    this.setAttribute('intersecting', '');
    this.shadowImage.src = `${this.src}${size}${separator}${extra}`;

    if (hasSources) {
      this.shadowImage.srcset = this.getMediaSources_();
    }
  }

  onLoad() {
    this.dispatchEvent(
      new CustomEvent('loadend', { detail: { success: true } })
    );
    this.shadowImage.removeAttribute('aria-hidden');
    this.shadowPlaceholder.setAttribute('aria-hidden', 'true');
    this.disconnectObserver();
    this.updateShadyStyles();
  }

  onError() {
    this.dispatchEvent(
      new CustomEvent('loadend', { detail: { success: false } })
    );
  }

  /**
   * Return image srcset sttribute.
   * @return {Array}
   */
  getMediaSources_() {
    if (!this.getAttribute('sizes')) {
      return false;
    }

    const extra = this.extraProperties;
    const sizesAttribute = this.getAttribute('sizes');
    const sizesAdjusted = sizesAttribute.replace(/'/g, '"');
    const sizes = JSON.parse(sizesAdjusted);
    const imgSource = this.src;
    const sourcesArray = [];
    const sizeValues = Object.values(sizes);

    for (const key of sizeValues) {
      const { screen, size, source } = key;
      const imgUrl = source || imgSource;

      if (screen && size) {
        sourcesArray.push(`${imgUrl}=w${size}-${extra} ${screen}w`);
      }
    }

    return sourcesArray.join(',');
  }

  /**
   * Returns a valid filter radius number.
   * @returns {number}
   */
  normalizeFilterRadius_() {
    if (!this.getAttribute('radius')) {
      return 0;
    }

    const radius = this.getAttribute('radius');
    const radiusVal = parseInt(radius, 10);

    if (radiusVal >= 0 && radiusVal <= 100) {
      return radiusVal;
    }

    if (radiusVal > 100) {
      return 100;
    }

    return 0;
  }

  /**
   * Returns a valid vignette radius number.
   * @returns {string}
   */
  normalizeVignetteColor_() {
    if (!this.getAttribute('color')) {
      return '000000';
    }

    const vignetteColor = this.getAttribute('color');
    const captureHexColor = /[0-9A-Fa-f]{6}\b/;
    const isValidColor = vignetteColor.match(captureHexColor);

    if (isValidColor) {
      return vignetteColor.toUpperCase();
    }

    return '000000';
  }

  /**
   * Returns the propeties string.
   */
  getProperties_() {
    const page = document.querySelector('html');
    const quality = this.isConnectionFast ? 'v1' : 'v2';
    const cacheDays = this.getAttribute('ttl');
    const rotation = this.getAttribute('rotate');
    const flip = this.getAttribute('flip');
    const filter = this.getAttribute('filter');
    const radius = this.normalizeFilterRadius_();
    const vignetteColor = this.normalizeVignetteColor_();
    const ttl = cacheDays ? `e${cacheDays}` : 'e365';
    const supportsWebP = page.classList.contains('webp');
    const props = [];

    const filterTypes = {
      blur: `fSoften=1,${radius},0`,
      vignette: `fVignette=1,${radius},1.4,0,${vignetteColor}`,
      invert: 'fInvert=0',
      bw: 'fbw=0',
    };

    props.push(quality);
    props.push(ttl);

    if (supportsWebP) {
      props.push('rw');
    }

    if (rotation) {
      props.push(`r${rotation}`);
    }

    if (flip === 'h' || flip === 'v') {
      props.push(`f${flip}`);
    }

    if (filterTypes[filter]) {
      props.push(filterTypes[filter]);
    }

    this.extraProperties = props.join('-');
  }

  /**
   * When the polyfill is at play, ensure that styles are updated.
   * @protected
   */
  updateShadyStyles() {
    /* istanbul ignore next */
    if (window.ShadyCSS) {
      window.ShadyCSS.styleElement(this);
    }
  }

  /**
   * Sets the `intersecting` property when the element is on screen.
   * @param  {[IntersectionObserverEntry]} entries
   * @protected
   */
  observerCallback(entries) {
    if (entries.some(observerIsIntersecting)) {
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

    this.observer = new IntersectionObserver(this.observerCallback, {
      rootMargin,
    });

    this.observer.observe(this);
  }

  /**
   * Disconnects and unloads the IntersectionObserver.
   * @protected
   */
  disconnectObserver() {
    if (!this.observer) {
      return;
    }

    this.observer.disconnect();
    this.observer = null;
    delete this.observer;
  }
}
