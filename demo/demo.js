const gcpImageDemo = (() => {
  let sizeSection = '';
  let rotateSection = '';
  let flipSection = '';
  let filterSection = '';
  let cropSection = '';
  let playSection = '';

  const initialize = () => {
    sizeSection = document.getElementById('size');
    rotateSection = document.getElementById('rotate');
    flipSection = document.getElementById('flip');
    filterSection = document.getElementById('filter');
    cropSection = document.getElementById('crop');
    playSection = document.getElementById('animation');
  };

  const cropDemo = event => {
    const element = cropSection.querySelector('gcp-img');
    const currentAction = event.target.dataset.action;
    const action = currentAction.toLowerCase();
    const switchAction = {
      circular: 'Smart',
      smart: 'Circular',
    };

    element.setAttribute('crop', action);

    event.target.setAttribute('data-action', switchAction[action]);
  };

  const animationDemo = event => {
    const element = playSection.querySelector('gcp-img');
    const currentAction = event.target.dataset.action;
    const switchAction = {
      stop: 'Play',
      play: 'Stop',
    };

    element.toggleAttribute('play');

    event.target.setAttribute(
      'data-action',
      switchAction[currentAction.toLowerCase()]
    );
  };

  const bindUIActions = () => {
    const sizedImage = sizeSection.querySelector('gcp-img');
    const sizeRange = sizeSection.querySelector('input');
    const rotateImage = rotateSection.querySelector('gcp-img');
    const rotateButtons = rotateSection.querySelectorAll('button');
    const flipedImage = flipSection.querySelector('gcp-img');
    const flipButtons = flipSection.querySelectorAll('button');
    const filteredImage = filterSection.querySelector('gcp-img');
    const filterButtons = filterSection.querySelectorAll('button');
    const radiusRange = filterSection.querySelector('#radius');
    const colorPicker = filterSection.querySelector('#color');
    const cropButton = cropSection.querySelector('button');
    const playButton = playSection.querySelector('button');

    sizeRange.addEventListener(
      'input',
      event => {
        const shadowImage = sizedImage.shadowRoot.getElementById('image');
        const changingCode = sizeSection.querySelector('.change');
        const oldHeight = shadowImage.height;
        const oldWidth = shadowImage.width;
        const newWidth = event.target.value;
        const newHeight = (newWidth * oldHeight) / oldWidth;
        const newSize = `${newWidth}, ${Math.round(newHeight)}`;

        sizedImage.setAttribute('size', newSize);
        changingCode.innerHTML = `"${newSize}"`;
      },
      false
    );

    [].forEach.call(rotateButtons, el => {
      el.addEventListener(
        'click',
        event => {
          rotateImage.setAttribute('rotate', event.target.value);
        },
        !1
      );
    });

    [].forEach.call(flipButtons, el => {
      el.addEventListener(
        'click',
        event => {
          flipedImage.setAttribute('flip', event.target.value);
        },
        !1
      );
    });

    [].forEach.call(filterButtons, el => {
      el.addEventListener(
        'click',
        event => {
          filteredImage.setAttribute('filter', event.target.value);
        },
        !1
      );
    });

    radiusRange.addEventListener(
      'input',
      event => {
        filteredImage.setAttribute('radius', event.target.value);
      },
      false
    );

    colorPicker.addEventListener(
      'input',
      event => {
        filteredImage.setAttribute(
          'color',
          event.target.value.replace('#', '')
        );
      },
      false
    );

    cropButton.addEventListener('click', event => {
      cropDemo(event);
    });

    playButton.addEventListener('click', event => {
      animationDemo(event);
    });
  };

  return {
    demoStart: () => {
      initialize();
      bindUIActions();
    },
  };
})();

gcpImageDemo.demoStart();
