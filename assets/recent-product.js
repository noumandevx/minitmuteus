if (!customElements.get('recent-product')) {
  customElements.define(
    'recent-product',
    class RecentProduct extends HTMLElement {
      constructor() {
        super();
      }

      connectedCallback() {
        const recentSlider = {
          slidesPerView: "auto",
          slidesPerGroup: 1,
          spaceBetween: 10.89,
          navigation: {
            nextEl: '[data-swiper-button-next]',
            prevEl: '[data-swiper-button-prev]',
          },
          breakpoints: {
            280: {
              slidesPerView: 2,
              spaceBetween: 10.89,
            },
            769: {
              slidesPerView: 4,
              spaceBetween: 10.89,
            }
          },
        };
        var new_slider = new Swiper('[data-recent-slider]', recentSlider);
      }
    }
  );
}