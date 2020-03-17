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

	// If the property passed in is not in the default options 
	for (var key in options) {

		// If the key passed in was not defined in the default options above, throw an error
		if (typeof defaultOptions[key] === 'undefined') {
			throw "Unkown property " + key + " was passed into the Carousel constructor";
		} 
		/*


		} else {
		// Otherwise, assign the value as a property of this Carousel
			this[key] = options[key];			
		}
		// console.log(options[key]);
		// console.log(defaultOptions[key]);
*/
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
	init: function() {
		console.log('initialize the Carousel');

		
		// Nav buttons

		if (this.showBtns) {
			
			var nav = document.creatElement('div');
			nav.classList.add('carousel-nav');

			// Construct html for buttons here
			this.el.appendChild(nav);
		}

		
	}
}

// Reference for Javascript carousel: https://www.w3schools.com/howto/howto_js_slideshow.asp