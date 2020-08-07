var APP = APP || {};

APP.init = function(page) {

    if (page == 'home') {
        /* Carousel */
        var carsCarouselEl = document.getElementById('cars-carousel');

        var carsCarousel = new RB.Carousel({
            el: carsCarouselEl,
            loop: true,
            transitionTime: 400,
            nav: true,
            callbackOnslideShown: function(slideIndex) {

                // Get background images
                var backgroundImageDivs = document.getElementsByClassName('backgrounds')[0].getElementsByClassName('bg-img');

                // Adding setTimeout in order to delay the background change by 0.125 seconds
                setTimeout(function(){
                    // Add the active class to the background for the current slide
                    backgroundImageDivs[slideIndex].classList.add('active');

                    // Remove the active class from all backgrounds except the one for the current slide
                    for (var i=0; i < backgroundImageDivs.length; i++) {
                        if (i !== slideIndex) {
                            backgroundImageDivs[i].classList.remove('active');                
                        }
                    }
                },125);

                // Could also fire an analytics event here to track which slide has been shown, if desired

            },
            callbackOnNavBtnClick: function(btnDirection) {

                // Could fire an analytics event here to track the button clicks

            }
        });
        carsCarousel.init();
        carsCarousel.autoSlide(5000);  

        /* Modal */
        var testDriveModalEl = document.getElementById('test-drive-modal');

        var testDriveModal = new RB.Modal({
            el: testDriveModalEl,
            callbackOnModalOpen: function() {
                // Stop the carousel from rotating while the modal is open
                carsCarousel.stopAutoSlide();
            },
            callbackOnModalClose: function() {
                // Start the carousel from rotating once the modal is closed
                carsCarousel.startAutoSlide();
            }
        });

        // Initialize the modal
        testDriveModal.init();


        /* Ajax */
        var myAjax = new RB.Ajax();

        console.log(myAjax);


        /* Form */
        /*
        var testDriveFormEle = document.getElementById('test-drive-form');
        var testDriveForm = new RB.Form({
            el: 
        });*/


        /* CTA button */
        function ctaBtnClickHandler(event) {
            event.preventDefault();
        }

        var testDriveModalEl = document.getElementById('test-drive-cta-btn');
        testDriveModalEl.addEventListener('click',function(event){
            testDriveModal.open();
        });

    }

}

window.APP = APP;

