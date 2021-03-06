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
        callbackOnNavBtnClick: null,
        breakpointChangeCallback: null,
        initCallback: null,
        disableClickThreshold: 10
    }

    this.initialized = false;
    this.currentSlideIndex = 0;
    this.numSlides = 0;
    this.slides = null;
    this.carouselInnerEl = null;
    this.slideDuration = null;

    // Auto play properties
    this.autoPlay = false;
    this.autoSlideTimeout = null;
    this.autoSlideDuration = null;
    this.isAutoPlaying = false;

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
            this.carouselInnerEl.style.transform = "translateX(0)";

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

            /* To check which breakpoint the window is at, I let CSS do the heavy lifting
            I create an element with the class .rb-check-breakpoint, whose opacity changes at CSS media query breakpoints.
            By checking the opacity of this element in JS, I can know which breakpoint the window is at.
            */
            this.breakPointCheck = document.createElement('div');
            this.breakPointCheck.classList.add('rb-check-breakpoint');
            this.el.appendChild(this.breakPointCheck);

            this.carouselInnerEl.addEventListener('transitionend', this.checkIndex.bind(this));

            this.allowSlide = true;

            var carouselWidth = (this.el.getBoundingClientRect().width - parseInt(getComputedStyle(this.el, null).getPropertyValue('border-left-width')) - parseInt(getComputedStyle(this.el, null).getPropertyValue('border-right-width')));

            if (this.loop) {
                this.carouselInnerEl.style.transform = "translateX(-" + (1/this.numSlides * 100) + "%)";
            } else {
                this.carouselInnerEl.style.transform = "translateX(0)";              
            }

            if (this.initCallback){
                this.initCallback();
            }

            this.initialized = true;

        }

    },

    showSlide: function(index, callback, action) {

        var slideWidth = this.el.getBoundingClientRect().width - parseInt(getComputedStyle(this.el, null).getPropertyValue('border-left-width')) - parseInt(getComputedStyle(this.el, null).getPropertyValue('border-right-width'));
        var scrollTarget = slideWidth * index;

        this.carouselInnerEl.classList.add('sliding');
        
        if (this.allowSlide) {

            if (!action) { this.positionInitial = this.carouselInnerEl.offsetLeft; }

            // Note: starting index (0) need to be at 100%, hence the -100 at the end
            var newLeftPosition = (index+1)/this.numSlides * -100;

            this.carouselInnerEl.style.transform = "translateX(" + newLeftPosition + "%)"; //newLeftPosition + '%';

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
          this.carouselInnerEl.style.transform = "translateX(" + -((this.slides.length-2) * slideWidth) + "px)";
          this.currentSlideIndex = this.slides.length - 3;
        }

        if (this.currentSlideIndex == this.slides.length-2) {
            this.carouselInnerEl.style.transform = "translateX(" + -slideWidth + "px)";
            this.currentSlideIndex = 0;
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


        if (this.isAutoPlaying && this.autoSlideTimeout) {
            clearTimeout(this.autoSlideTimeout);
            this.autoSlideTimeout = null;
            this.startAutoSlide();
        }
    },

    stopAutoSlide: function() {

        if (this.isAutoPlaying && this.autoPlay) {
            if (this.autoSlideTimeout) {
                clearTimeout(this.autoSlideTimeout);
                this.autoSlideTimeout = null;
            }
        }

        this.isAutoPlaying = false;
    },

    startAutoSlide: function() {

        this.isAutoPlaying = true;

        if (this.autoPlay) {

            if (this.autoSlideTimeout) {
                clearTimeout(this.autoSlideTimeout);
                this.autoSlideTimeout = null;
            }
            this.autoSlideTimeout = setTimeout(this.timeoutFunction.bind(this),this.autoSlideDuration);
        }


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
                this.resetAutoSlide();
                this.previousSlide();
                if (typeof this.callbackOnNavBtnClick === 'function') { this.callbackOnNavBtnClick('left'); }
            }.bind(this));

        }

        if (typeof rightBtn !== 'undefined') {

            rightBtn.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                this.resetAutoSlide();
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

            if (this.isAutoPlaying && this.autoPlay) {
                this.stopAutoSlide();
            }

        }

        function mouseExitHandler() {

            this.__hideNavigation();

            if (!this.isAutoPlaying && this.autoPlay) {

                this.startAutoSlide();

            }

        }

        this.el.addEventListener('mouseenter', mouseEnterHandler.bind(this));

        this.el.addEventListener('mouseleave', mouseExitHandler.bind(this));

    },

    __setupResizeEvent: function() {

        // Keep the previous breakpoint val in this closure
        var previousBreakpointOpacity = null;

        window.addEventListener('resize', function() {

            // Reset the animation timer as the window is resized
            this.resetAutoSlide();

            this.breakPointCheckOpacity = window.getComputedStyle(this.breakPointCheck).getPropertyValue("opacity");

            // If the breakpoint has changed
            if (this.breakPointCheckOpacity != previousBreakpointOpacity) {

                var breakpoint = "xs";

                switch (this.breakPointCheckOpacity) {

                    case "0":
                        breakpoint = "xs";
                        break;
                    case "0.15":
                        breakpoint = "sm";
                        break;
                    case "0.25":
                        breakpoint = "md";
                        break;
                    case "0.5":
                        breakpoint = "lg";
                        break;
                    case "0.75":
                        breakpoint = "xl";
                        break;
                    default:
                        breakpoint = "xs";
                }

               // If a callback that fires on breakpoint change was passed in
               if (this.breakpointChangeCallback) {
                   this.breakpointChangeCallback(breakpoint);
               }

                previousBreakpointOpacity = this.breakPointCheckOpacity;

            }

        }.bind(this));
    },

    __setupTouchEvents: function() {

        var xPosition1 = 0,
          xPosition2 = 0,
          posFinal,
          threshold = 100,
          dragStartXPos = 0,
          dragEndXPos = 0;

        var _this = this;

        function preventClick(event) {
            event.preventDefault();
            event.stopPropagation();
        }

        function dragStart(event) {
            event = event || window.event;
            event.preventDefault();
            _this.resetAutoSlide();

            var carouselInnerBoundingRect = _this.carouselInnerEl.getBoundingClientRect();
            _this.positionInitial = carouselInnerBoundingRect.left;

            if (event.type == 'touchstart') {
              xPosition1 = event.touches[0].clientX;
              dragStartXPos = event.touches[0].clientX;
            } else {
              xPosition1 = event.clientX;
              dragStartXPos = event.clientX;
              document.onmouseup = dragEnd;
              document.onmousemove = dragAction;
            }
        }

        function dragAction(event) {
            event = event || window.event;
            _this.resetAutoSlide();
            var carouselInnerBoundingRect = _this.carouselInnerEl.getBoundingClientRect();

            if (event.type == 'touchmove') {
              xPosition2 = xPosition1 - event.touches[0].clientX;
              xPosition1 = event.touches[0].clientX;
            } else {
              xPosition2 = xPosition1 - event.clientX;
              xPosition1 = event.clientX;
            }
            _this.carouselInnerEl.style.transform = "translateX(" + (carouselInnerBoundingRect.left - xPosition2) + "px)";
            
        }

        function dragEnd(event) {
            var carouselInnerBoundingRect = _this.carouselInnerEl.getBoundingClientRect();

            _this.resetAutoSlide();
            posFinal = carouselInnerBoundingRect.left;
            if (posFinal - _this.positionInitial < -threshold) {
             _this.nextSlide();
            } else if (posFinal - _this.positionInitial > threshold) {
              _this.previousSlide();
            } else {
              _this.carouselInnerEl.style.transform = "translateX(" + _this.positionInitial + "px)";
            }

            if (event.type == 'touchstart') {
              dragEndXPos = event.touches[0].clientX;
            } else {
              dragEndXPos = event.clientX;
            }

            // If the amount that the slide was dragged is greater than the 'click' threshold that was set
            if ( Math.abs(dragEndXPos - dragStartXPos) > _this.disableClickThreshold ) {

                // Add the click event to prevent the click propagation
                _this.carouselInnerEl.addEventListener('click',preventClick,true);

            } else {
                // Remove the click event to prevent the click propagation
                // This will allow the user to click through to the link
                _this.carouselInnerEl.removeEventListener('click',preventClick,true);
            }

            dragStartXPos = 0;
            dragEndXPos = 0;

            document.onmouseup = null;
            document.onmousemove = null;
            
        }

        this.carouselInnerEl.addEventListener('touchstart', dragStart, {passive: true});
        this.carouselInnerEl.addEventListener('touchend', dragEnd);
        this.carouselInnerEl.addEventListener('touchmove', dragAction, {passive: true});
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
        callbackOnModalClose: null,
        callbackOnCloseBtnClicked: null
    }

    this.modalOpen = false;

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
        this.closeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><style>.cls-1{fill:#f1f1f1;}</style></defs><g id="Layer_2" data-name="Layer 2"><rect x="86" y="103" width="330" height="302"/></g><g id="Layer_1" data-name="Layer 1"><path class="cls-1" d="M256,8C119,8,8,119,8,256S119,504,256,504,504,393,504,256,393,8,256,8ZM377.6,321.1a12,12,0,0,1,0,17L338,377.6a12,12,0,0,1-17,0L256,312l-65.1,65.6a12,12,0,0,1-17,0L134.4,338a12,12,0,0,1,0-17L200,256l-65.6-65.1a12,12,0,0,1,0-17L174,134.3a12,12,0,0,1,17,0L256,200l65.1-65.6a12,12,0,0,1,17,0L377.7,174a12,12,0,0,1,0,17L312,256Z"/></g></svg>';
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
		this.modalBg.addEventListener('',function(){
			this.close();
		}.bind(this));

        this.closeBtn.addEventListener('click',function(event){
        	event.preventDefault();
        	this.close();
            if (this.callbackOnCloseBtnClicked) {
                this.callbackOnCloseBtnClicked();
            }
        }.bind(this));

        // Close modal on Escape key
        window.addEventListener('keydown',function(event) {

            if (event.keyCode == 27) {
        		this.close();
        	}

        }.bind(this));

        /* Since there's a click event listener on the document body, we need to stop clicks 
        on the modal itself from propagating to the body 
        -- otherwise, it would close when the modal content is clicked */
        this.modalInner.addEventListener('click',function(event){
            event.stopPropagation();
        });

        // Event handler for body clicked, added/removed on open/close
        this.bodyClickHandler = function(event) {
            if (this.modalOpen) {
                this.close();                
            }
        }

    },

    close: function() {
        document.body.classList.remove('rb-modal-open');
        this.el.classList.remove('active');

        this.modalInner.classList.remove('active');
        this.modalOpen = false;

        // Remove body click listener
        document.body.removeEventListener('click',this.bodyClickHandler);

    	// If an onClose callback was passed in, call it
        if (this.callbackOnModalClose) {
        	this.callbackOnModalClose();
        }
    },

    open: function () {

        document.body.classList.add('rb-modal-open');
        this.el.classList.add('active');

        setTimeout(function(){

            // Tell bodyClickHandler what 'this' is before adding event
            // This allows us to remove it later without issue
            this.bodyClickHandler = this.bodyClickHandler.bind(this);

            // Add body click event
            document.body.addEventListener('click',this.bodyClickHandler);

            this.modalInner.classList.add('active');

            this.modalOpen = true;

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
        onFormSubmit: null,
        cancelCallback: null,
        submitBtnCallback: null
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

    this.submitBtn = null;
    this.vendor = null;
    this.initialized = false;
}

RB.Form.prototype = {

    constructor: RB.Form,

    init: function() {

        if (!this.initialized) {

           this.el.classList.add('rb-form');

            this.el.addEventListener('submit',function(event){
                // Prevent the default form behaviour
                event.preventDefault();
            });
            
            // Config for Pristine validation
            pristineConfig = {
                // class of the parent element where the error/success class is added
                classTo: 'form-group',
                errorClass: 'rb-has-error',
                successClass: 'rb-has-success',
                // class of the parent element where error text element is appended
                errorTextParent: 'form-group',
                // type of element to create for the error text
                errorTextTag: 'div',
                // class of the error text element
                errorTextClass: 'rb-form-error' 
            }

            this.vendor = new RB.Vendor();
            this.vendor.init();

            // Form validation
            this.pristine = new this.vendor.Pristine(this.el,pristineConfig,true);

            // Add required classes
            for (var i=0; i < this.el.elements.length; i++) {

                if (this.el.elements[i].type != 'submit') {
                    this.el.elements[i].classList.add('rb-form-input');
                }

                if (this.el.elements[i].type == 'submit') {
                    this.el.elements[i].classList.add('rb-btn','rb-submit-input');
                }

                if (this.el.elements[i].type == 'tel') {

                    // If it's a phone number input, set up phone number validation
                    this.pristine.addValidator(this.el.elements[i], function(value) {

                        var regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;

                        return regex.test(value);

                    }, "Invalid Phone Number", 2, false);

                }

            }

            // If there's a cancel button, add click handler
            var cancelBtn = this.el.getElementsByClassName('rb-form-cancel-btn')[0];

            if (typeof cancelBtn !== 'undefined') {
                cancelBtn.addEventListener('click',this.__cancelBtnHandler.bind(this));
            }

            /*
        
            // Commenting this out for now. The form uses an <input type="submit" /> element to submit the form. But, if it was a button element, the event listener would be necessary.

            // Find submit button and add handler
            this.submitBtn = this.el.getElementsByClassName('rb-form-submit-btn')[0];

            if (typeof this.submitBtn !== 'undefined') {
                this.submitBtn.addEventListener('click',this.__submitBtnHandler.bind(this));
            }
            */

            if (this.el.tagName === 'FORM') {
                
                this.el.addEventListener('submit',function(event){
                
                    // Prevent the default submit function, since we're doing it with ajax
                    event.preventDefault();
            
                    this.__submitForm();

                    if (this.submitBtnCallback) {
                        this.submitBtnCallback();
                    }

                }.bind(this));
            }


        }

        this.initialized = true;

    },
    resetForm: function() {
        this.el.reset();
        this.pristine.reset();
        this.submitBtn.innerHTML = "Submit";
        this.submitBtn.classList.remove('error','success');
    },
    __validateForm: function() {
        return this.pristine.validate();
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
    
    __submitForm: function() {

        var isValid = this.__validateForm();

        // If the form is valid
        if (isValid) {
    
            // Add the "loading" spinner
            this.submitBtn.innerHTML = "<div class='loading'><div></div><div></div><div></div><div></div></div>";

            // Process data from the form's inputs
            var data = this.__processData();
            
            // Submit the form data back to the callback, if there was one
            if (data && data !== 'undefined') {
                if (typeof this.onFormSubmit !== 'undefined') {
                    
                    var dataString = JSON.stringify(data);

                    // Pass in the functions that show the success or error message
                    this.onFormSubmit(dataString,this.__showSuccessMessage.bind(this),this.__showErrorMessage.bind(this));
                }

            }

        }

    },

    __showSuccessMessage: function() {
        this.submitBtn.classList.add('success');
        this.submitBtn.innerHTML = "Sent! We'll contact you soon.";               
    },
    
    __showErrorMessage: function() {
        this.submitBtn.classList.add('failure');
        this.submitBtn.innerHTML = "Error. Please try again.";  
    },
    __cancelBtnHandler: function(event) {
        if (this.cancelCallback) {
            this.cancelCallback();
        }
    },
    __submitBtnHandler: function(event) {
        this.__submitForm();
        if (this.submitBtnCallback) {
            this.submitBtnCallback();
        }
    }

}


/*******************************
AJAX Handlers
*******************************/

RB.Ajax = function() {};

RB.Ajax.prototype = {

    constructor: RB.Ajax,

    get: function(url,successCallback,errorCallback,responseType) {
        var request = new XMLHttpRequest();  

        if (typeof responseType !== 'undefined') {
            request.responseType = responseType;
        }

        request.onreadystatechange = function() { 


            if (request.readyState == 4 && request.status == 200) {

                if (typeof successCallback !== 'undefined') {

                    if (request.responseType == 'text') {
                    // Send response back as a serialized JSON string
                        successCallback(JSON.stringify(request.responseText));
                    } else if (request.responseType == 'blob') {
                        successCallback(request.response);
                    }

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


/*******************************
Analytics
*******************************/

// Allows us to send one event to multiple analytics platforms
// Supports Google Analytics and Amplitude

RB.Analytics = function(config) {

    var defaultConfig = {
        googleAnalytics: null,
        amplitude: null
    }

    for (var key in config) {

        if (typeof defaultConfig[key] === 'undefined') {
            throw "Unkown property " + key + " was passed into the Modal constructor";
        }

    }


    for (var key in defaultConfig) {

        if (typeof config[key] === 'undefined') {

            config[key] = defaultConfig[key];
        }

        this[key] = config[key];

    }

    this.vendor = null;
    this.initialized = true;

};

RB.Analytics.prototype = {

    constructor: RB.Analytics,

    init: function() {
        
        // Initialize Google Analytics
        if (this.googleAnalytics) {

            // Add the GA library to the page
            
            (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
            })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

            // NOTE: Uncomment the line below on production so the events will actually send
            /* ga('create', this.googleAnalytics.trackingId, 'auto'); */
            
            // NOTE: Uncomment the line below on production so the events will actually send
            /* ga('set', 'transport', 'beacon'); */
        }

        // Initialize Amplitude
        if (this.amplitude) {

            // Add the Amplitude library to the page
            (function(e,t){var n=e.amplitude||{_q:[],_iq:{}};var r=t.createElement("script")
            ;r.type="text/javascript"
            ;r.integrity="sha384-cukXwabQy+j/QA1+RqiXSzxhgQg5Rrn3zVszlwH3pWj/bXJxlA8Ge7NhcD6vP2Ik"
            ;r.crossOrigin="anonymous";r.async=true
            ;r.src="https://cdn.amplitude.com/libs/amplitude-7.1.0-min.gz.js"
            ;r.onload=function(){if(!e.amplitude.runQueuedFunctions){
            console.log("[Amplitude] Error: could not load SDK")}}
            ;var i=t.getElementsByTagName("script")[0];i.parentNode.insertBefore(r,i)
            ;function s(e,t){e.prototype[t]=function(){
            this._q.push([t].concat(Array.prototype.slice.call(arguments,0)));return this}}
            var o=function(){this._q=[];return this}
            ;var a=["add","append","clearAll","prepend","set","setOnce","unset"]
            ;for(var c=0;c<a.length;c++){s(o,a[c])}n.Identify=o;var u=function(){this._q=[]
            ;return this}
            ;var l=["setProductId","setQuantity","setPrice","setRevenueType","setEventProperties"]
            ;for(var p=0;p<l.length;p++){s(u,l[p])}n.Revenue=u
            ;var d=["init","logEvent","logRevenue","setUserId","setUserProperties","setOptOut","setVersionName","setDomain","setDeviceId","enableTracking","setGlobalUserProperties","identify","clearUserProperties","setGroup","logRevenueV2","regenerateDeviceId","groupIdentify","onInit","logEventWithTimestamp","logEventWithGroups","setSessionId","resetSessionId"]
            ;function v(e){function t(t){e[t]=function(){
            e._q.push([t].concat(Array.prototype.slice.call(arguments,0)))}}
            for(var n=0;n<d.length;n++){t(d[n])}}v(n);n.getInstance=function(e){
            e=(!e||e.length===0?"$default_instance":e).toLowerCase()
            ;if(!n._iq.hasOwnProperty(e)){n._iq[e]={_q:[]};v(n._iq[e])}return n._iq[e]}
            ;e.amplitude=n})(window,document);


            // NOTE: Uncomment the line below on production so the events will actually send
           /*
            amplitude.getInstance().init(
                this.amplitude.apiKey,
                null,
                {
                    includeUtm: true,
                    includeReferrer: true
                }
            );    
            */        
        }


    },

    send: function(config) {

        if (this.googleAnalytics) {

            var label = undefined;
            var value = undefined;

            if (typeof config.props !== 'undefined' && config.props != null) {
                if(config.props.hasOwnProperty('label')){
                    label = config.props.description;
                }
                
                if(config.props.hasOwnProperty('value')){
                    value= config.props.value;
                }
            }

            var fields = {
              hitType: 'event',
              eventCategory: config.category,
              eventAction: config.action            
            };

            if (typeof label !== 'undefined') {
                fields['eventLabel'] = label;
            }

            if (typeof value !== 'undefined') {
                fields['eventValue'] = value;                
            }

            if (typeof config.callback !== 'undefined') {
                fields['hitCallback'] = config.callback;                
            }

            if (typeof config.callback !== 'undefined') {config.callback('Google Analytics');};

            // NOTE: Uncomment the line below on production so the events will actually send
            /* ga('send', fields); */

        }

        if (this.amplitude) {

            if (typeof config.callback !== 'undefined') {

                config.callback('Amplitude');

                // NOTE: Uncomment the line below on production so the events will actually send
                /* amplitude.getInstance().logEvent(config.category + "_" + config.action, config.props, config.callback) */
            } else {

                // NOTE: Uncomment the line below on production so the events will actually send
                /* amplitude.getInstance().logEvent(config.category + "_" + config.action, config.props); */
            }

        }

    }
}


/*******************************
Vendor Libraries
*******************************/

RB.Vendor = function() {};

RB.Vendor.prototype = {

    constructor: RB.Vendor,

    init: function() {
        this.pristine();
    },

    pristine: function() {
        // Pristine.js, form validation
        !function(e,r){"object"==typeof exports&&"undefined"!=typeof module?module.exports=r():"function"==typeof define&&define.amd?define(r):e.Pristine=r()}(this,function(){"use strict";function e(e){var r=arguments;return this.replace(/\${([^{}]*)}/g,function(e,t){return r[t]})}function r(e){return e.pristine.self.form.querySelectorAll('input[name="'+e.getAttribute("name")+'"]:checked').length}function t(r,t,n){function u(e,r,t,n){var i=l[t];if(i&&(e.push(i),n)){var s=n.split(",");s.unshift(null),r[t]=s}}function f(e){if(e.errorElements)return e.errorElements;var r=function(e,r){for(;(e=e.parentElement)&&!e.classList.contains(r););return e}(e.input,m.config.classTo),t=null,n=null;return(t=m.config.classTo===m.config.errorTextParent?r:r.querySelector(m.errorTextParent))&&((n=t.querySelector("."+s))||((n=document.createElement(m.config.errorTextTag)).className=s+" "+m.config.errorTextClass,t.appendChild(n),n.pristineDisplay=n.style.display)),e.errorElements=[r,n]}function c(e){var r=f(e),t=r[0],n=r[1];t&&(t.classList.remove(m.config.successClass),t.classList.add(m.config.errorClass)),n&&(n.innerHTML=e.errors.join("<br/>"),n.style.display=n.pristineDisplay||"")}function p(e){var r=function(e){var r=f(e),t=r[0],n=r[1];return t&&(t.classList.remove(m.config.errorClass),t.classList.remove(m.config.successClass)),n&&(n.innerHTML="",n.style.display="none"),r}(e)[0];r&&r.classList.add(m.config.successClass)}var m=this;return function(e,r,t){e.setAttribute("novalidate","true"),m.form=e,m.config=function(e,r){for(var t in r)t in e||(e[t]=r[t]);return e}(r||{},i),m.live=!(!1===t),m.fields=Array.from(e.querySelectorAll(a)).map(function(e){var r=[],t={},n={};return[].forEach.call(e.attributes,function(e){if(/^data-pristine-/.test(e.name)){var i=e.name.substr(14);if(i.endsWith("-message"))return void(n[i.slice(0,i.length-8)]=e.value);"type"===i&&(i=e.value),u(r,t,i,e.value)}else~o.indexOf(e.name)?u(r,t,e.name,e.value):"type"===e.name&&u(r,t,e.value)}),r.sort(function(e,r){return r.priority-e.priority}),m.live&&e.addEventListener(~["radio","checkbox"].indexOf(e.getAttribute("type"))?"change":"input",function(e){m.validate(e.target)}.bind(m)),e.pristine={input:e,validators:r,params:t,messages:n,self:m}}.bind(m))}(r,t,n),m.validate=function(r,t){t=r&&!0===t||!0===r;var n=m.fields;!0!==r&&!1!==r&&(r instanceof HTMLElement?n=[r.pristine]:(r instanceof NodeList||r instanceof(window.$||Array)||r instanceof Array)&&(n=Array.from(r).map(function(e){return e.pristine})));var i=!0;for(var s in n){var a=n[s];!function(r){var t=[],n=!0;for(var i in r.validators){var s=r.validators[i],a=r.params[s.name]?r.params[s.name]:[];if(a[0]=r.input.value,!s.fn.apply(r.input,a)){n=!1;var o=r.messages[s.name]||s.msg;if(t.push(e.apply(o,a)),!0===s.halt)break}}return r.errors=t,n}(a)?(i=!1,!t&&c(a)):!t&&p(a)}return i},m.getErrors=function(e){if(!e){for(var r=[],t=0;t<m.fields.length;t++){var n=m.fields[t];n.errors.length&&r.push({input:n.input,errors:n.errors})}return r}return e.length?e[0].pristine.errors:e.pristine.errors},m.addValidator=function(e,r,t,n,i){e instanceof HTMLElement?(e.pristine.validators.push({fn:r,msg:t,priority:n,halt:i}),e.pristine.validators.sort(function(e,r){return r.priority-e.priority})):console.warn("The parameter elem must be a dom element")},m.addError=function(e,r){(e=e.length?e[0]:e).pristine.errors.push(r),c(e.pristine)},m.reset=function(){for(var e in m.fields)m.fields[e].errorElements=null;Array.from(m.form.querySelectorAll("."+s)).map(function(e){e.parentNode.removeChild(e)}),Array.from(m.form.querySelectorAll("."+m.config.classTo)).map(function(e){e.classList.remove(m.config.successClass),e.classList.remove(m.config.errorClass)})},m.destroy=function(){m.reset(),m.fields.forEach(function(e){delete e.input.pristine}),m.fields=[]},m.setGlobalConfig=function(e){i=e},m}var n={required:"This field is required",email:"This field requires a valid e-mail address",number:"This field requires a number",url:"This field requires a valid website URL",tel:"This field requires a valid telephone number",maxlength:"This fields length must be < ${1}",minlength:"This fields length must be > ${1}",min:"Minimum value for this field is ${1}",max:"Maximum value for this field is ${1}",pattern:"Input must match the pattern ${1}"},i={classTo:"form-group",errorClass:"has-danger",successClass:"has-success",errorTextParent:"form-group",errorTextTag:"div",errorTextClass:"text-help"},s="pristine-error",a="input:not([type^=hidden]):not([type^=submit]), select, textarea",o=["required","min","max","minlength","maxlength","pattern"],l={},u=function(e,r){r.name=e,r.msg||(r.msg=n[e]),void 0===r.priority&&(r.priority=1),l[e]=r};return u("text",{fn:function(e){return!0},priority:0}),u("required",{fn:function(e){return"radio"===this.type||"checkbox"===this.type?r(this):void 0!==e&&""!==e},priority:99,halt:!0}),u("email",{fn:function(e){return!e||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)}}),u("number",{fn:function(e){return!e||!isNaN(parseFloat(e))},priority:2}),u("integer",{fn:function(e){return e&&/^\d+$/.test(e)}}),u("minlength",{fn:function(e,r){return!e||e.length>=parseInt(r)}}),u("maxlength",{fn:function(e,r){return!e||e.length<=parseInt(r)}}),u("min",{fn:function(e,t){return!e||("checkbox"===this.type?r(this)>=parseInt(t):parseFloat(e)>=parseFloat(t))}}),u("max",{fn:function(e,t){return!e||("checkbox"===this.type?r(this)<=parseInt(t):parseFloat(e)<=parseFloat(t))}}),u("pattern",{fn:function(e,r){var t=r.match(new RegExp("^/(.*?)/([gimy]*)$"));return!e||new RegExp(t[1],t[2]).test(e)}}),t.addValidator=function(e,r,t,n,i){u(e,{fn:r,msg:t,priority:n,halt:i})},t});        
    }
}
