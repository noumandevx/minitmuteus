function getQueryParam(param) {
  let params = new URLSearchParams(window.location.search);
  return params.get(param);
}

document.addEventListener('DOMContentLoaded', function () {
  const accordions = document.querySelectorAll('[data-accordions-headers]');

  accordions.forEach((accordion) => {
    let value = getQueryParam('sr');
    let dataValue = accordion.dataset.accordionsHeaders;
    dataValue = dataValue.toLowerCase().split(" ")[0];

    if (value == dataValue) {
      const content = accordion.nextElementSibling;
      toggleAccordion(accordion, content);
    }

    accordion.addEventListener('click', function () {
      const content = this.nextElementSibling;
      toggleAccordion(this, content);
    });
  });

  function toggleAccordion(accordion, content) {
    accordions.forEach((otherAccordion) => {
      if (otherAccordion !== accordion) {
        const otherContent = otherAccordion.nextElementSibling;
        otherContent.style.maxHeight = '0';
        otherAccordion.setAttribute('aria-expanded', 'false');
        otherContent.setAttribute('aria-hidden', 'true');
      }
    });

    if (content.style.maxHeight === '0px' || !content.style.maxHeight) {
      content.style.maxHeight = content.scrollHeight + 'px';
      accordion.setAttribute('aria-expanded', 'true');
      content.setAttribute('aria-hidden', 'false');
    } else {
      content.style.maxHeight = '0';
      accordion.setAttribute('aria-expanded', 'false');
      content.setAttribute('aria-hidden', 'true');
    }
  }
});