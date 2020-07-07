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
      'fixed',
      'play',
    ];
  }

  /**
   * Image URI.
   * @param {String} value
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
   * @param {String} value
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
   * @param {String} value
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
   * @param {String} value
   * @type {String}
   */
  set size(value) {
    const hasFixedAttribute = this.hasAttribute('fixed');

    this.safeSetAttribute('size', value);

    if (value) {
      const size = value.split(',');

      [this.wDimension, this.hDimension] = size;

      if (size.length === 1) {
        [this.hDimension] = size;
      }

      this.shadowImage.height = this.hDimension;
      this.shadowImage.width = this.wDimension;
    }

    if (hasFixedAttribute) {
      this.setAttribute('fixed', '');
    }
  }

  get size() {
    return this.getAttribute('size');
  }

  /**
   * Sets the config attribute.
   * @param {String} val
   * @type {String}
   */
  set config(val) {
    return this.val;
  }

  get config() {
    const config = this.getAttribute('config');
    const configCorrected = config.replace(/'/g, '"');
    const configParsed = JSON.parse(configCorrected);

    return configParsed;
  }

  /**
   * Gets the Cache Time to live attribute.
   * @type {Number}
   */
  get ttl() {
    return this.hasAttribute('ttl');
  }

  set ttl(val) {
    return this.val;
  }

  /**
   * Sets the Rotate attribute.
   * @param {String} value
   * @type {String}
   */
  set rotate(value) {
    this.safeSetAttribute('rotate', value);
  }

  get rotate() {
    return this.getAttribute('rotate');
  }

  /**
   * Sets the Flip attribute.
   * @param {String} value
   * @type {String}
   */
  set flip(value) {
    this.safeSetAttribute('flip', value);
  }

  get flip() {
    return this.getAttribute('flip');
  }

  /**
   * Sets the filter attribute.
   * @param {String} value
   * @type {String}
   */
  set filter(value) {
    this.safeSetAttribute('filter', value);
  }

  get filter() {
    return this.getAttribute('filter');
  }

  /**
   * Sets the filter radius attribute.
   * @param {Number} value
   * @type {Number}
   */
  set radius(value) {
    this.safeSetAttribute('radius', value);
  }

  get radius() {
    return this.getAttribute('radius');
  }

  /**
   * Sets the filter vignnete color attribute.
   * @param {String} value
   * @type {String}
   */
  set color(value) {
    this.safeSetAttribute('color', value);
  }

  get color() {
    return this.getAttribute('color');
  }

  /**
   * Sets the crop attribute.
   * @param {String} value
   * @type {String}
   */
  set crop(value) {
    this.safeSetAttribute('crop', value);
  }

  get crop() {
    return this.getAttribute('crop');
  }

  /**
   * Gets the Fixed attribute.
   * @type {Boolean}
   */
  get fixed() {
    return this.hasAttribute('fixed');
  }

  set fixed(val) {
    const hasFixedAttribute = this.hasAttribute('fixed');
    const hasMultipleSources = this.hasAttribute('config');

    if (hasFixedAttribute && !hasMultipleSources) {
      this.setAttribute(
        'style',
        `--gcp-image-height:${this.hDimension}px;` +
          `--gcp-image-width:${this.wDimension}px;`
      );
    } else {
      this.removeAttribute('style');
    }
  }

  /**
   * Sets the play attribute.
   * @param {any} value
   * @type {Boolean}
   */
  set play(value) {
    this.safeSetAttribute('play', value);
  }

  get play() {
    return this.hasAttribute('play');
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
    this.setConnectionQuality();
    this.extraProperties = '';
  }

  /**
   * Detects and set the connection fast variable.
   * @protected
   */
  setConnectionQuality() {
    if (navigator.connection && navigator.connection.effectiveType) {
      this.isConnectionFast = navigator.connection.effectiveType === '4g';
    } else {
      this.isConnectionFast = true;
    }
  }

  /**
   * Builds the Image Template.
   * @protected
   */
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

  /**
   * Builds the Placeholder template.
   * @protected
   */
  setTemplatePlaceholder() {
    const placeholder = document.createElement('div');
    const slot = document.createElement('slot');

    placeholder.id = 'placeholder';
    placeholder.ariaHidden = 'true';
    slot.name = 'placeholder';

    placeholder.appendChild(slot);

    this.templatePlaceholder = placeholder;
  }

  /**
   * Defines the Template CSS Style Tag.
   * @protected
   */
  setTemplateStyles() {
    const styleRules = document.createElement('style');
    const rules = `
      :host {
        display: block;
        position: relative;
        width: var(--gcp-image-width, 100%);
      }

      #picture {
        display: contents;
      }

      #image,
      #placeholder ::slotted(*) {
        border: none;
        display: block;
        height: var(--gcp-image-height, 100%);
        overflow: hidden;
        transition:
          opacity
          var(--gcp-image-fade-duration, 0.3s)
          var(--gcp-image-fade-easing, ease);
        width: var(--gcp-image-width, 100%);
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

  /**
   * Builds the custom element template.
   * @protected
   */
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

  /**
   *
   */
  applyTemplate() {
    this.shadowRoot.appendChild(this.template.content.cloneNode(true));
    this.shadowImage = this.shadowRoot.getElementById('image');
    this.shadowImage.onload = this.onLoad;
    this.shadowImage.onerror = this.onError;
    this.shadowPlaceholder = this.shadowRoot.getElementById('placeholder');
    this.shadowPicture = this.shadowRoot.getElementById('picture');
    this.shadowSourceTags = new DocumentFragment();
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
    this.fixed = this.getAttribute('fixed');
    this.play = this.getAttribute('play');
    this.setProperties();
    this.updateShadyStyles();
    this.applyChanges();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    this[name] = newVal;
    this.setProperties();
    this.clearPictureSources();
    this.applyChanges();
  }

  disconnectedCallback() {
    this.disconnectObserver();
  }

  /**
   * Sets the source tags for a single image.
   * @protected
   */
  setSingleSource() {
    const hasSize = this.hasAttribute('size');
    const hasDarkSource = this.hasAttribute('darksrc');
    const webpSource = document.createElement('source');
    const size = hasSize ? `=w${this.wDimension}` : '';
    const separator = hasSize ? '-' : '=';
    const extra = this.extraProperties;

    webpSource.srcset = this.shadowImage.src.replace('-nw', '-rw');
    webpSource.type = 'image/webp';

    this.shadowSourceTags.prepend(webpSource);

    if (hasDarkSource) {
      const darkSourceTag = document.createElement('source');
      const darkWebpSourceTag = document.createElement('source');

      darkSourceTag.srcset = `${this.getAttribute(
        'darksrc'
      )}${size}${separator}${extra}`;
      darkSourceTag.media = '(prefers-color-scheme: dark)';

      this.shadowSourceTags.prepend(darkSourceTag);

      darkWebpSourceTag.srcset = darkSourceTag.srcset.replace('-nw', '-rw');
      darkWebpSourceTag.media = '(prefers-color-scheme: dark)';
      darkWebpSourceTag.type = 'image/webp';

      this.shadowSourceTags.prepend(darkWebpSourceTag);
    }

    this.shadowPicture.prepend(this.shadowSourceTags);
  }

  /**
   * Removes source tags inside the picture element.
   * @protected
   */
  clearPictureSources() {
    while (this.shadowPicture.hasChildNodes()) {
      if (this.shadowPicture.firstChild instanceof HTMLSourceElement) {
        this.shadowPicture.removeChild(this.shadowPicture.firstChild);
      } else {
        break;
      }
    }
  }

  applyChanges() {
    this.src = this.getAttribute('src');

    if ('IntersectionObserver' in window) {
      this.initIntersectionObserver();
    } else {
      this.loadImage();
    }
  }

  /**
   * Sets the intersecting attribute and reload styles if the polyfill is at play.
   * @protected
   */
  loadImage() {
    const hasConfig = this.hasAttribute('config');
    const hasSize = this.hasAttribute('size');
    const size = hasSize ? `=w${this.wDimension}` : '';
    const separator = hasSize ? '-' : '=';
    const extra = this.extraProperties;

    this.setAttribute('intersecting', '');
    this.shadowImage.src = `${this.src}${size}${separator}${extra}`;

    if (hasConfig) {
      this.setMediaSourceSets();
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
   * @protected
   */
  setMediaSourceSets() {
    const extra = this.extraProperties;
    const imgSource = this.src;
    const sourcesArray = [];
    const darkSourcesArray = [];
    const darkWebpSourcesArray = [];
    const webpSourcesArray = [];
    const configValues = Object.values(this.config);
    const darkSourceTag = document.createElement('source');
    const darkWebpSourceTag = document.createElement('source');
    const webpSourceTag = document.createElement('source');
    const darkModeMediaQuery = '(prefers-color-scheme: dark)';
    let hasDarkSource = false;

    for (const key of configValues) {
      const { screen, size, source, dark } = key;
      const imgUrl = source || imgSource;

      if (screen && size) {
        const sourcePath = `${imgUrl}=w${size}-${extra} ${screen}w`;
        const webpSourcePath = sourcePath.replace('-nw', '-rw');

        sourcesArray.push(sourcePath);
        webpSourcesArray.push(webpSourcePath);

        if (dark) {
          const darkSourcePath = `${dark}=w${size}-${extra} ${screen}w`;
          const darkWebpSourcePath = darkSourcePath.replace('-nw', '-rw');

          darkSourcesArray.push(darkSourcePath);
          darkWebpSourcesArray.push(darkWebpSourcePath);

          hasDarkSource = true;
        } else {
          darkSourcesArray.push(sourcePath);
          darkWebpSourcesArray.push(webpSourcePath);
        }
      }
    }

    webpSourceTag.srcset = webpSourcesArray.join(',');
    webpSourceTag.type = 'image/webp';

    darkSourceTag.srcset = darkSourcesArray.join(',');
    darkSourceTag.media = darkModeMediaQuery;

    darkWebpSourceTag.srcset = darkWebpSourcesArray.join(',');
    darkWebpSourceTag.media = darkModeMediaQuery;
    darkWebpSourceTag.type = 'image/webp';

    this.shadowSourceTags.prepend(webpSourceTag);

    if (hasDarkSource) {
      this.shadowSourceTags.prepend(darkSourceTag);
      this.shadowSourceTags.prepend(darkWebpSourceTag);
    }

    this.shadowPicture.prepend(this.shadowSourceTags);
    this.shadowImage.srcset = sourcesArray.join(',');
  }

  /**
   * Sets the extra properties attribute.
   * @protected
   */
  setProperties() {
    const quality = this.isConnectionFast ? 'v1' : 'v3';
    const cacheDays = this.getAttribute('ttl');
    const rotation = this.getAttribute('rotate');
    const flip = this.getAttribute('flip');
    const filter = this.getAttribute('filter');
    const radius = this.normalizeFilterRadius_();
    const vignetteColor = this.normalizeVignetteColor_();
    const crop = this.getAttribute('crop');
    const play = this.hasAttribute('play');
    const ttl = cacheDays ? `e${cacheDays}` : 'e365';
    const noWebp = 'nw';
    const killAnimation = 'k';
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

    if (!play) {
      props.push(killAnimation);
    }

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

  /**
   * Returns a valid filter radius number.
   * @returns {number}
   * @private
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
   * @private
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
}
