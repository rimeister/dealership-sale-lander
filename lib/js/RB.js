/*******************************
Namespacing
*******************************/

var RB = RB || {};


/*******************************
Carousel
*******************************/
RB.Carousel = function(options) {

	var defaultOptions = {
		el: null,
		loop: false,
		transitionTime: 0,
		nav: false,
		callbackOnslideShown: null,
		callbackOnNavBtnClick: null
	}

	this.initialized = false;
	this.currentSlideIndex = 0;
	this.numSlides = 0;
	this.slides = null;
	this.carouselInnerEl = null;
	this.autoPlay = false;
	this.isAutoPlaying = false;
	this.slideDuration = null;

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

RB.Carousel.prototype = {

	constructor: RB.Carousel,


	/*********************************
	***** CAROUSEL PUBLIC METHODS ****
	/********************************/	

	init: function() {

		if (!this.initialized) {

			this.el.classList.remove('loading');

			this.carouselInnerEl = this.el.getElementsByClassName('rb-carousel-inner')[0];
			this.slides = this.carouselInnerEl.children;

			if (this.loop) {
				this.__setupLooping();
			}

			this.numSlides = this.slides.length;

			this.carouselInnerEl.style.width = (100*this.slides.length)+'%';
			this.carouselInnerEl.style.marginLeft = 0;

			// Set the width of each slide
			for (var i = 0; i < this.slides.length; i++) {
				this.slides[i].style.width = (100/this.slides.length)+'%';
			}

			this.__setupMouseEvents();

			this.__setupResizeEvent();

			// If a transition time was specified, set the transition
			if (this.transitionTime > 0) {
				// transition: margin-left 0.5s ease;
				// this.__addTransition();
			}

			if (this.nav) {
				this.__setupNavigation();
			}

			if (this.callbackOnslideShown && typeof this.callbackOnslideShown === 'function') {
				this.callbackOnslideShown(this.currentSlideIndex);
			}

			this.initialized = true;

		}

	},

	showSlide(index,callback) {

	    var startTime;

	    var realWidth = this.el.getBoundingClientRect().width - parseInt(getComputedStyle(this.el,null).getPropertyValue('border-left-width')) - parseInt(getComputedStyle(this.el,null).getPropertyValue('border-right-width'));
	    var scrollTarget = realWidth*index;

	    var startingLeftPos = -1 * parseInt(this.carouselInnerEl.style.marginLeft);

		this.currentSlideIndex = index;

		var animate = function (timestamp) {

			/* If a timestamp was passed in (after first call, is passed in below by requestAnimationFrame when it's recursively called),
			use it, otherwise get the time right now */ 
			var timestamp = timestamp || new Date.getTime();

			// Detemine how long this has been running for
			var runtime = timestamp - startTime;

			// Progress is the percentage from the run time divided by the total duration
			var progress = runtime / this.transitionTime;

			// Return either the perecentage progress, or 1, whichever is smaller
			// Keeps it from going over 1
			progress = Math.min(progress, 1);

			// New position = (target - startingPos) x progress
			this.carouselInnerEl.style.marginLeft = -1 * (parseInt(startingLeftPos) + ( parseInt(scrollTarget) - parseInt(startingLeftPos) ) * progress) + 'px'; 

			// If we haven't reached the end of the duration yet
			if (runtime < this.transitionTime && this.currentSlideIndex === index) {
				
				requestAnimationFrame(function(timestamp){
			    	animate.call(this,timestamp);
				}.bind(this));
				
			} else if (this.currentSlideIndex === index) {
				this.carouselInnerEl.style.marginLeft = -1 * scrollTarget + 'px';

				if (typeof callback !== 'undefined') {
					callback();
				}

				if (this.callbackOnslideShown && typeof this.callbackOnslideShown === 'function') {
					this.callbackOnslideShown(this.currentSlideIndex);
				}
				// callback && callback.call(this);
			}
	      
	    }

	    window.requestAnimationFrame(function(timestamp){

	    	// Get the timestamp from reequestAnimationFrame, or if that's not supported, get time right now from Date
	    	startTime = timestamp || new Date().getTime();

	    	animate.call(this,startTime);

	    }.bind(this));

	},

	nextSlide: function(callback) {

		if (this.loop) {

			// If we're on anything below the duplicate
			if (this.currentSlideIndex < this.numSlides-2) {

				this.showSlide(this.currentSlideIndex+1);

				if (typeof callback === 'function') {
					callback();
				}

			// Otherwise, if its set to loop, and we're at the last slide, the duplicate
			} else if (this.currentSlideIndex == this.numSlides-2) {

				this.__loopToStart();

				if (typeof callback === 'function') {
					callback();
				}

			}

		} else {

			// If we're on anything below the last slide
			if (this.currentSlideIndex < this.numSlides-1) {
				this.showSlide(this.currentSlideIndex+1);

				if (typeof callback === 'function') {
					callback();
				}
			}

		}

	},

	previousSlide: function() {

		if (this.loop) {

			// As long as this isn't the very first slide (which is at index 0)
			if (this.currentSlideIndex > 0) {

				this.showSlide(this.currentSlideIndex-1);

				if (typeof callback === 'function') {
					callback();
				}

			// Otherwise, if its set to loop, and we're at the last slide
			} else if (this.currentSlideIndex == 0) {

				this.__loopToEnd();

				if (typeof callback === 'function') {
					callback();
				}

			}

		} else {

			// As long as this isn't the very first slide (which is at index 0)
			if (this.currentSlideIndex > 0) {

				this.showSlide(this.currentSlideIndex-1);

				if (typeof callback === 'function') {
					callback();
				}

			// Otherwise, if its set to loop, and we're at the last slide
			}

		}


	},

	autoSlide: function(ms,callback) {

		this.autoPlay = true;

		this.slideDuration = ms;

		this.__setupTimer(this.slideDuration,autoPlayHandler.bind(this));
		
		this.__startAuto();

		function autoPlayHandler() {

			if (this.isAutoPlaying) {

				// Since it's autoplaying, go to the next slide
				this.nextSlide();

			}

		}

	},


	/*********************************
	**** CAROUSEL PRIVATE METHODS ****
	/********************************/

	__loopToStart: function() {

		this.showSlide(this.numSlides-1,function(){

			this.carouselInnerEl.style.marginLeft = 0;
			this.currentSlideIndex = 0;
		}.bind(this));

	},

	__loopToEnd: function(){

		// First, jump to the duplicate slide at the end seamlessly
	    var realWidth = this.el.getBoundingClientRect().width - parseInt(getComputedStyle(this.el,null).getPropertyValue('border-left-width')) - parseInt(getComputedStyle(this.el,null).getPropertyValue('border-right-width'));
	
	    // Go to the the last slide, the duplicate
	    var scrollTarget = realWidth*(this.numSlides-1);

	    this.carouselInnerEl.style.marginLeft = -1*scrollTarget+'px';

	    this.currentSlideIndex = this.numSlides-1;

	    // Now that we've jumped seamlessly, instantaneously, to the end duplicate slide, go to the slide before that one
	   setTimeout(function(){
	    	this.showSlide(this.numSlides-2);
	    }.bind(this),0);

	},

	__setupTimer: function(ms,callback) {

		// Timer is for the auto slide
		// Runs every ___ ms
		// This just runs in the background
		function fn() {

			if (typeof callback === 'function') {
				callback();
			}

			setTimeout(fn,ms);
		}

		setTimeout(fn,ms);

	},

	// Auto-playing
	__startAuto: function() {
		this.isAutoPlaying = true;
	},
	
	__stopAuto: function() {
		this.isAutoPlaying = false;
	},


	// Looping (so the slides go in a circle)
	__setupLooping: function() {

		// Clone the first slide as the last slide
		if(this.slides.length){
		
			var cloneOfFirstSlide = this.slides[0].cloneNode(true);
			this.carouselInnerEl.appendChild(cloneOfFirstSlide);

		}

	},

	// Navigation
	__setupNavigation: function() {

		var leftBtn = this.el.getElementsByClassName('rb-carousel-nav-btn-left')[0];
		var rightBtn = this.el.getElementsByClassName('rb-carousel-nav-btn-right')[0];

		if (typeof leftBtn !== 'undefined') {

			leftBtn.addEventListener('click', function(event) {
				event.preventDefault();
				this.isAutoPlaying = false;
				this.previousSlide();
				if (typeof this.callbackOnNavBtnClick === 'function'){this.callbackOnNavBtnClick('left');}
			}.bind(this));

		}

		if (typeof rightBtn !== 'undefined') {

			rightBtn.addEventListener('click', function(event) {
				event.preventDefault();
				this.isAutoPlaying = false;
				this.nextSlide();
				if (typeof this.callbackOnNavBtnClick){this.callbackOnNavBtnClick('right');}
			}.bind(this));

		}

	},

	__showNavigation: function() {
		// var carouselNav = this.el.getElementsByClassName('rb-carousel-nav')[0];

		var carouselNavBtns = this.el.getElementsByClassName('rb-carousel-nav-btn');

		for (var i = 0; i < carouselNavBtns.length; i++) {
			carouselNavBtns[i].style.display = 'block';
		}

		setTimeout(function(){
			this.el.classList.add('nav-active');				
		}.bind(this),100);

	},
	
	__hideNavigation: function() {

		var carouselNavBtns = this.el.getElementsByClassName('rb-carousel-nav-btn');

		this.el.classList.remove('nav-active');

		setTimeout(function(){

			for (var i = 0; i < carouselNavBtns.length; i++) {
				carouselNavBtns[i].style.display = 'none';
			}

		},0);

	},

	// Events
	__setupMouseEvents: function() {
		
		function mouseEnterHandler() {

			this.__showNavigation();

			if (this.autoPlay) {
				this.__stopAuto();
			}

		}
		
		function mouseExitHandler() {

			this.__hideNavigation();

			// Set a one second delay before resuming the slideshow
			setTimeout(function(){

				if (this.autoPlay) {
					this.__startAuto();
				}

			}.bind(this), 1000);

		}

		this.el.addEventListener('mouseenter',mouseEnterHandler.bind(this));
		
		this.el.addEventListener('mouseleave',mouseExitHandler.bind(this));

	},

	__setupResizeEvent: function() {

		var breakPointCheck = document.getElementById('check-breakpoint');

		if (typeof breakPointCheck === 'undefined') {
			breakPointCheck = document.createElement('div');
			breakPointCheck.id = 'check-breakpoint';
			document.body.appendChild(breakPointCheck);
		}

		var breakPointCheckOpacity;

		var previousBreakpointOpacity = null;

		window.addEventListener('resize',function(){

		breakPointCheckOpacity = window.getComputedStyle(breakPointCheck).getPropertyValue("opacity");

			// If the breakpoint has changed
			if (breakPointCheckOpacity != previousBreakpointOpacity) {

			    var realWidth = this.el.getBoundingClientRect().width - parseInt(getComputedStyle(this.el,null).getPropertyValue('border-left-width')) - parseInt(getComputedStyle(this.el,null).getPropertyValue('border-right-width'));

				// Set the margin for the current slide to where it should be
		   		var scrollTarget = realWidth*(this.currentSlideIndex);
			    this.carouselInnerEl.style.marginLeft = -1*scrollTarget+'px';

				previousBreakpointOpacity = breakPointCheckOpacity;
		
			}

		}.bind(this));
	},

	// Slide transitions
	__addTransition: function() {
		// this.carouselInnerEl.style.transition = 'margin-left '+this.transitionTime+'ms ease';
	},

	__removeTransition: function() {
		// this.carouselInnerEl.style.transition = 'margin-left 0ms ease';
	}

}