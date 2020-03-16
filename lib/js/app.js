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


		console.log(defaultOptions[key]);

	}

}

NAMESPACE.Carousel.prototype = {
	constructor: NAMESPACE.Carousel,
	init: function() {
		console.log('initialize the Carousel');
	}
}