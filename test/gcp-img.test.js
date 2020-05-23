import { fixture, expect, aTimeout, elementUpdated } from '@open-wc/testing';

import '../gcp-img.js';

const defaultProps = {
  quality: 'v1',
  ttl: 'e365',
  nowebp: 'nw',
};

const props = Object.values(defaultProps).join('-');

// eslint-disable-next-line max-len
const imgURL =
  'https://lh3.googleusercontent.com/YXPVsT8M2Z1N5lJa4L1HNaytl5YnrH452QC_bUdmOP3iyfK8wgJ2GFsTbaQ7Ha8F5XDD8yKSYDORksuJqrDBpzr6ZV8aJ151SMND';

const imgAltURL =
  'https://lh3.googleusercontent.com/xS2eiv5_nOEX8SL_l3JLL9HaIpprRo8JFoEud4OI7TUNJuoPnD_eGj6qNtA5f9mNmpl8fuQ3cAsFg-HfaXQeFgs7q7Ur_4YrFwyg';

const gcpURL = `${imgURL}=${props}`;

const sizesConfig =
  '[{"screen":320,"size":320},{"screen":600,"size":640},{"screen":1024,"size":960}]';

const sourceSet = `${imgURL}=w320-${props} 320w,${imgURL}=w640-${props} 600w,${imgURL}=w960-${props} 1024w`;

const sizesAltConfig = `[{"screen":320,"size":320},{"screen":600,"size":640,"source":"${imgAltURL}"},{"screen":1024,"size":960}]`;

const sourceSetAlt = `${imgURL}=w320-${props} 320w,${imgAltURL}=w640-${props} 600w,${imgURL}=w960-${props} 1024w`;

let element;

afterEach(() => {
  element = undefined;
});

describe('<gcp-img>', () => {
  beforeEach(async () => {
    element = await fixture(`
      <gcp-img></gcp-img>
    `);
  });

  it('has a placeholder element in shadow root', () => {
    expect(element.shadowPlaceholder).to.be.an.instanceof(HTMLElement);
  });

  it('has an picture element in shadow root', () => {
    expect(element.shadowPicture).to.be.an.instanceof(HTMLPictureElement);
  });

  it('has an img element in shadow root', () => {
    expect(element.shadowImage).to.be.an.instanceof(HTMLImageElement);
  });

  it('reflects src property', () => {
    element.src = 'foo';
    expect(element.getAttribute('src')).to.equal('foo');
  });

  it('has a default empty alt text', () => {
    expect(element.alt).to.equal('');
  });

  it('has a read only intersecting prop', () => {
    const init = element.intersecting;

    element.intersecting = Math.random();
    expect(element.intersecting).to.equal(init);
  });

  it('passes the a11y audit', () => {
    expect(element).shadowDom.to.be.accessible();
  });

  it('shadow image passes the a11y audit', () => {
    expect(element.shadowImage).dom.to.be.accessible();
  });
});

describe('<gcp-img alt="attribute alt">', () => {
  beforeEach(async () => {
    element = await fixture(`
      <gcp-img alt="attribute alt"></gcp-img>
    `);
  });

  it('returns alt dom property', () => {
    expect(element.alt).to.equal('attribute alt');
  });

  it('can override the alt via attribute', () => {
    element.alt = 'override alt';
    expect(element.shadowImage.alt).to.equal('override alt');
  });

  it('passes the a11y audit', () => {
    expect(element).shadowDom.to.be.accessible();
  });

  it('shadow image passes the a11y audit', () => {
    expect(element.shadowImage).dom.to.be.accessible();
  });
});

describe('<gcp-img src="path/to/cloud/img">', () => {
  if ('IntersectionObserver' in window) {
    describe('"IntersectionObserver" supported', () => {
      beforeEach(async () => {
        element = await fixture(`
          <gcp-img style="position: fixed; left: -10000px;" src="${imgURL}"></gcp-img>
        `);
      });

      it('initializes an IntersectionObserver', () => {
        expect(element.observer).to.be.an.instanceof(IntersectionObserver);
      });

      it('does not set img src', () => {
        expect(element.shadowImage.src).to.not.be.ok;
      });

      it('does not set intersecting attr', async () => {
        expect(element.hasAttribute('intersecting')).to.be.false;
      });

      describe('when image scrolls into view', () => {
        beforeEach(async () => {
          element.style.left = '100px';
          await aTimeout(100);
        });

        it('Loads image', async () => {
          expect(element.shadowImage.src).to.equal(`${gcpURL}`);
        });

        it('sets intersecting attr', async () => {
          expect(element.hasAttribute('intersecting')).to.be.true;
        });
      });
    });
  } else {
    describe('"IntersectionObserver" not supported', () => {
      beforeEach(async () => {
        element = await fixture(`
          <gcp-img style="position: fixed; left: -10000px;" src="${imgURL}"></gcp-img>
        `);
      });

      it('sets img src immediately', () => {
        expect(element.shadowImage.src).to.equal(`${gcpURL}`);
      });
    });
  }
});

describe('<gcp-img src="path/to/cloud/img" size="180">', () => {
  beforeEach(async () => {
    element = await fixture(`
      <gcp-img src="${imgURL}" size="180"></gcp-img>
    `);
    await elementUpdated(element);
  });

  it('returns size dom property', () => {
    expect(element.size).to.equal('180');
  });

  it('Image sets the size property', () => {
    expect(element.shadowImage.src).to.equal(`${imgURL}=w180-${props}`);
  });

  it('can override the size via attribute', async () => {
    expect(element.size).to.equal('180');
    element.size = '360';
    await elementUpdated(element);
    expect(element.size).to.equal('360');
  });

  it('can override the shadow image src via size attribute', async () => {
    expect(element.shadowImage.src).to.equal(`${imgURL}=w180-${props}`);
    element.size = '360';
    await elementUpdated(element.shadowImage);
    expect(element.shadowImage.src).to.equal(`${imgURL}=w360-${props}`);
  });

  it('passes the a11y audit', () => {
    expect(element).shadowDom.to.be.accessible();
  });

  it('shadow image passes the a11y audit', () => {
    expect(element.shadowImage).dom.to.be.accessible();
  });
});

describe('<gcp-img src="path/to/cloud/img" darksrc="path/to/cloud/img">', () => {
  beforeEach(async () => {
    element = await fixture(`
      <gcp-img src="${imgURL}" darksrc="${imgAltURL}"></gcp-img>
    `);
    await elementUpdated(element);
  });

  it('returns darksrc dom property', () => {
    expect(element.darksrc).to.equal(imgAltURL);
  });

  it('can override the darksrc via attribute', async () => {
    expect(element.darksrc).to.equal(imgAltURL);
    element.darksrc = imgURL;
    await elementUpdated(element);
    expect(element.darksrc).to.equal(imgURL);
  });

  it('passes the a11y audit', () => {
    expect(element).shadowDom.to.be.accessible();
  });

  it('shadow image passes the a11y audit', () => {
    expect(element.shadowImage).dom.to.be.accessible();
  });
});

describe('<gcp-img src="path/to/cloud/img" config="json-stringify">', () => {
  beforeEach(async () => {
    element = await fixture(`
      <gcp-img src="${imgURL}" config=${sizesConfig}></gcp-img>
    `);
  });

  it('has a read only config prop', () => {
    const init = element.config;

    element.config = Math.random();
    expect(JSON.stringify(element.config)).to.equal(JSON.stringify(init));
  });

  it('returns config dom property', () => {
    expect(element.getAttribute('config')).to.equal(sizesConfig);
  });

  it('Image sets the srcset property', async () => {
    await elementUpdated(element.shadowImage);
    expect(element.shadowImage.srcset).to.equal(sourceSet);
  });

  it('passes the a11y audit', () => {
    expect(element).shadowDom.to.be.accessible();
  });

  it('shadow image passes the a11y audit', () => {
    expect(element.shadowImage).dom.to.be.accessible();
  });
});

describe('<gcp-img src="path/to/cloud/img" config="json-stringify-with-src">', () => {
  beforeEach(async () => {
    element = await fixture(`
      <gcp-img src="${imgURL}" config=${sizesAltConfig}></gcp-img>
    `);
  });

  it('has a read only config prop', () => {
    const init = element.config;

    element.config = Math.random();
    expect(JSON.stringify(element.config)).to.equal(JSON.stringify(init));
  });

  it('returns sizes dom property', () => {
    expect(element.getAttribute('config')).to.equal(sizesAltConfig);
  });

  it('Image sets the srcset property', async () => {
    await elementUpdated(element.shadowImage);
    expect(element.shadowImage.srcset).to.equal(sourceSetAlt);
  });

  it('passes the a11y audit', () => {
    expect(element).shadowDom.to.be.accessible();
  });

  it('shadow image passes the a11y audit', () => {
    expect(element.shadowImage).dom.to.be.accessible();
  });
});

describe('<gcp-img src="path/to/cloud/img" ttl="180">', () => {
  beforeEach(async () => {
    element = await fixture(`
      <gcp-img src="${imgURL}" ttl="180"></gcp-img>
    `);
  });

  it('has a read only time to live (ttl) prop', () => {
    const init = element.ttl;

    element.ttl = Math.random();
    expect(element.ttl).to.equal(init);
  });

  it('returns ttl dom property', () => {
    expect(element.getAttribute('ttl')).to.equal('180');
  });

  it('Image sets the ttl property', async () => {
    await elementUpdated(element.shadowImage);
    expect(element.shadowImage.src).to.equal(`${imgURL}=v1-e180-nw`);
  });

  it('passes the a11y audit', () => {
    expect(element).shadowDom.to.be.accessible();
  });

  it('shadow image passes the a11y audit', () => {
    expect(element.shadowImage).dom.to.be.accessible();
  });
});

describe('The image quality changes according to the connection speed', () => {
  beforeEach(async () => {
    element = await fixture(`
      <gcp-img src="${imgURL}"></gcp-img>
    `);
    await elementUpdated(element);
  });

  it('connection speed is updated', async () => {
    expect(element.isConnectionFast).to.be.true;
  });

  it('image quality is updated', async () => {
    expect(element.shadowImage.src).to.equal(`${gcpURL}`);
  });

  it('passes the a11y audit', () => {
    expect(element).shadowDom.to.be.accessible();
  });

  it('shadow image passes the a11y audit', () => {
    expect(element.shadowImage).dom.to.be.accessible();
  });
});

describe('<gcp-img src="path/to/cloud/img" rotate="90">', () => {
  beforeEach(async () => {
    element = await fixture(`
      <gcp-img src="${imgURL}" rotate="90"></gcp-img>
    `);
  });

  it('returns rotate dom property', () => {
    expect(element.getAttribute('rotate')).to.equal('90');
  });

  it('Image sets the rotate property', async () => {
    await elementUpdated(element.shadowImage);
    expect(element.shadowImage.src).to.equal(`${gcpURL}-r90`);
  });

  it('can override the rotate via attribute', async () => {
    expect(element.rotate).to.equal('90');
    element.rotate = '270';
    await elementUpdated(element);
    expect(element.rotate).to.equal('270');
    expect(element.shadowImage.src).to.equal(`${gcpURL}-r270`);
  });

  it('passes the a11y audit', () => {
    expect(element).shadowDom.to.be.accessible();
  });

  it('shadow image passes the a11y audit', () => {
    expect(element.shadowImage).dom.to.be.accessible();
  });
});

describe('<gcp-img src="path/to/cloud/img" flip="v">', () => {
  beforeEach(async () => {
    element = await fixture(`
      <gcp-img src="${imgURL}" flip="v"></gcp-img>
    `);
  });

  it('returns flip dom property', () => {
    expect(element.getAttribute('flip')).to.equal('v');
  });

  it('Image sets the flip property', async () => {
    await elementUpdated(element.shadowImage);
    expect(element.shadowImage.src).to.equal(`${gcpURL}-fv`);
  });

  it('can override the flip via attribute', async () => {
    expect(element.flip).to.equal('v');
    element.flip = 'h';
    await elementUpdated(element);
    expect(element.flip).to.equal('h');
    expect(element.shadowImage.src).to.equal(`${gcpURL}-fh`);
  });

  it('passes the a11y audit', () => {
    expect(element).shadowDom.to.be.accessible();
  });

  it('shadow image passes the a11y audit', () => {
    expect(element.shadowImage).dom.to.be.accessible();
  });
});

describe('<gcp-img src="path/to/cloud/img" filter="blur" radius="100">', () => {
  beforeEach(async () => {
    element = await fixture(`
      <gcp-img src="${imgURL}" filter="blur" radius="100"></gcp-img>
    `);
  });

  it('returns filter blur dom property', () => {
    expect(element.getAttribute('filter')).to.equal('blur');
  });

  it('returns filter radius dom property', () => {
    expect(element.getAttribute('radius')).to.equal('100');
  });

  it('Image sets the blur filter', async () => {
    await elementUpdated(element.shadowImage);
    expect(element.shadowImage.src).to.equal(`${gcpURL}-fSoften=1,100,0`);
  });

  it('can override the filter radius via attribute', async () => {
    expect(element.radius).to.equal('100');
    element.radius = '50';
    await elementUpdated(element);
    expect(element.radius).to.equal('50');
    expect(element.shadowImage.src).to.equal(`${gcpURL}-fSoften=1,50,0`);
  });

  it('passes the a11y audit', () => {
    expect(element).shadowDom.to.be.accessible();
  });

  it('shadow image passes the a11y audit', () => {
    expect(element.shadowImage).dom.to.be.accessible();
  });
});

describe('<gcp-img src="path/to/cloud/img" filter="vignette" radius="100">', () => {
  beforeEach(async () => {
    element = await fixture(`
      <gcp-img src="${imgURL}" filter="vignette" radius="100"></gcp-img>
    `);
  });

  it('returns filter vignette dom property', () => {
    expect(element.getAttribute('filter')).to.equal('vignette');
  });

  it('returns filter radius dom property', () => {
    expect(element.getAttribute('radius')).to.equal('100');
  });

  it('Image sets the vignette filter', async () => {
    await elementUpdated(element.shadowImage);
    expect(element.shadowImage.src).to.equal(
      `${gcpURL}-fVignette=1,100,1.4,0,000000`
    );
  });

  it('can override the vignette radius via attribute', async () => {
    expect(element.radius).to.equal('100');
    element.radius = '50';
    await elementUpdated(element);
    expect(element.radius).to.equal('50');
    expect(element.shadowImage.src).to.equal(
      `${gcpURL}-fVignette=1,50,1.4,0,000000`
    );
  });

  it('can override the vignette color via attribute', async () => {
    element.color = 'F90F90';
    await elementUpdated(element);
    expect(element.shadowImage.src).to.equal(
      `${gcpURL}-fVignette=1,100,1.4,0,F90F90`
    );
  });

  it('an invalid vignette color returns black', async () => {
    element.color = 'INVALID';
    await elementUpdated(element);
    expect(element.shadowImage.src).to.equal(
      `${gcpURL}-fVignette=1,100,1.4,0,000000`
    );
  });

  it('passes the a11y audit', () => {
    expect(element).shadowDom.to.be.accessible();
  });

  it('shadow image passes the a11y audit', () => {
    expect(element.shadowImage).dom.to.be.accessible();
  });
});

describe('<gcp-img src="path/to/cloud/img" filter="invert">', () => {
  beforeEach(async () => {
    element = await fixture(`
      <gcp-img src="${imgURL}" filter="invert"></gcp-img>
    `);
  });

  it('returns invert dom property', () => {
    expect(element.getAttribute('filter')).to.equal('invert');
  });

  it('Image sets the invert filter', async () => {
    await elementUpdated(element.shadowImage);
    expect(element.shadowImage.src).to.equal(`${gcpURL}-fInvert=0`);
  });

  it('passes the a11y audit', () => {
    expect(element).shadowDom.to.be.accessible();
  });

  it('shadow image passes the a11y audit', () => {
    expect(element.shadowImage).dom.to.be.accessible();
  });
});

describe('<gcp-img src="path/to/cloud/img" filter="bw">', () => {
  beforeEach(async () => {
    element = await fixture(`
      <gcp-img src="${imgURL}" filter="bw"></gcp-img>
    `);
  });

  it('returns filter bw dom property', () => {
    expect(element.getAttribute('filter')).to.equal('bw');
  });

  it('Image sets the bw filter', async () => {
    await elementUpdated(element.shadowImage);
    expect(element.shadowImage.src).to.equal(`${gcpURL}-fbw=0`);
  });

  it('passes the a11y audit', () => {
    expect(element).shadowDom.to.be.accessible();
  });

  it('shadow image passes the a11y audit', () => {
    expect(element.shadowImage).dom.to.be.accessible();
  });
});

describe('<gcp-img src="path/to/cloud/img" crop="smart">', () => {
  beforeEach(async () => {
    element = await fixture(`
      <gcp-img src="${imgURL}" crop="smart"></gcp-img>
    `);
  });

  it('returns crop dom property', () => {
    expect(element.getAttribute('crop')).to.equal('smart');
  });

  it('Image sets the crop', async () => {
    await elementUpdated(element.shadowImage);
    expect(element.shadowImage.src).to.equal(`${gcpURL}-pp`);
  });

  it('can override the crop via attribute', async () => {
    expect(element.crop).to.equal('smart');
    element.crop = 'circular';
    await elementUpdated(element);
    expect(element.crop).to.equal('circular');
    expect(element.shadowImage.src).to.equal(`${gcpURL}-cc`);
  });

  it('passes the a11y audit', () => {
    expect(element).shadowDom.to.be.accessible();
  });

  it('shadow image passes the a11y audit', () => {
    expect(element.shadowImage).dom.to.be.accessible();
  });
});

describe('<gcp-img src="path/to/cloud/img" crop="circular">', () => {
  beforeEach(async () => {
    element = await fixture(`
      <gcp-img src="${imgURL}" crop="circular"></gcp-img>
    `);
  });

  it('returns crop dom property', () => {
    expect(element.getAttribute('crop')).to.equal('circular');
  });

  it('Image sets the crop', async () => {
    await elementUpdated(element.shadowImage);
    expect(element.shadowImage.src).to.equal(`${gcpURL}-cc`);
  });

  it('can override the crop via attribute', async () => {
    expect(element.crop).to.equal('circular');
    element.crop = 'smart';
    await elementUpdated(element);
    expect(element.crop).to.equal('smart');
    expect(element.shadowImage.src).to.equal(`${gcpURL}-pp`);
  });

  it('passes the a11y audit', () => {
    expect(element).shadowDom.to.be.accessible();
  });

  it('shadow image passes the a11y audit', () => {
    expect(element.shadowImage).dom.to.be.accessible();
  });
});
