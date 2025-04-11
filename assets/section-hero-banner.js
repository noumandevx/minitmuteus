if (!customElements.get('hero-banner')) {
  customElements.define(
    'hero-banner',
    class HeroBanner extends HTMLElement {
      constructor() {
        super();
        const heroSlider = this.querySelector('[hero-slider]');
        var swiper = new Swiper(heroSlider, {
          loop: false,
          freeMode: false,
          speed: 800,
          draggable: true,
        });
        
      }
    }
  );
}
