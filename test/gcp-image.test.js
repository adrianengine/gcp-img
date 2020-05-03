import { html, fixture, expect, aTimeout, elementUpdated } from '@open-wc/testing';

import '../gcp-image.js';

// eslint-disable-next-line max-len
const src = 'https://lh3.googleusercontent.com/YXPVsT8M2Z1N5lJa4L1HNaytl5YnrH452QC_bUdmOP3iyfK8wgJ2GFsTbaQ7Ha8F5XDD8yKSYDORksuJqrDBpzr6ZV8aJ151SMND';
const sizesConfig = '[{"screen":320,"size":320},{"screen":600,"size":640},{"screen":1024,"size":960}]';
const sourceSet = `${src}=s320 320w,${src}=s640 600w,${src}=s960 1024w`;

const srcArtDirected = 'https://lh3.googleusercontent.com/xS2eiv5_nOEX8SL_l3JLL9HaIpprRo8JFoEud4OI7TUNJuoPnD_eGj6qNtA5f9mNmpl8fuQ3cAsFg-HfaXQeFgs7q7Ur_4YrFwyg';
const sizesConfigArtDirected = `[{"screen":320,"size":320},{"screen":600,"size":640,"source":"${srcArtDirected}"},{"screen":1024,"size":960}]`;
const sourceSetArtDirected = `${src}=s320 320w,${srcArtDirected}=s640 600w,${src}=s960 1024w`;

let element;

afterEach(() => {
  element = undefined;
})

describe('<gcp-image>', () => {
  beforeEach(async function() {
    element = await fixture(`
      <gcp-image></gcp-image>
    `);
  });

  it('has an img element in shadow root', () => {
    expect(element.shadowImage).to.be.an.instanceof(HTMLImageElement);
  });

  it('reflects src property', () => {
    element.src = 'foo'
    expect(element.getAttribute("src")).to.equal('foo')
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
    expect(element.shadowImage).to.be.accessible();
  });
});

describe('<gcp-image alt="attribute alt">', () => {
  beforeEach(async () => {
    element = await fixture(`
      <gcp-image alt="attribute alt"></gcp-image>
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
    expect(element.shadowImage).to.be.accessible();
  });
});

describe('<gcp-image src="path/to/cloud/img">', () => {
  if ("IntersectionObserver" in window) {
    describe('"IntersectionObserver" supported', () => {
      beforeEach(async () => {
        element = await fixture(`
          <gcp-image style="position: fixed; left: -10000px;" src="${src}"></gcp-image>
        `)
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
          expect(element.shadowImage.src).to.equal(src);
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
          <gcp-image style="position: fixed; left: -10000px;" src="${src}"></gcp-image>
        `)
      });

      it('sets img src immediately', () => {
        expect(element.shadowImage.src).to.equal(src);
      });
    });
  }
});

describe('<gcp-image src="path/to/cloud/img" size="180">', () => {
  beforeEach(async () => {
    element = await fixture(`
      <gcp-image src="${src}" size="180"></gcp-image>
    `);
    await elementUpdated(element);
  });

  it('returns size dom property', () => {
    expect(element.size).to.equal('180');
  });

  it('Image sets the size property', () => {
    expect(element.shadowImage.src).to.equal(`${src}=s180`);
  });

  it('can override the size via attribute', async () => {
    expect(element.size).to.eq('180');
    element.size = '360';
    await elementUpdated(element);
    expect(element.size).to.equal('360');
  });

  it('can override the shadow image src via size attribute', async () => {
    expect(element.shadowImage.src).to.eq(`${src}=s180`);
    element.size = '360';
    await elementUpdated(element.shadowImage);
    expect(element.shadowImage.src).to.equal(`${src}=s360`);
  });

  it('passes the a11y audit', () => {
    expect(element).shadowDom.to.be.accessible();
  });

  it('shadow image passes the a11y audit', () => {
    expect(element.shadowImage).to.be.accessible();
  });
});

describe('<gcp-image src="path/to/cloud/img" sizes="json-stringify">', () => {
  beforeEach(async () => {
    element = await fixture(`
      <gcp-image src="${src}" sizes=${sizesConfig}></gcp-image>
    `);
  });

  it('has a read only sizes prop', () => {
    const init = element.sizes;

    element.sizes = Math.random();
    expect(element.sizes).to.equal(init);
  });

  it('returns sizes dom property', () => {
    expect(element.getAttribute('sizes')).to.equal(sizesConfig);
  });

  it('Image sets the srcset property', async () => {
    await elementUpdated(element.shadowImage);
    expect(element.shadowImage.srcset).to.equal(sourceSet);
  });

  it('passes the a11y audit', () => {
    expect(element).shadowDom.to.be.accessible();
  });

  it('shadow image passes the a11y audit', () => {
    expect(element.shadowImage).to.be.accessible();
  });
});

describe('<gcp-image src="path/to/cloud/img" sizes="json-stringify-with-src">', () => {
  beforeEach(async () => {
    element = await fixture(`
      <gcp-image src="${src}" sizes=${sizesConfigArtDirected}></gcp-image>
    `);
  });

  it('has a read only sizes prop', () => {
    const init = element.sizes;

    element.sizes = Math.random();
    expect(element.sizes).to.equal(init);
  });

  it('returns sizes dom property', () => {
    expect(element.getAttribute('sizes')).to.equal(sizesConfigArtDirected);
  });

  it('Image sets the srcset property', async () => {
    await elementUpdated(element.shadowImage);
    expect(element.shadowImage.srcset).to.equal(sourceSetArtDirected);
  });

  it('passes the a11y audit', () => {
    expect(element).shadowDom.to.be.accessible();
  });

  it('shadow image passes the a11y audit', () => {
    expect(element.shadowImage).to.be.accessible();
  });
});
