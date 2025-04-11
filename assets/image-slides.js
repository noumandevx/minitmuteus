class ImageSlider extends HTMLElement {
  connectedCallback() {
    this.initSwiper();
  }
  initSwiper() {
    new Swiper(this.querySelector('[data-swiper-container]'), {
      pagination: {
        el: this.querySelector('[data-swiper-navigation]'),
        clickable: true,
      },
    });
  }
}

customElements.define('image-slider', ImageSlider);