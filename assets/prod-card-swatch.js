document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("click", (event) => {
    const clickedSwatch = event.target.closest("[data-custom-option-value]");
    if (!clickedSwatch) return;

    const clickedSwatchWrapper = clickedSwatch.closest("[data-custom-options]");
    if (!clickedSwatchWrapper) return;

    clickedSwatchWrapper.querySelectorAll("[data-custom-option-value]").forEach(value => value.classList.remove("is-selected"));
    clickedSwatch.classList.add("is-selected");


    let newVariantTitle = clickedSwatch.getAttribute('data-swatch-value');

    const parentLi = clickedSwatch.closest("[data-prod-card]");
    const NewURL = clickedSwatch.closest("[data-swatch-url]");

    if (!parentLi) return;

    if (NewURL) {
      let allLinks = parentLi.querySelectorAll('[data-card-product-link]');
      allLinks.forEach(function(link) {
        link.setAttribute('href', NewURL.getAttribute('data-swatch-url'));
      });
    }

    let variantTitle = parentLi.querySelector('[data-custom-option-title]');
    if (variantTitle) {
      variantTitle.textContent = newVariantTitle;
    }

    const variantImage = clickedSwatch.getAttribute("variant-image");
    if (!variantImage) return;

    const srcset = `
    ${variantImage};width=165 165w,
    ${variantImage};width=360 360w,
    ${variantImage};width=533 533w,
    ${variantImage};width=720 720w,
    ${variantImage};width=940 940w
    `.trim();

    parentLi.querySelectorAll("[data-product-image-main], [data-product-image-second]").forEach(img => {
      img.src = variantImage;
      img.srcset = srcset;
    });

    const cardNormalPrice = parentLi.querySelector("[data-normal-price]");
    const cardRegularPrice = parentLi.querySelector("[data-regular-price]");
    const cardCompareAtPrice = parentLi.querySelector("[data-compare-price]");
    const variantPrice = clickedSwatch.getAttribute("data-variant-price");
    const variantComparePrice = clickedSwatch.getAttribute("data-variant-compare-price");

    if (variantComparePrice) {
      if (cardCompareAtPrice) cardCompareAtPrice.textContent = variantComparePrice;
      if (cardRegularPrice) cardRegularPrice.textContent = variantPrice;
    } else {
      if (cardCompareAtPrice) cardCompareAtPrice.textContent = "";
      if (cardNormalPrice) cardNormalPrice.textContent = variantPrice;
    }
  });
});