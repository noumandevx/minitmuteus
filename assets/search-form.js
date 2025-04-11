class SearchForm extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input[type="search"]');
    this.resetButton = this.querySelector('button[type="reset"]');

    if (this.input) {
      this.input.form.addEventListener('reset', this.onFormReset.bind(this));
      this.input.addEventListener(
        'input',
        debounce((event) => {
          this.onChange(event);
        }, 300).bind(this)
      );
    }
  }

  toggleResetButton() {
    const resetIsHidden = this.resetButton.classList.contains('hidden');
    
    if (this.input.value.length > 0 && resetIsHidden) {
      this.resetButton.style.opacity = '0';
      this.resetButton.style.transform = 'translateX(10px)';
      this.resetButton.classList.remove('hidden');
      
      this.resetButton.offsetHeight;
      
      this.resetButton.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      this.resetButton.style.opacity = '1';
      this.resetButton.style.transform = 'translateX(0)';
    } else if (this.input.value.length === 0 && !resetIsHidden) {
      this.resetButton.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      this.resetButton.style.opacity = '0';
      this.resetButton.style.transform = 'translateX(10px)';
      
      setTimeout(() => {
        this.resetButton.classList.add('hidden');
      }, 300);
    }
  }

  onChange() {
    this.toggleResetButton();
  }

  shouldResetForm() {
    return !document.querySelector('[aria-selected="true"] a');
  }

  onFormReset(event) {
    // Prevent default so the form reset doesn't set the value gotten from the url on page load
    event.preventDefault();
    // Don't reset if the user has selected an element on the predictive search dropdown
    if (this.shouldResetForm()) {
      this.input.value = '';
      this.input.focus();
      this.toggleResetButton();
    }
  }
}

customElements.define('search-form', SearchForm);
