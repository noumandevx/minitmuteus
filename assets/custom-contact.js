document.addEventListener("DOMContentLoaded", function() {
  const dropdown = document.querySelector("[data-dropdown]");
  const dropdownToggle = dropdown.querySelector("[data-dropdown-toggle]");
  const dropdownMenu = dropdown.querySelector("[data-dropdown-menu]");
  const selectedValueInput = document.querySelector("[data-selected-value]");
  const submit = document.querySelector("[data-submit]");
  const checkboxTerm = document.querySelector("[data-checkbox-term]");
  const checkboxConcent = document.querySelector("[data-checkbox-concent]");
  let selectedItem = null;

  dropdownToggle.addEventListener("click", function() {
    dropdown.classList.toggle("dropdown--open");
  });

  dropdownMenu.querySelectorAll("[data-value]").forEach(item => {
    item.addEventListener("click", function() {
      if (selectedItem) {
        selectedItem.classList.remove("dropdown__item--selected");
      }

      this.classList.add("dropdown__item--selected");
      selectedItem = this;
      dropdownToggle.querySelector("span").textContent = this.textContent;
      selectedValueInput.value = this.getAttribute("data-value");
      dropdown.classList.remove("dropdown--open");
      submit.removeAttribute("disabled");
    });
  });

  document.addEventListener("click", function(event) {
    if (!dropdown.contains(event.target)) {
      dropdown.classList.remove("dropdown--open");
    }
  });

  // Function to enable/disable submit button based on checkbox state
  function toggleSubmitButton() {
    if (checkboxTerm.checked && checkboxConcent.checked) {
      submit.classList.remove("custom-contact__submit--disabled");
    } else {
      submit.classList.add("custom-contact__submit--disabled");
    }
  }

  // Add event listeners to checkboxes
  checkboxTerm.addEventListener("change", toggleSubmitButton);
  checkboxConcent.addEventListener("change", toggleSubmitButton);
});
