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

            this.carouselInnerEl.style.width = (100 * this.slides.length) + '%';
            this.carouselInnerEl.style.left = 0;

            // Set the width of each slide
            for (var i = 0; i < this.slides.length; i++) {
                this.slides[i].style.width = (100 / this.slides.length) + '%';
            }

            this.__setupMouseEvents();

            this.__setupTouchEvents();

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

            this.breakPointCheck = document.createElement('div');
            this.breakPointCheck.classList.add('rb-check-breakpoint');
            this.el.appendChild(this.breakPointCheck);

            this.carouselInnerEl.addEventListener('transitionend', this.checkIndex);

            this.allowSlide = true;

            this.initialized = true;

        }

    },

    showSlide: function(index, callback, action) {

        var slideWidth = this.el.getBoundingClientRect().width - parseInt(getComputedStyle(this.el, null).getPropertyValue('border-left-width')) - parseInt(getComputedStyle(this.el, null).getPropertyValue('border-right-width'));
        var scrollTarget = slideWidth * index;
        var startingLeftPos = -1 * parseInt(this.carouselInnerEl.style.left);

        this.carouselInnerEl.classList.add('is-sliding');
        
        if (this.allowSlide) {

            if (!action) { startingLeftPos = this.carouselInnerEl.offsetLeft; }

            this.carouselInnerEl.style.left = (startingLeftPos - slideWidth) + "px";
                   
        };
        
        this.allowSlide = false;

    },

    checkIndex: function (){

        var slideWidth = this.el.getBoundingClientRect().width - parseInt(getComputedStyle(this.el, null).getPropertyValue('border-left-width')) - parseInt(getComputedStyle(this.el, null).getPropertyValue('border-right-width'));

        this.carouselInnerEl.classList.remove('shifting');

        if (index == -1) {
          this.carouselInnerEl.style.left = -(this.slides.length * slideWidth) + "px";
          index = this.slides.length - 1;
        }

        if (index == this.slides.length) {
          this.carouselInnerEl.style.left = -(1 * slideWidth) + "px";
          index = 0;
        }

        this.allowSlide = true;
    },

    nextSlide: function(callback) {

        if (this.loop) {

            // If we're on anything below the duplicate
            if (this.currentSlideIndex < this.numSlides - 2) {

                this.showSlide(this.currentSlideIndex + 1);

                if (typeof callback === 'function') {
                    callback();
                }

                // Otherwise, if its set to loop, and we're at the last slide, the duplicate
            } else if (this.currentSlideIndex == this.numSlides - 2) {

                this.__loopToStart();

                if (typeof callback === 'function') {
                    callback();
                }

            }

        } else {

            // If we're on anything below the last slide
            if (this.currentSlideIndex < this.numSlides - 1) {
                this.showSlide(this.currentSlideIndex + 1);

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

                this.showSlide(this.currentSlideIndex - 1);

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

                this.showSlide(this.currentSlideIndex - 1);

                if (typeof callback === 'function') {
                    callback();
                }

                // Otherwise, if its set to loop, and we're at the last slide
            }

        }


    },

    autoSlide: function(ms, callback) {

        this.autoPlay = true;

        this.slideDuration = ms;

        this.__setupTimer(this.slideDuration, autoPlayHandler.bind(this));

        this.__startAuto();

        function autoPlayHandler() {

            if (this.isAutoPlaying) {

                // Since it's autoplaying, go to the next slide
                this.nextSlide();

            }

        }

    },

    stop: function() {
        this.__stopAuto();
    },

    start: function() {
        this.__startAuto();
    },    

    /*********************************
    **** CAROUSEL PRIVATE METHODS ****
    /********************************/

    __loopToStart: function() {

        this.showSlide(this.numSlides - 1, function() {

            this.carouselInnerEl.style.left = 0;
            this.currentSlideIndex = 0;
        }.bind(this));

    },

    __loopToEnd: function() {

        // First, jump to the duplicate slide at the end seamlessly
        var realWidth = this.el.getBoundingClientRect().width - parseInt(getComputedStyle(this.el, null).getPropertyValue('border-left-width')) - parseInt(getComputedStyle(this.el, null).getPropertyValue('border-right-width'));

        // Go to the the last slide, the duplicate
        var scrollTarget = realWidth * (this.numSlides - 1);

        this.carouselInnerEl.style.left = -1 * scrollTarget + 'px';

        this.currentSlideIndex = this.numSlides - 1;

        // Now that we've jumped seamlessly, instantaneously, to the end duplicate slide, go to the slide before that one
        setTimeout(function() {
            this.showSlide(this.numSlides - 2);
        }.bind(this), 0);

    },

    __setupTimer: function(ms, callback) {

        // Timer is for the auto slide
        // Runs every ___ ms
        // This just runs in the background
        function fn() {

            if (typeof callback === 'function') {
                callback();
            }

            setTimeout(fn, ms);
        }

        setTimeout(fn, ms);

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

        // Clone the first and last slide
        if (this.slides.length) {

            var cloneOfFirstSlide = this.slides[0].cloneNode(true);
            var cloneOfLastSlide = this.slides[this.slides.length-1].cloneNode(true);
            this.carouselInnerEl.appendChild(cloneOfFirstSlide);
            this.carouselInnerEl.insertBefore(cloneOfLastSlide,cloneOfFirstSlide);

        }

    },

    // Navigation
    __setupNavigation: function() {

        var leftBtn = this.el.getElementsByClassName('rb-carousel-nav-btn-left')[0];
        var rightBtn = this.el.getElementsByClassName('rb-carousel-nav-btn-right')[0];

        if (typeof leftBtn !== 'undefined') {

            leftBtn.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                this.isAutoPlaying = false;
                this.previousSlide();
                if (typeof this.callbackOnNavBtnClick === 'function') { this.callbackOnNavBtnClick('left'); }
            }.bind(this));

        }

        if (typeof rightBtn !== 'undefined') {

            rightBtn.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                this.isAutoPlaying = false;
                this.nextSlide();
                if (typeof this.callbackOnNavBtnClick) { this.callbackOnNavBtnClick('right'); }
            }.bind(this));

        }

    },

    __showNavigation: function() {
        // var carouselNav = this.el.getElementsByClassName('rb-carousel-nav')[0];

        var carouselNavBtns = this.el.getElementsByClassName('rb-carousel-nav-btn');

        for (var i = 0; i < carouselNavBtns.length; i++) {
            carouselNavBtns[i].style.display = 'block';
        }

        setTimeout(function() {
            this.el.classList.add('nav-active');
        }.bind(this), 100);

    },

    __hideNavigation: function() {

        var carouselNavBtns = this.el.getElementsByClassName('rb-carousel-nav-btn');

        this.el.classList.remove('nav-active');

        setTimeout(function() {

            for (var i = 0; i < carouselNavBtns.length; i++) {
                carouselNavBtns[i].style.display = 'none';
            }

        }, 0);

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
            setTimeout(function() {

                if (this.autoPlay) {
                    this.__startAuto();
                }

            }.bind(this), 1000);

        }

        this.el.addEventListener('mouseenter', mouseEnterHandler.bind(this));

        this.el.addEventListener('mouseleave', mouseExitHandler.bind(this));

    },

    __setupResizeEvent: function() {

        var previousBreakpointOpacity = null;

        window.addEventListener('resize', function() {

            this.breakPointCheckOpacity = window.getComputedStyle(this.breakPointCheck).getPropertyValue("opacity");

            // If the breakpoint has changed
            if (this.breakPointCheckOpacity != previousBreakpointOpacity) {

                var realWidth = this.el.getBoundingClientRect().width - parseInt(getComputedStyle(this.el, null).getPropertyValue('border-left-width')) - parseInt(getComputedStyle(this.el, null).getPropertyValue('border-right-width'));

                // Set the margin for the current slide to where it should be
                var scrollTarget = realWidth * (this.currentSlideIndex);
                this.carouselInnerEl.style.left = -1 * scrollTarget + 'px';

                previousBreakpointOpacity = this.breakPointCheckOpacity;

            }

        }.bind(this));
    },

    __setupTouchEvents: function() {

        var xPosition1 = 0,
          xPosition2 = 0,
          posInitial,
          posFinal,
          threshold = 100;

        var _this = this;

        function dragStart(event) {
            event = event || window.event;
            event.preventDefault();
            posInitial = _this.carouselInnerEl.offsetLeft;

            if (event.type == 'touchstart') {
              xPosition1 = event.touches[0].clientX;
            } else {
              xPosition1 = event.clientX;
              document.onmouseup = dragEnd;
              document.onmousemove = dragAction;
            }
        }

        function dragAction(event) {

            event = event || window.event;
            
            if (event.type == 'touchmove') {
              xPosition2 = xPosition1 - event.touches[0].clientX;
              xPosition1 = event.touches[0].clientX;
            } else {
              xPosition2 = xPosition1 - event.clientX;
              xPosition1 = event.clientX;
            }
            _this.carouselInnerEl.style.left = (_this.carouselInnerEl.offsetLeft - xPosition2) + "px";
            
        }

        function dragEnd(event) {
            
            posFinal = _this.carouselInnerEl.offsetLeft;
            if (posFinal - posInitial < -threshold) {
             _this.nextSlide();
            } else if (posFinal - posInitial > threshold) {
              _this.previousSlide();
            } else {
              _this.carouselInnerEl.style.left = (posInitial) + "px";
            }

            document.onmouseup = null;
            document.onmousemove = null;
            
        }

        this.carouselInnerEl.addEventListener('touchstart', dragStart);
        this.carouselInnerEl.addEventListener('touchend', dragEnd);
        this.carouselInnerEl.addEventListener('touchmove', dragAction);
        this.carouselInnerEl.addEventListener('mousedown', dragStart);

    }

}


/*******************************
Modal
*******************************/
RB.Modal = function(options) {

    var defaultOptions = {
        el: null,
        callbackOnModalOpen: null,
        callbackOnModalClose: null
    }

    this.modalClosed = true;

    for (var key in options) {

        if (typeof defaultOptions[key] === 'undefined') {
            throw "Unkown property " + key + " was passed into the Modal constructor";
        }

    }


    for (var key in defaultOptions) {

        if (typeof options[key] === 'undefined') {

            options[key] = defaultOptions[key];
        }

        this[key] = options[key];

    }

}


RB.Modal.prototype = {

    constructor: RB.Modal,

    init: function() {

        this.el.classList.add('rb-modal');

        // Add modal background
        this.modalBg = document.createElement('div');
        this.modalBg.classList.add('rb-modal-bg');

        // Add close button
        this.closeBtn = document.createElement('div');
        this.closeBtn.innerHTML = "&times;";
        this.closeBtn.classList.add('rb-modal-close-btn');

        // Add modal wrapper
        var modalWrapper = document.createElement('div');
        modalWrapper.classList.add('rb-modal-wrapper');

        this.modalInner = document.createElement('div');
        this.modalInner.classList.add('rb-modal-inner');

        var modalContent = document.createElement('div');
        modalContent.classList.add('rb-modal-content');


        // Put the original content inside the content wrapper
        modalContent.innerHTML = this.el.innerHTML;

        // Clear the original element, so it can be populated with the new elements
        this.el.innerHTML = "";

        // Add the background
        this.el.appendChild(this.modalBg);

        // Add the button and content
        this.modalInner.appendChild(this.closeBtn);
        this.modalInner.appendChild(modalContent);

        modalWrapper.appendChild(this.modalInner);

        this.el.appendChild(modalWrapper);


        /* Event Listeners */
        this.modalBg.addEventListener('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',function(e){

        	if (this.modalClosed) {
        		this.el.classList.add('active');
        		this.modalClosed = false;
        	} else {
        		this.el.classList.remove('active');
        		this.modalClosed = true;
        	}

        }.bind(this));

		this.modalBg.addEventListener('',function(){
			this.close();
		}.bind(this));

        this.closeBtn.addEventListener('click',function(event){
        	event.preventDefault();
        	this.close();
        }.bind(this));

        // Close modal on Escape key
        window.addEventListener('keydown',function(event) {

            if (event.keyCode == 27) {
        		this.close();
        	}

        }.bind(this));

    },

    close: function() {
        // $('html').removeClass('lockPage');
        this.el.classList.remove('active');

        this.modalInner.classList.remove('active');

    	// If an onClose callback was passed in, call it
        if (this.callbackOnModalClose) {
        	this.callbackOnModalClose();
        }
    },

    open: function () {

        this.el.classList.add('active');

        setTimeout(function(){
            console.log('hello');
            this.modalInner.classList.add('active');
        }.bind(this),100);

    	// If an onOpen callback was passed in, call it
        if (this.callbackOnModalOpen) {
        	this.callbackOnModalOpen();
        }
    }

}





/*******************************
Form
*******************************/

RB.Form = function(options) {

    var defaultOptions = {
        el: null,
        callbackOnSubmitSuccess: null,
        callbackOnSubmitError: null
    }
}

RB.Form.prototype = {

    constructor: RB.Form,

    init: function() {

        this.el.classList.add('rb-form');
    }

}


