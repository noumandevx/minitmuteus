function initSwiper() {
  const sliderOptions = {
    slidesPerView: "auto",
    spaceBetween: 10,
    navigation: {
      nextEl: '[data-swiper-button-next]',
      prevEl: '[data-swiper-button-prev]',
    },
    breakpoints: {
      280: {
        slidesPerView: 4,
        spaceBetween: 10,
      },
      360: {
        slidesPerView: 4,
        spaceBetween: 10,
      },
      420: {
        slidesPerView: 5,
        spaceBetween: 10,
      },
      480: {
        slidesPerView: "auto",
        spaceBetween: 10,
      },
      769: {
        slidesPerView: "auto",
        spaceBetween: 10,
      }
    },
    on: {
      init(swiper) {
        const slides = swiper.el.querySelectorAll('[data-swatches-slide]');

        const currentBreakpoint = swiper.currentBreakpoint || Object.keys(swiper.params.breakpoints).pop();
        const slidesPerView = swiper.params.breakpoints[currentBreakpoint]?.slidesPerView || swiper.params.slidesPerView;
        let slidesToCompare;
        if (slidesPerView === 'auto') {
          slidesToCompare = 5;
        } else {
          slidesToCompare = slidesPerView;
        }
        if (slides.length > slidesToCompare) {
          swiper.el.classList.add("product-card__swatches--padding");
          swiper.el.parentElement.classList.add("product-card__swatches--style");
        } else {
          slides.forEach(element => {
            element.style.width = "max-content";
            element.style.margin = 0;
          });
        }
        if (slides.length == 0) {
          swiper.el.parentElement.classList.add('visually-hidden');
        }
      }
    },
  };
  var new_slider = new Swiper('[data-swatches-slider]', sliderOptions);
}

initSwiper();
