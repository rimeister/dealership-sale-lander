/*******************************
Namespacing
*******************************/

var NAMESPACE = NAMESPACE || {};


/*******************************
Carousel
*******************************/

NAMESPACE.Carousel = function(options) {

	var defaultOptions = {
		el: null,
		showBtns: false
	}

	this.initialized = false;
	this.currentSlideIndex = 0;
	this.timer = null;
	this.numSlides = 0;

	// If the property passed in is not in the default options 
	for (var key in options) {

		// If the key passed in was not defined in the default options above, throw an error
		if (typeof defaultOptions[key] === 'undefined') {
			throw "Unkown property " + key + " was passed into the Carousel constructor";
		} 

	}

	// For each of the default options specified
	for (var key in defaultOptions) {

		// If the required key was not passed in
		if (typeof options[key] === 'undefined') {
			// Set its value to te default value
			options[key] = defaultOptions[key];
		}

		// Now that this either has the value passed in, or is set to the default value,
		// Assign it as a property to this instance
		this[key] = options[key];

	}

}

NAMESPACE.Carousel.prototype = {
	
	constructor: NAMESPACE.Carousel,

	// PUBLIC METHODS
	init: function() {

		if (!this.initialized) {

			this.el.classList.remove('loading');

			var carouselInnerEl = this.el.getElementsByClassName('carousel-inner')[0];
			var slides = carouselInnerEl.children;

			this.numSlides = slides.length;

			carouselInnerEl.style.width = (100*slides.length)+'%';

			// Set the width of each slide
			for (var i = 0; i < slides.length; i++) {
				slides[i].style.width = (100/slides.length)+'%';
			}
			
			// Nav buttons
			if (this.showBtns) {
				
				var nav = document.creatElement('div');
				nav.classList.add('carousel-nav');

				// Construct html for buttons here
				this.el.appendChild(nav);
			}

			this.initialized = true;

		}

	},

	showSlide(index) {

		// Set the margin left on the inner wrapper
		var carouselInnerEl = this.el.getElementsByClassName('carousel-inner')[0];
		carouselInnerEl.style.marginLeft = '-'+(100*index)+'%';

		this.currentSlideIndex = index;

	},

	nextSlide: function(callback) {

		// e.g., if currentSlideIndex = 1, and numSlides = 3, then 1 < 2 (this.numSlides - 1)
		// If if currentSlideIndex = 12 and numSlides = 3, then 2 is not < 2 ). We are at the end.
		if (this.currentSlideIndex < this.numSlides-1) {
			this.showSlide(this.currentSlideIndex+1);

			if (typeof callback === 'function') {
				callback();
			}

		}

	},

	previousSlide: function() {
		this.showSlide(this.currentSlideIndex-1);
	},

	startAutoSlide: function(ms,callback) {

		// If there is no existing timer
		if (!this.timer) {
			// If a callback function was passed in
			this._nextSlideTimerFn.callback = callback;
			// Set an interval
			this.timer = setInterval(this._nextSlideTimerFn.bind(this),ms);
		} else {
			clearInterval(this.timer);	
			this.timer = null;
			this.startAutoSlide(ms);
		}

	},
	stopAutoSlide: function() {
		clearInterval(this.timer);
		this.timer = null;
	},

	// PRIVATE METHODS
	_nextSlideTimerFn: function(){
		this.nextSlide(this._nextSlideTimerFn.callback);	
	}
}

// Reference for Javascript carousel: https://www.w3schools.com/howto/howto_js_slideshow.asp