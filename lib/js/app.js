window.onload = function() {
    var carsCarouselEl = document.getElementById('cars-carousel');

    var carsCarousel = new RB.Carousel({
        el: carsCarouselEl,
        loop: true,
        transitionTime: 400,
        nav: true,
        callbackOnslideShown: function(slideIndex) {

            // Get background images
            var backgroundImageDivs = document.getElementsByClassName('backgrounds')[0].getElementsByClassName('bg-img');

            // Adding setTimeout in order to delay the background change by 0.25 seconds
            setTimeout(function(){
                // Add the active class to the background for the current slide
                backgroundImageDivs[slideIndex].classList.add('active');

                // Remove the active class from all backgrounds except the one for the current slide
                for (var i=0; i < backgroundImageDivs.length; i++) {
                    if (i !== slideIndex) {
                        backgroundImageDivs[i].classList.remove('active');                
                    }
                }
            },250);

            // Could also fire an analytics event here to track which slide has been shown, if desired

        },
        callbackOnNavBtnClick: function(btnDirection) {

            // Could fire an analytics event here to track the button clicks

        }
    });
    carsCarousel.init();
    carsCarousel.showSlide(1);

    // carsCarousel.autoSlide(5000);    
}

