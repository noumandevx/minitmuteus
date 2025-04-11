class RegisterForm extends HTMLElement {
  constructor() {
    super();
    this.init();
  }

  init() {
    document.addEventListener("click", this.handleDocumentClick.bind(this));
    document.addEventListener("click", this.handleDropValueClick.bind(this));
    document.addEventListener("click", this.handleScrollDownClick.bind(this));
    this.initInputValidations();
  }

  handleDocumentClick(event) {
    const dobDrops = document.querySelectorAll("[data-dob-drop]");
    const clickedDrop = event.target.closest("[data-dob-drop]");
    const dobWrapper = event.target.closest("[data-dob-wrapper]");
    const scrollButton = event.target.closest("[data-scroll-down]");

    if (dobWrapper || scrollButton) {
      if (clickedDrop) {
        dobDrops.forEach(drop => {
          if (drop !== clickedDrop) {
            drop.classList.remove("customer__dob-field--active");
          }
        });
        clickedDrop.classList.add("customer__dob-field--active");
      }
    } else {
      dobDrops.forEach(drop => drop.classList.remove("customer__dob-field--active"));
    }
  }

  handleDropValueClick(event) {
    const dropValue = event.target.closest("[data-drop-value]");
    if (dropValue) {
      const parentDrop = dropValue.closest("[data-dob-drop]");
      if (parentDrop) {
        parentDrop.querySelectorAll("[data-drop-value]").forEach(item => {
          item.removeAttribute("data-checked");
        });
        dropValue.setAttribute("data-checked", "true");

        const selectedVal = parentDrop.querySelector("[data-selected-val]");
        if (selectedVal) {
          selectedVal.textContent = dropValue.getAttribute("data-drop-value");
        }

        parentDrop.classList.remove("customer__dob-field--active");
        this.updateFullDOB();

        // Handle month selection for days dropdown
        if (dropValue.hasAttribute("data-drop-month")) {
          const monthValue = parseInt(dropValue.getAttribute("data-drop-value"), 10);
          const daysDropdown = document.querySelector("[data-drop-down-days]");
          if (daysDropdown) {
            daysDropdown.classList.remove("customer__dob-dropdown--all", "customer__dob-dropdown--29", "customer__dob-dropdown--30");
            if ([1, 3, 5, 7, 8, 10, 12].includes(monthValue)) {
              daysDropdown.classList.add("customer__dob-dropdown--all");
            } else if (monthValue === 2) {
              daysDropdown.classList.add("customer__dob-dropdown--29");
            } else {
              daysDropdown.classList.add("customer__dob-dropdown--30");
            }
          }
        }
      }
    }
  }

  handleScrollDownClick(event) {
    const scrollButton = event.target.closest("[data-scroll-down]");
    if (scrollButton) {
      const dropdownList = scrollButton.nextElementSibling;
      if (dropdownList && dropdownList.matches("[data-dropdown-list]")) {
        const maxScroll = dropdownList.scrollHeight - dropdownList.clientHeight;
        dropdownList.scrollBy({ top: 100, behavior: "smooth" });

        setTimeout(() => {
          if (dropdownList.scrollTop + dropdownList.clientHeight >= dropdownList.scrollHeight) {
            scrollButton.classList.remove("customer__dob-arrow--active");
          }
        }, 300);

        dropdownList.addEventListener("scroll", () => {
          if (dropdownList.scrollTop < maxScroll) {
            scrollButton.classList.add("customer__dob-arrow--active");
          } else {
            scrollButton.classList.remove("customer__dob-arrow--active");
          }
        });
      }
    }
  }

  updateFullDOB() {
    const selectedVals = document.querySelectorAll("[data-selected-val]");
    const fullDobInput = document.querySelector("input[data-full-dob]");
    const submitButton = document.querySelector("[data-submit]");

    if (selectedVals.length === 3) {
      const values = Array.from(selectedVals).map(val => val.textContent.trim());
      if (values.every(value => value !== "")) {
        fullDobInput.value = values.join("-");
        submitButton.removeAttribute("disabled");
      } else {
        submitButton.setAttribute("disabled", "true");
      }
    }
  }

  initInputValidations() {
    document.querySelectorAll("[data-text-input]").forEach(input => {
      input.addEventListener("input", function () {
        this.value = this.value.replace(/[^A-Za-z]/g, "");
      });
    });

    document.querySelectorAll("[data-email-input]").forEach(input => {
      input.addEventListener("input", function () {
        this.value = this.value.replace(/[^A-Za-z0-9@._-]/g, "");
      });
    });

    // Validate password with strict rules
    document.querySelectorAll("[data-password]").forEach(input => {
      input.addEventListener("input", function () {
        const parentField = input.closest("[data-field]");
        const value = input.value;
        
        // Password conditions
        const lengthValid = value.length >= 10 && value.length <= 16;
        const hasTwoAlphabets = (value.match(/[A-Za-z]/g) || []).length >= 2;
        const hasNumber = /[0-9]/.test(value);
        const hasSpecialChar = /[!@#$%^&*()_+\[\]{};':"\\|,.<>?/-]/.test(value);

        if (lengthValid && hasTwoAlphabets && hasNumber && hasSpecialChar) {
          parentField.classList.remove("field--error");
        } else {
          parentField.classList.add("field--error");
        }
      });
    });
  }
}

customElements.define("register-form", RegisterForm);
