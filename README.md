<img src="gcp-img-logo.png" alt="gcp-img Web Component" align="right" height="60" />

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
  src="https://lh3.googleusercontent.com/…"
  alt="Three people sitting on a lawn and blowing bubbles."></gcp-img>
```

The above example shows usage of the `<gcp-img>` element:

- The `src` attribute is **required**, and contains the path to the image you want to embed from Google Cloud Services.
- The `alt` attribute holds a text description of the image, which isn't mandatory but is **incredibly useful** for accessibility — screen readers read this description out to their users so they know what the image means. Alt text is also displayed on the page if the image can't be loaded for some reason: for example, network errors, content blocking, or linkrot.

### Setting Dimensions

```html
<gcp-img
  src="https://lh3.googleusercontent.com/…"
  size="200"></gcp-img>
```

The above example shows usage of the `<gcp-img>` `size` attribute:

- The `size` attribute holds the numeric value of the image width to be displayed.

### Setting Responsive Dimensions

```html
<gcp-img
  src="https://lh3.googleusercontent.com/…"
  sizes="[{'screen':320,'size':320},{'screen':600,'size':640},{'screen':1024,'size':960}]"></gcp-img>
```
The above example shows usage of the `<gcp-img>` `sizes` attribute:

- The `sizes` attribute holds a JS object with the configuration of the image to be displayed.

```js
[
  {
    "screen": 320,
    "size": 320
  },
  {
    "screen": 600,
    "size": 640
  },
  {
    "screen": 1024,
    "size": 960
  }
]
```

The above configuration will request:

- A `320px` width image on a viewport with the size of 320
- A `640px` width image on a viewport with the size of 600
- A `960px` width image on a viewport with the size of 1024

You can specify as many configuration values as you need.

#### Art Directed Image

In case you need to show a different image in certain viewport, you can specify the source in the configuration:

```js
[
  {
    "screen": 320,
    "size": 320
  },
  {
    "screen": 600,
    "size": 640,
    "source": "https://lh3.googleusercontent.com/…"
  },
  {
    "screen": 1024,
    "size": 960
  }
]
```

The above configuration will render a different image between the viewports with sizes of 640 and 1024.

### Change the Cache TTL (Time to live)

```html
<gcp-img
  src="https://lh3.googleusercontent.com/…"
  ttl="190"></gcp-img>
```

By default the images will be requested with a cache for one year (365 Days).

To change the number of days you can specify the new number of days in the `ttl` attribute.

### Applying Transformations

#### Rotation

```html
<gcp-img
  src="https://lh3.googleusercontent.com/…"
  rotate="180"></gcp-img>
```

The above example shows usage of the `<gcp-img>` `rotate` attribute:

- You can rotate images only with `90`, `180`, or `270` value for the degrees clockwise.

#### Flip

```html
<gcp-img
  src="https://lh3.googleusercontent.com/…"
  flip="180"></gcp-img>
```

The above example shows usage of the `<gcp-img>` `flip` attribute:

- You can flip images vertically with `v` or horizontally with `h`.

### Applying Filters

#### Blur

```html
<gcp-img
  src="https://lh3.googleusercontent.com/…"
  blur="40"></gcp-img>
```

The above example shows usage of the `<gcp-img>` `blur` attribute:

- You can blur images by specifing a radius value between `0` and `100`.

#### Vignette

```html
<gcp-img
  src="https://lh3.googleusercontent.com/…"
  vignette="80"></gcp-img>
```

The above example shows usage of the `<gcp-img>` `vignette` attribute:

- You can vignette images by specifing a radius value between `0` and `100`.

#### Invert

```html
<gcp-img
  src="https://lh3.googleusercontent.com/…"
  invert="true"></gcp-img>
```

The above example shows usage of the `<gcp-img>` `invert` attribute:

- You can invert images by specifing a boolean value of `true`.

#### Black and White

```html
<gcp-img
  src="https://lh3.googleusercontent.com/…"
  bw="true"></gcp-img>
```

The above example shows usage of the `<gcp-img>` `bw` attribute:

- You can bw images by specifing a boolean value of `true`.

## How to Contribute

Please check the [Contributor Guide](/.github/CONTRIBUTING.md).
