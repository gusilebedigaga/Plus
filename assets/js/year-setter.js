class YearSetter {
  selectors = {
    year: "[data-js-year]",
  };

  constructor() {
    this.yearElement = document.querySelector(this.selectors.year);
    this.setYear();
  }

  setYear = () => {
    const currentYear = new Date().getFullYear();
    this.yearElement.textContent = currentYear;
  };
}

new YearSetter();
