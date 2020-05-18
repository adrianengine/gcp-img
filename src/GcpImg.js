const observerIsIntersecting = ({ isIntersecting }) => isIntersecting;

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
      'darksrc',
      'alt',
      'size',
      'rotate',
      'flip',
      'filter',
      'radius',
      'color',
      'crop',
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
   * Image URI.
   * @type {String}
   */
  set darksrc(value) {
    this.safeSetAttribute('darksrc', value);
  }

  get darksrc() {
    return this.getAttribute('darksrc');
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
  }

  get color() {
    return this.getAttribute('color');
  }

  /**
   * Sets the crop attribute.
   * @type {Boolean}
   */
  set crop(value) {
    this.safeSetAttribute('crop', value);
  }

  get crop() {
    return this.getAttribute('crop');
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
    this.createTemplate();
    this.applyTemplate();
    this.extraProperties = '';
    // TODO: Implement Network Aware Detection to change this value
    this.isConnectionFast = true;
  }

  setTemplateImage() {
    const pic = document.createElement('picture');
    const img = new Image();

    img.id = 'image';
    img.loading = 'lazy';
    img.ariaHidden = 'true';
    pic.id = 'picture';
    pic.appendChild(img);

    this.templateImage = pic;
  }

  setTemplatePlaceholder() {
    const placeholder = document.createElement('div');
    const slot = document.createElement('slot');

    placeholder.id = 'placeholder';
    placeholder.ariaHidden = 'true';
    slot.name = 'placeholder';

    placeholder.appendChild(slot);

    this.templatePlaceholder = placeholder;
  }

  setTemplateStyles() {
    const styleRules = document.createElement('style');
    const rules = `
      :host {
        display: inline-block;
        position: relative;
      }

      #picture {
        display: contents;
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
    `;

    styleRules.appendChild(document.createTextNode(rules));

    this.templateStyles = styleRules;
  }

  createTemplate() {
    const tagName = 'gcp-img';
    const template = document.createElement('template');

    this.setTemplateStyles();
    this.setTemplatePlaceholder();
    this.setTemplateImage();

    template.content.appendChild(this.templateStyles);
    template.content.appendChild(this.templatePlaceholder);
    template.content.appendChild(this.templateImage);

    this.template = template;

    /* istanbul ignore next */
    if (window.ShadyCSS) window.ShadyCSS.prepareTemplate(template, tagName);
  }

  applyTemplate() {
    this.shadowRoot.appendChild(this.template.content.cloneNode(true));
    this.shadowImage = this.shadowRoot.getElementById('image');
    this.shadowImage.onload = this.onLoad;
    this.shadowImage.onerror = this.onError;
    this.shadowPlaceholder = this.shadowRoot.getElementById('placeholder');
    this.shadowPicture = this.shadowRoot.getElementById('picture');
  }

  connectedCallback() {
    this.src = this.getAttribute('src');
    this.darksrc = this.getAttribute('darksrc');
    this.alt = this.getAttribute('alt') || '';
    this.size = this.getAttribute('size');
    this.rotate = this.getAttribute('rotate');
    this.flip = this.getAttribute('flip');
    this.filter = this.getAttribute('filter');
    this.radius = this.getAttribute('radius');
    this.color = this.getAttribute('color');
    this.crop = this.getAttribute('crop');
    this.placeholder = this.getAttribute('placeholder');
    this.setProperties_();
    this.updateShadyStyles();

    if ('IntersectionObserver' in window) {
      this.initIntersectionObserver();
    } else {
      this.loadImage();
    }
  }

  attributeChangedCallback(name, oldVal, newVal) {
    this[name] = newVal;
    this.setProperties_();
    this.src = this.getAttribute('src');
  }

  disconnectedCallback() {
    this.disconnectObserver();
  }

  setSingleSource() {
    const hasSize = this.hasAttribute('size');
    const hasDarkSource = this.hasAttribute('darksrc');
    const webpSource = document.createElement('source');
    const size = hasSize ? `=w${this.size}` : '';
    const separator = hasSize ? '-' : '=';
    const extra = this.extraProperties;
    const sourcesFragment = new DocumentFragment();

    webpSource.srcset = this.shadowImage.src.replace('-nw', '-rw');
    webpSource.type = 'image/webp';

    sourcesFragment.prepend(webpSource);

    if (hasDarkSource) {
      const darkSourceTag = document.createElement('source');
      const darkWebpSourceTag = document.createElement('source');

      darkSourceTag.srcset = `${this.getAttribute(
        'darksrc'
      )}${size}${separator}${extra}`;
      darkSourceTag.media = '(prefers-color-scheme: dark)';

      sourcesFragment.prepend(darkSourceTag);

      darkWebpSourceTag.srcset = darkSourceTag.srcset.replace('-nw', '-rw');
      darkWebpSourceTag.media = '(prefers-color-scheme: dark)';
      darkWebpSourceTag.type = 'image/webp';

      sourcesFragment.prepend(darkWebpSourceTag);
    }

    this.shadowPicture.prepend(sourcesFragment);
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
      this.setMediaSourceSets_();
    } else {
      this.setSingleSource();
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
   * Set the image srcset sttribute.
   */
  setMediaSourceSets_() {
    const extra = this.extraProperties;
    const sizesAttribute = this.getAttribute('sizes');
    const sizesAdjusted = sizesAttribute.replace(/'/g, '"');
    const sizes = JSON.parse(sizesAdjusted);
    const imgSource = this.src;
    const sourcesArray = [];
    const sizeValues = Object.values(sizes);
    const sourcesFragment = new DocumentFragment();

    for (const key of sizeValues) {
      const { screen, size, source, dark } = key;
      const imgUrl = source || imgSource;

      if (screen && size) {
        const webpSourceTag = document.createElement('source');

        sourcesArray.push(`${imgUrl}=w${size}-${extra} ${screen}w`);

        webpSourceTag.srcset = `${imgUrl}=w${size}-${extra}`.replace(
          '-nw',
          '-rw'
        );
        webpSourceTag.media = `(min-width: ${screen}px)`;
        webpSourceTag.type = 'image/webp';

        sourcesFragment.prepend(webpSourceTag);
      }

      if (dark && screen && size) {
        const darkSourceTag = document.createElement('source');
        const darkWebpSourceTag = document.createElement('source');
        const mediaQuery = `(prefers-color-scheme: dark) and (min-width: ${screen}px)`;

        darkSourceTag.srcset = `${dark}=w${size}-${extra}`;
        darkSourceTag.media = mediaQuery;

        sourcesFragment.prepend(darkSourceTag);

        darkWebpSourceTag.srcset = darkSourceTag.srcset.replace('-nw', '-rw');
        darkWebpSourceTag.media = mediaQuery;
        darkWebpSourceTag.type = 'image/webp';

        sourcesFragment.prepend(darkWebpSourceTag);
      }
    }

    this.shadowPicture.prepend(sourcesFragment);
    this.shadowImage.srcset = sourcesArray.join(',');
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
   * Sets the extra properties attribute.
   */
  setProperties_() {
    const quality = this.isConnectionFast ? 'v1' : 'v2';
    const cacheDays = this.getAttribute('ttl');
    const rotation = this.getAttribute('rotate');
    const flip = this.getAttribute('flip');
    const filter = this.getAttribute('filter');
    const radius = this.normalizeFilterRadius_();
    const vignetteColor = this.normalizeVignetteColor_();
    const crop = this.getAttribute('crop');
    const ttl = cacheDays ? `e${cacheDays}` : 'e365';
    const noWebp = 'nw';
    const props = [];

    const filterTypes = {
      blur: `fSoften=1,${radius},0`,
      vignette: `fVignette=1,${radius},1.4,0,${vignetteColor}`,
      invert: 'fInvert=0',
      bw: 'fbw=0',
    };

    const cropTypes = {
      circular: 'cc',
      smart: 'pp',
    };

    props.push(quality);
    props.push(ttl);
    props.push(noWebp);

    if (rotation) {
      props.push(`r${rotation}`);
    }

    if (flip === 'h' || flip === 'v') {
      props.push(`f${flip}`);
    }

    if (cropTypes[crop]) {
      props.push(cropTypes[crop]);
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
