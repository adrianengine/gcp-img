# \<gcp-img>

The Custom Element `<gcp-img>` element wraps an image from Google Cloud Storage into the document.

This webcomponent follows the [open-wc](https://github.com/open-wc/open-wc) recommendation.

## Installation
```bash
npm i gcp-img
```

## Usage
```html
<script type="module">
  import 'gcp-img/gcp-img.js';
</script>

<gcp-img
  src="https://lh3.googleusercontent.com/YXPVsT8M2Z…"
  alt="Three people sitting on a lawn and blowing bubbles."></gcp-img>
```

The above example shows usage of the `<gcp-img>` element:

- The `src` attribute is **required**, and contains the path to the image you want to embed.
- The `alt` attribute holds a text description of the image, which isn't mandatory but is **incredibly useful** for accessibility — screen readers read this description out to their users so they know what the image means. Alt text is also displayed on the page if the image can't be loaded for some reason: for example, network errors, content blocking, or linkrot.

## How to Contribute

Please check the [Contributor Guide](/.github/CONTRIBUTING.md).
