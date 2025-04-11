class FeaturedProductSlider extends HTMLElement {
  constructor() {
    super();
    this.initSwiper();
  }

  connectedCallback() {
    this.initSwiper();
  }

  initSwiper() {
    const desktopCols = this.getAttribute("data-desktop-cols");
    const mobileCols = this.getAttribute("data-mobile-cols");
    const intMobile = parseInt(mobileCols);
    const intDesktop = parseInt(desktopCols);

    new Swiper(this.querySelector("[data-featured-product-slider]"), {
      slidesPerView: 1,
      spaceBetween: 17,
      pagination: {
        el: ".swiper-pagination",
        clickable: true
      },
      navigation: {
        nextEl: "[data-featured-slider-next]",
        prevEl: "[data-featured-slider-prev]",
      },
      breakpoints: {
        1199: {
          slidesPerView: 2,
          spaceBetween: 17
        },
      },
    });
  }
}

customElements.define("featured-product-slider", FeaturedProductSlider);