import { GcpImg } from './src/GcpImg.js';

async function supportsWebp() {
  if (!window.createImageBitmap) {
    return false;
  }

  const webpData =
    'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
  const blob = await fetch(webpData).then(r => r.blob());
  return createImageBitmap(blob).then(
    () => true,
    () => false
  );
}

(async () => {
  const page = document.querySelector('html');

  if (await supportsWebp()) {
    page.classList.add('webp');
    window.customElements.define('gcp-img', GcpImg);
  } else {
    page.classList.remove('webp');
    window.customElements.define('gcp-img', GcpImg);
  }
})();
