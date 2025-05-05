class Slider {
  selectors = {
    slider: "[data-js-slider]",
    slide: "[data-js-slide]",
    paginationButton: "[data-js-pagination-button]",
    wrapper: "[data-js-wrapper]",
    info: "[data-js-info]",
  };

  constructor(containerSelector = null) {
    this.slider = containerSelector
      ? document.querySelector(containerSelector)
      : document.querySelector(this.selectors.slider);

    if (!this.slider) return;

    this.slides = Array.from(
      this.slider.querySelectorAll(this.selectors.slide)
    );
    this.paginationButtons = Array.from(
      this.slider.querySelectorAll(this.selectors.paginationButton)
    );
    this.sliderWrapper = this.slider.querySelector(this.selectors.wrapper);
    this.sliderInfoElements = this.slider.querySelectorAll(this.selectors.info);

    this.settings = {
      autoPlayInterval: 5000,
      transitionDuration: 600,
      minSwipeDistance: 50,
    };

    this.state = {
      currentIndex: 0,
      isAnimating: false,
      autoPlayTimer: null,
      isAutoPlayPaused: false,
      touchStartX: 0,
      touchEndX: 0,
    };

    this.init();
  }

  init() {
    this.setActiveSlide(this.state.currentIndex);
    this.bindEvents();
    this.startAutoPlay();
    this.enableHardwareAcceleration();
  }

  enableHardwareAcceleration() {
    this.slides.forEach((slide) => {
      slide.style.willChange = "transform, opacity";
    });
  }

  bindEvents() {
    this.paginationButtons.forEach((button, index) => {
      button.addEventListener("click", () => this.goToSlide(index));
    });

    this.sliderWrapper.addEventListener(
      "touchstart",
      (e) => this.handleTouchStart(e),
      { passive: true }
    );
    this.sliderWrapper.addEventListener(
      "touchend",
      (e) => this.handleTouchEnd(e),
      { passive: false }
    );

    this.sliderInfoElements.forEach((info) => {
      info.addEventListener("mouseenter", () => this.pauseAutoPlay());
      info.addEventListener("mouseleave", () => this.resumeAutoPlay());
    });
  }

  handleTouchStart(e) {
    this.state.touchStartX = e.changedTouches[0].screenX;
  }

  handleTouchEnd(e) {
    this.state.touchEndX = e.changedTouches[0].screenX;
    const swipeDistance = this.state.touchStartX - this.state.touchEndX;

    if (Math.abs(swipeDistance) < this.settings.minSwipeDistance) return;

    e.preventDefault();

    if (swipeDistance > 0) {
      this.nextSlide();
    } else {
      this.prevSlide();
    }
  }

  startAutoPlay() {
    if (this.state.autoPlayTimer) {
      clearTimeout(this.state.autoPlayTimer);
    }

    this.state.autoPlayTimer = setTimeout(() => {
      this.nextSlide();
      this.startAutoPlay();
    }, this.settings.autoPlayInterval);
  }

  pauseAutoPlay() {
    if (this.state.autoPlayTimer) {
      this.state.isAutoPlayPaused = true;
      clearTimeout(this.state.autoPlayTimer);
    }
  }

  resumeAutoPlay() {
    if (this.state.isAutoPlayPaused) {
      this.state.isAutoPlayPaused = false;
      this.startAutoPlay();
    }
  }

  goToSlide(index) {
    if (this.state.isAnimating || index === this.state.currentIndex) return;

    const direction = index > this.state.currentIndex ? "next" : "prev";
    this.state.currentIndex = index;
    this.animateSlides(direction);
    this.updatePagination();
    this.resetAutoPlay();
  }

  nextSlide() {
    if (this.state.isAnimating) return;

    const nextIndex = (this.state.currentIndex + 1) % this.slides.length;
    this.state.currentIndex = nextIndex;
    this.animateSlides("next");
    this.updatePagination();
  }

  prevSlide() {
    if (this.state.isAnimating) return;

    const prevIndex =
      (this.state.currentIndex - 1 + this.slides.length) % this.slides.length;
    this.state.currentIndex = prevIndex;
    this.animateSlides("prev");
    this.updatePagination();
  }

  resetAutoPlay() {
    if (this.state.autoPlayTimer) {
      clearTimeout(this.state.autoPlayTimer);
      this.startAutoPlay();
    }
  }

  animateSlides(direction) {
    this.state.isAnimating = true;

    const currentSlide = this.slides.find((slide) =>
      slide.classList.contains("slider__slide--active")
    );
    const nextSlide = this.slides[this.state.currentIndex];

    currentSlide.style.transition = `transform ${this.settings.transitionDuration}ms ease-in-out, opacity ${this.settings.transitionDuration}ms ease-in-out`;
    nextSlide.style.transition = `transform ${this.settings.transitionDuration}ms ease-in-out, opacity ${this.settings.transitionDuration}ms ease-in-out`;

    if (direction === "next") {
      nextSlide.style.transform = "translateX(100%)";
    } else {
      nextSlide.style.transform = "translateX(-100%)";
    }

    nextSlide.style.display = "flex";
    nextSlide.style.opacity = "0";
    nextSlide.classList.add("slider__slide--animating");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (direction === "next") {
          currentSlide.style.transform = "translateX(-100%)";
        } else {
          currentSlide.style.transform = "translateX(100%)";
        }
        currentSlide.style.opacity = "0";

        nextSlide.style.transform = "translateX(0)";
        nextSlide.style.opacity = "1";
      });
    });

    setTimeout(() => {
      currentSlide.classList.remove(
        "slider__slide--active",
        "slider__slide--animating"
      );
      currentSlide.style.display = "none";
      currentSlide.style.transform = "";
      currentSlide.style.opacity = "";
      currentSlide.style.transition = "";

      nextSlide.classList.add("slider__slide--active");
      nextSlide.classList.remove("slider__slide--animating");
      nextSlide.style.transform = "";
      nextSlide.style.transition = "";

      this.state.isAnimating = false;
    }, this.settings.transitionDuration);
  }

  setActiveSlide(index) {
    this.slides.forEach((slide, i) => {
      if (i === index) {
        slide.classList.add("slider__slide--active");
        slide.style.display = "flex";
      } else {
        slide.classList.remove("slider__slide--active");
        slide.style.display = "none";
      }
    });

    this.updatePagination();
  }

  updatePagination() {
    this.paginationButtons.forEach((button, index) => {
      if (index === this.state.currentIndex) {
        button.classList.add("is-current");
      } else {
        button.classList.remove("is-current");
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new Slider();
});
