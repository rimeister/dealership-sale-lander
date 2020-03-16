/*******************************
Namespacing
*******************************/

var NAMESPACE = NAMESPACE || {};


/*******************************
Carousel
*******************************/

NAMESPACE.Carousel = function(options) {

	var defaultOptions = {
		el: null
	}

	// If the property passed in is not in the default options 
	for (var key in options) {

		// If the key passed in was not defined in the default options above, throw an error
		if (typeof defaultOptions[key] !== 'undefined') {
			throw "Unkown property " + key + " was passed into the Carousel constructor";
		} else if () {

		} else {
		// Otherwise, assign the value as a property of this Carousel
			this[key] = options[key];			
		}
		// console.log(options[key]);
		// console.log(defaultOptions[key]);

	}



// Pattern to copy
/*

	// process options
	{
		let options_default = {
			"el"        : null,
			"callbackOnOpen": null
		};

		for(let key in options) {
			if(!(key in options_default)) {
				throw new Error("Unrecognised option passed into constructor: '" + key + "'.");
			}
		}

		for(let key in options_default) {
			if(!(key in options)) {
				options[key] = options_default[key];
			}
			this[key] = options[key];
		}
	}

*/




}

NAMESPACE.Carousel.prototype = {
	constructor: NAMESPACE.Carousel,
	init: function() {
		console.log('initialize the Carousel');
	}
}