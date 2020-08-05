var myCarouselEl = document.getElementById('my-carousel');

var myCarousel = new RB.Carousel({
    el: myCarouselEl,
    loop: true,
    transitionTime: 150,
    nav: true,
    callbackOnslideShown: function(slideIndex) {

    	// Could fire an analytics event here to track which slide has been shown

    },
    callbackOnNavBtnClick: function(btnDirection) {

    	// Could fire an analytics event here to track the button clicks

    }
});
myCarousel.init();
// myCarousel.autoSlide(5000);