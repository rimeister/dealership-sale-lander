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
        breakpointChangeCallback: null
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
                this.carouselInnerEl.style.left =  '-100%';
            } else {
                this.carouselInnerEl.style.left =  '0%';                
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
            var newLeftPosition = (index * 100 * -1) - 100;

            this.carouselInnerEl.style.left = newLeftPosition + '%';

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
                this.resetAutoSlide();
                this.isAutoPlaying = false;
                this.previousSlide();
                if (typeof this.callbackOnNavBtnClick === 'function') { this.callbackOnNavBtnClick('left'); }
            }.bind(this));

        }

        if (typeof rightBtn !== 'undefined') {

            rightBtn.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                this.resetAutoSlide();
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
        onFormSubmit: null,
        cancelCallback: null
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

    this.vendor = null;
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


        // Add required classes
        for (var i=0; i < this.el.elements.length; i++) {

            if (this.el.elements[i].type != 'submit') {
                this.el.elements[i].classList.add('rb-form-input');
            }

            if (this.el.elements[i].type == 'submit') {
                this.el.elements[i].classList.add('rb-btn','rb-submit-btn');
            }

        }

        // If there's a cancel button, add click handler
        var cancelBtn = this.el.getElementsByClassName('rb-form-cancel-btn')[0];

        if (typeof cancelBtn !== 'undefined') {
            cancelBtn.addEventListener('click',this.__cancelBtnHandler.bind(this));
        }

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
    
    __showSuccessMessage: function() {
        // Success message display = block goes here
    },
    
    __showErrorMessage: function() {
        // Error message display = block goes here
    },
    __cancelBtnHandler: function(event) {
        event.preventDefault();
        if (this.cancelCallback) {
            this.cancelCallback();
        }
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
