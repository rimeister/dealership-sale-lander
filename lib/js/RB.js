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
    this.isAutoPlaying = false;
    this.slideDuration = null;

    // Auto select properties
    this.autoPlay = false;
    this.autoSlideTimeout = null;
    this.autoSlideDuration = null;

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

            this.carouselInnerEl.addEventListener('transitionend', this.checkIndex.bind(this));

            this.allowSlide = true;

            var carouselWidth = (this.el.getBoundingClientRect().width - parseInt(getComputedStyle(this.el, null).getPropertyValue('border-left-width')) - parseInt(getComputedStyle(this.el, null).getPropertyValue('border-right-width')));

            this.positionInitial = -1 * carouselWidth;

            this.carouselInnerEl.style.left = this.positionInitial+'px';

            this.initialized = true;

        }

    },

    showSlide: function(index, callback, action) {

        var slideWidth = this.el.getBoundingClientRect().width - parseInt(getComputedStyle(this.el, null).getPropertyValue('border-left-width')) - parseInt(getComputedStyle(this.el, null).getPropertyValue('border-right-width'));
        var scrollTarget = slideWidth * index;

        this.carouselInnerEl.classList.add('sliding');
        
        if (this.allowSlide) {

            if (!action) { this.positionInitial = this.carouselInnerEl.offsetLeft; }

            // To calculate the new left position, I do the following:
            // (desired index * carousel width * -1) - carousel width

            var newLeftPosition = (index * slideWidth * -1) - slideWidth;

            this.carouselInnerEl.style.left = newLeftPosition + 'px';

            this.currentSlideIndex = index;    

        };
        
        this.allowSlide = false;

    },
    // This gets called on the end of the slide transition event. 
    // It checks to see if we're at the first or last slide, and adjusts accordingly, to maintain the looping illusion
    checkIndex: function (){

        var slideWidth = this.el.getBoundingClientRect().width - parseInt(getComputedStyle(this.el, null).getPropertyValue('border-left-width')) - parseInt(getComputedStyle(this.el, null).getPropertyValue('border-right-width'));

        this.carouselInnerEl.classList.remove('sliding');

        if (this.currentSlideIndex == -1) {
          this.carouselInnerEl.style.left = -((this.slides.length-2) * slideWidth) + "px";
          this.currentSlideIndex = this.slides.length - 3;
        }

        if (this.currentSlideIndex == this.slides.length-2) {
            this.carouselInnerEl.style.left = -slideWidth + "px";
            this.currentSlideIndex = this.slides.length = 0;
        }

        if (this.callbackOnslideShown && typeof this.callbackOnslideShown === 'function') {
            this.callbackOnslideShown(this.currentSlideIndex);
        }    
        
        this.allowSlide = true;
    },

    nextSlide: function(callback) {

        this.showSlide(this.currentSlideIndex+1);

    },

    previousSlide: function() {

        this.showSlide(this.currentSlideIndex-1);

    },

    autoSlide: function(ms) {

        this.autoPlay = true;
        this.autoSlideDuration = ms;
        this.startAutoSlide();
    },

    timeoutFunction: function() {
        this.nextSlide();
        this.autoSlideTimeout = setTimeout(this.timeoutFunction.bind(this),this.autoSlideDuration);
    },

    resetAutoSlide: function() {
        if (this.autoSlideTimeout) {
            clearTimeout(this.autoSlideTimeout);
            this.autoSlideTimeout = null;
            this.startAutoSlide();
        }
    },

    stopAutoSlide: function() {
        if (this.autoSlideTimeout) {
            clearTimeout(this.autoSlideTimeout);
            this.autoSlideTimeout = null;
        }
    },

    startAutoSlide: function() {
        if (this.autoSlideTimeout) {
            clearTimeout(this.autoSlideTimeout);
            this.autoSlideTimeout = null;
        }
        this.autoSlideTimeout = setTimeout(this.timeoutFunction.bind(this),this.autoSlideDuration);
    },    

    /*********************************
    **** CAROUSEL PRIVATE METHODS ****
    /********************************/



    // Looping (so the slides go in a circle)
    __setupLooping: function() {

        if (this.slides.length) {

            // Clone the first and last slide
            var firstSlide = this.slides[0];
            var lastSlide = this.slides[this.slides.length-1];
            var cloneOfFirstSlide = firstSlide.cloneNode(true);
            var cloneOfLastSlide = lastSlide.cloneNode(true);

            // Put them into the carousel
            this.carouselInnerEl.appendChild(cloneOfFirstSlide);
            this.carouselInnerEl.insertBefore(cloneOfLastSlide,firstSlide);

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
                this.stopAutoSlide();
            }

        }

        function mouseExitHandler() {

            this.__hideNavigation();

            // Set a one second delay before resuming the slideshow
            setTimeout(function() {

                if (this.autoPlay) {
                    this.startAutoSlide();
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
          posFinal,
          threshold = 100;

        var _this = this;

        function dragStart(event) {
            event = event || window.event;
            event.preventDefault();
            _this.resetAutoSlide();
            _this.positionInitial = _this.carouselInnerEl.offsetLeft;

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
            _this.resetAutoSlide();
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
            _this.resetAutoSlide();
            posFinal = _this.carouselInnerEl.offsetLeft;
            if (posFinal - _this.positionInitial < -threshold) {
             _this.nextSlide();
            } else if (posFinal - _this.positionInitial > threshold) {
              _this.previousSlide();
            } else {
              _this.carouselInnerEl.style.left = (_this.positionInitial) + "px";
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
        onFormSubmit: null
    }

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

    this.initialized = true;
}

RB.Form.prototype = {

    constructor: RB.Form,

    init: function() {
        this.el.classList.add('rb-form');

        this.el.addEventListener('submit',function(event){
            // Prevent the default form behaviour
            event.preventDefault();

            var isValid = this.__validateForm();

            // If the form is valid
            if (isValid) {
    
                // Process data from the form's inputs
                var data = this.__processData();
                
                // Submit the form data back to the callback, if there was one
                if (data && data !== 'undefined') {
                    if (typeof this.onFormSubmit !== 'undefined') {
                        
                        var dataString = JSON.stringify(data);

                        // Pass in the functions that show the success or error message
                        this.onFormSubmit(dataString,this.__showSuccessMessage,this.__showErrorMessage);
                    }

                }

            }

        }.bind(this));
    },

    __validateForm: function() {
        // validate form inputs here
        // If invalid, put error message elements
        return true;
    },

    __processData: function() {

        // Get all the values from the inputs of the form, and serialize them
        var keyValuePairs = {};

        for (var i = 0; i < this.el.elements.length; i++ ) {
           var ele = this.el.elements[i];
           keyValuePairs[ele.name] = ele.value; // .push(encodeURIComponent(ele.name) + "=" + encodeURIComponent(ele.value));
        }

        return keyValuePairs;
    },
    
    __showSuccessMessage: function() {
        // Success message display = block goes here
    },
    
    __showErrorMessage: function() {
        // Error message display = block goes here
    }
}


/*******************************
AJAX Handlers
*******************************/

RB.Ajax = function() {};

RB.Ajax.prototype = {

    constructor: RB.Ajax,

    get: function(url,successCallback,errorCallback) {
        var request = new XMLHttpRequest();  

        request.onreadystatechange = function() { 
            if (request.readyState == 4 && request.status == 200) {
                if (typeof successCallback !== 'undefined') {
                    // Send response back as a serialized JSON string
                    successCallback(JSON.stringify(request.responseText));
                }
            }
        }

        request.onerror = function(event) {
            if (typeof errorCallback !== 'undefined') {
                // Send response back as a serialized JSON string
                errorCallback(event);
            }
        }

        request.open("GET", url, true);  
        request.send();

    },

    submit: function(url,type,params,successCallback,errorCallback) {
    
        var request = new XMLHttpRequest();
        request.submittedData = params;

        request.onreadystatechange = function() { 

            if (request.readyState == 4 && request.status == 201) {
                if (typeof successCallback !== 'undefined') {
                    // Send response back as a serialized JSON string
                    successCallback(JSON.stringify(request.responseText));
                }
            }
        }

        request.onerror = function(event) {
            if (typeof errorCallback !== 'undefined') {
                // Send response back as a serialized JSON string
                errorCallback(event);
            }
        }

        if (type === 'get') {
          
          /* method is GET */
          request.open("get", url, true);
          request.send(null);

        } else if (type=='post'){
          
            /* method is POST */
            request.open("post", url, true);

            request.setRequestHeader("Content-Type", "application/json; charset=UTF-8");

            request.send(params);
        }        
    }
}

RB.ajaxGet = function(url) {


}

RB.ajaxPost = function(url,data,type) {

}