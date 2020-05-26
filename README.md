<img src="gcp-img-logo.png" alt="gcp-img Web Component" align="right" height="60" />

# \<gcp-img>

[![Netlify Status](https://api.netlify.com/api/v1/badges/8963b8fa-da9f-4b52-a34f-f132d84b0936/deploy-status)](https://app.netlify.com/sites/gcp-img/deploys)

The Custom Element `<gcp-img>` element wraps an image from Google Cloud Storage into the document.

This web component follows the [open-wc](https://github.com/open-wc/open-wc) recommendation.

## Table of Contents

* [Concept](#concept)
* [Philosophy](#philosophy)
* [Installation](#installation)
* [Usage](#usage)
  + [Setting Dimensions](#setting-dimensions)
    - [A fixed width](#a-fixed-width)
  + [Setting a Dark mode image alternative](#setting-a-dark-mode-image-alternative)
  + [Setting Responsive Dimensions](#setting-responsive-dimensions)
    - [Art Directed Image](#art-directed-image)
  + [Configuration Options](#configuration-options)
  + [Change the Cache TTL (Time to live)](#change-the-cache-ttl--time-to-live)
  + [Applying Transformations](#applying-transformations)
    - [Rotation](#rotation)
    - [Flip](#flip)
  + [Applying Filters](#applying-filters)
    - [Blur](#blur)
    - [Vignette](#vignette)
    - [Invert](#invert)
    - [Black and White](#black-and-white)
  + [Applying Crop](#applying-crop)
    - [Smart Crop](#smart-crop)
    - [Circular Crop](#circular-crop)
  + [Animated Images](#animated-images)
* [Attribute Summary](#attribute-summary)
* [Recommended Options](#recommended-options)
  + [Fallback Image](#fallback-image)
  + [Placeholder Image](#placeholder-image)
  + [Animate Image loading](#animate-image-loading)
* [How to Contribute](#how-to-contribute)

## Concept

Google offers an API for serving images uploaded to [Google Cloud Storage](https://cloud.google.com/storage) through a high-performance, dynamic image-serving infrastructure.

The system provides users with a way to perform many operations on images on-the-fly – making it extremely well-suited for developers to implement assets sized, cropped, formatted, etc. in the right direction for the user – with no added work.

For example, the image-serving infrastructure can reformat (JPG, PNG, WEBP), resize or crop, and transform the image in several ways on-the-fly.

This Web Component provides a web developer-friendly way to take advantage of those characteristics.

## Philosophy

Out of the box, this web component aims to provide the best performant and accessible experience for web images.

Some of the defaults to accomplish this are:

- Serve images with an [effective cache policy](https://web.dev/uses-long-cache-ttl/) of 365 days
- Serve images in [WebP format](https://web.dev/uses-webp-images/) in browsers where it is supported
- Properly [size images](https://web.dev/uses-responsive-images/)
- Efficiently [encode images](https://web.dev/uses-optimized-images/)
- Native [Lazy-loading](https://web.dev/native-lazy-loading/)

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

- The `src` attribute is **required** and contains the path to the image you want to embed from Google Cloud Services.
- The `alt` attribute holds a text description of the image, which isn't mandatory but is **incredibly useful** for accessibility — screen readers read this description out to their users, so they know what the image means. Alt-text is also displayed on the page if the image can't be loaded for some reason: for example, network errors, content blocking, or linkrot.

### Setting Dimensions

```html
<gcp-img
  src="https://lh3.googleusercontent.com/…"
  size="684, 424"></gcp-img>
```

The above example shows usage of the `size` attribute:

- The `size` attribute holds the numeric value of the image width to be displayed.

#### A fixed width

```html
<gcp-img
  fixed
  src="https://lh3.googleusercontent.com/…"
  size="200, 124"></gcp-img>
```

The above example shows usage of the `fixed` attribute:

- The `fixed` attribute makes the image with the specifyied width on the `size` attribute.

### Setting a Dark mode image alternative

```html
<gcp-img
  src="https://lh3.googleusercontent.com/…"
  size="684, 424"
  darksrc="https://lh3.googleusercontent.com/…"></gcp-img>
```

The above example shows usage of the `darksrc` attribute:

- The `darksrc` attribute contains the path to an alternate dark version of the image you want to embed from Google Cloud Services.
- It will be displayed if `prefers-color-scheme: dark` is supported and activated.

### Setting Responsive Dimensions

```html
<gcp-img
  src="https://lh3.googleusercontent.com/…"
  size="684, 424"
  config="[{'screen':320,'size':320},{'screen':600,'size':640},{'screen':1024,'size':960}]"></gcp-img>
```
The above example shows usage of the read-only `config` attribute:

- The `config` attribute holds a JS object converted to text with the configuration of the image to be displayed.

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

The above configuration will render a different image between the viewports with dimensions of 320, 640 and 1024.

### Configuration Options

| Attribute | Required | Type     | Description                                                                           |
|-----------|----------|----------|---------------------------------------------------------------------------------------|
| `screen`  | Yes      | `number` | The screen size where the configuration values are intended.                          |
| `size`    | Yes      | `number` | The width of the image for the companion `screen` size.                               |
| `source`  | No       | URL      | The path to the image you want to embed from Google Cloud Services.                   |
| `dark`    | No       | URL      | The path to the dark mode version image you want to embed from Google Cloud Services. |

### Change the Cache TTL (Time to live)

```html
<gcp-img
  src="https://lh3.googleusercontent.com/…"
  size="684, 424"
  ttl="190"></gcp-img>
```

By default the images will be requested with a cache for one year (365 Days).

To change the number of days you can specify the new number of days in the read-only `ttl` attribute.

### Applying Transformations

#### Rotation

```html
<gcp-img
  src="https://lh3.googleusercontent.com/…"
  size="684, 424"
  rotate="180"></gcp-img>
```

The above example shows usage of the `rotate` attribute:

- You can rotate images only with `90`, `180`, or `270` value for the degrees clockwise.

#### Flip

```html
<gcp-img
  src="https://lh3.googleusercontent.com/…"
  size="684, 424"
  flip="180"></gcp-img>
```

The above example shows usage of the `flip` attribute:

- You can flip images vertically with `v` or horizontally with `h`.

### Applying Filters

#### Blur

```html
<gcp-img
  src="https://lh3.googleusercontent.com/…"
  size="684, 424"
  filter="blur"
  radius="40"></gcp-img>
```

The above example shows usage of the `blur` on the `filter` attribute:

- You can blur images by specifying a `radius` value between `0` and `100`.

#### Vignette

```html
<gcp-img
  src="https://lh3.googleusercontent.com/…"
  size="684, 424"
  filter="vignette"
  radius="80"></gcp-img>
```

The above example shows usage of the `vignette` on the `filter` attribute:

- You can vignette images by specifying a `radius` value between `0` and `100`.

#### Invert

```html
<gcp-img
  src="https://lh3.googleusercontent.com/…"
  size="684, 424"
  filter="invert"></gcp-img>
```

The above example shows usage of the `invert` on the `filter` attribute:

- You can make images invert by specifying a value of `invert`.

#### Black and White

```html
<gcp-img
  src="https://lh3.googleusercontent.com/…"
  size="684, 424"
  filter="bw"></gcp-img>
```

The above example shows usage of the `bw` on the `filter` attribute:

- You can make images black and white by specifying a value of `bw`.

### Applying Crop

#### Smart Crop

```html
<gcp-img
  src="https://lh3.googleusercontent.com/…"
  size="684, 424"
  crop="smart"></gcp-img>
```

The above example shows usage of the `smart` the `crop` attribute:

- You can make images square crop by specifying a value of `smart`.

#### Circular Crop

```html
<gcp-img
  src="https://lh3.googleusercontent.com/…"
  size="684, 424"
  crop="circular"></gcp-img>
```

The above example shows usage of the `circular` the `crop` attribute:

- You can make images circular crop by specifying a value of `circular`.

### Animated Images

```html
<gcp-img
  src="https://lh3.googleusercontent.com/…"
  size="684, 424"
  play></gcp-img>
```

The above example shows usage of the `play` attribute:

- You can start the animation of GIF or WEBP images by specifying an attribute of `play`.

## Attribute Summary

| Attribute | Required | Read-only | Type      | Default  | Description                                                                                  |
|-----------|----------|-----------|-----------|----------|----------------------------------------------------------------------------------------------|
| `src`     | Yes      | No        | URL       | `null`   | The path to the image you want to embed from Google Cloud Services.                          |
| `darksrc` | No       | No        | URL       | `null`   | The path to the image you want to show if `prefers-color-scheme: dark` is supported.         |
| `alt`     | No       | No        | *String*  | *empty*  | A text description of the image.                                                             |
| `fixed`   | No       | No        | *Boolean* | `false`  | When specifying a single source will fix the dimensions to the values on `size` attribute.   |
| `size`    | No       | No        | *Number*  | `null`   | The numeric value of the image width to be displayed.                                        |
| `config`  | No       | Yes       | *String*  | `null`   | A JS object converted to text with the configuration of the image to be displayed.           |
| `ttl`     | No       | Yes       | *Number*  | `365`    | The number of days to cache the image. Default value is recommended.                         |
| `rotate`  | No       | No        | *Number*  | `null`   | The value for the degrees clockwise to rotate the image. Only accepts `90`, `180`, or `270`. |
| `flip`    | No       | No        | *String*  | `null`   | Flip images vertically with `v` or horizontally with `h`.                                    |
| `filter`  | No       | No        | *String*  | `null`   | Apply a filter to the image by specifying `blur`, `vignette`, `invert` or `bw`.              |
| `radius`  | No       | No        | *Number*  | `0`      | Radius value between `0` and `100`. For `blur` and `vignette` filters.                       |
| `color`   | No       | No        | *String*  | `000000` | A Hexadecimal color number value to apply into the `vignette` filter.                        |
| `crop`    | No       | No        | *String*  | `null`   | Turn the image into a square or circle by specifying `smart` or `circular`.                  |
| `play`    | No       | No        | *Boolean* | `false`  | If the image source is an animated GIF/WEBP it will play it with autoloop.                   |

> Read-only properties mean if the attribute change on-the-fly, the image does not get updated to reflect the new value.

## Recommended Options

```html
<gcp-img src="https://lh3.googleusercontent.com/…" alt="Descriptive text">
  <img src="https://lh3.googleusercontent.com/…=w100-v3-e365-fSoften=1,100,0" alt="Descriptive text" slot="placeholder">
  <noscript>
    <img alt="Descriptive text" src="https://lh3.googleusercontent.com/…=v3-e365">
  </noscript>
</gcp-img>
```

To provide a better user experience is recommended to provide a fallback image for No-JS scenarios and a placeholder image for slow networks.

### Fallback Image

```html
<gcp-img src="https://lh3.googleusercontent.com/…" alt="Descriptive text">
  <noscript>
    <img alt="Descriptive text" src="https://lh3.googleusercontent.com/…=v3-e365">
  </noscript>
</gcp-img>
```

The above example adds a `<noscript>` tag with a regular `<img>` tag, to show image when JS is desactivated.

It is recommend to add `=v3-e365` parameters at the end of the Google Cloud Image URL, to serve a smaller image.

### Placeholder Image

```html
<gcp-img src="https://lh3.googleusercontent.com/…" alt="Descriptive text">
  <img src="https://lh3.googleusercontent.com/…=w100-v3-e365-fSoften=1,100,0" alt="Descriptive text" slot="placeholder">
</gcp-img>
```

The above example adds an image with the attribute `slot` with the value `placeholder` to be used as a placeholder while the image is lazy loaded.

It is recommended to provide a very small image, for this reason the example adds the paramaters `=w100-v3-e365-fSoften=1,100,0` at the end of the Google Cloud Image URL, to serve a 100px wide, blurry, compressed image.

```html
<gcp-img src="https://lh3.googleusercontent.com/…" alt="Descriptive text">
  <img src="data:image/gif;base64,R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ0frl3/zy7////w" alt="" slot="placeholder">
</gcp-img>
```

It is also possible to provide a [Base64 Encoded Image](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs) as a placeholder.

```html
<gcp-img src="https://lh3.googleusercontent.com/…" alt="Descriptive text">
  <svg slot="placeholder"><use xlink:href="#placeholder-svg"></use></svg>
</gcp-img>
```

Or a different element, like a SVG.

### Animate Image loading

```html
<gcp-img
  src="https://lh3.googleusercontent.com/…"
  alt="Three people sitting on a lawn and blowing bubbles."
  fade></gcp-img>
```

By including the `fade` attribute, the image will animate `opacity` from `0` to `1` when lazy-loaded, creating a nice effect.

## How to Contribute

Please check the [Contributor Guide](/.github/CONTRIBUTING.md).
