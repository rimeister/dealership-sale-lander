var APP = APP || {};

APP.init = function(page) {

    if (page == 'home') {

        var analyticsConfig = {
            googleAnalytics: {
                trackingId: "UA-12345678-20"
            }/*,
            amplitude: {
                apiKey: "abc123456789101112131415161718192021"
            }*/
        }

        var analytics = new RB.Analytics(analyticsConfig);

        analytics.init();

        /* Carousel */
        var carsCarouselEl = document.getElementById('cars-carousel');

        // Create an RB.Carousel instance
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

                // Track analytics event for slide being shown
                analytics.send({
                    action: 'Slide Shown',
                    category: 'Landing Page',
                    props: {
                        label: 'Slide '+slideIndex+1
                    },
                    callback: function() {
                        console.log('Slide shown callback has been called.');
                    }
                });

            },
            callbackOnNavBtnClick: function(btnDirection) {

                // Track analytics navigation arrow being clicked
                analytics.send({
                    action: 'click',
                    category: 'Landing Page',
                    props: {
                    label: 'Carousel Navigation '+btnDirection
                    },
                    callback: function() {
                        console.log(btnDirection+' Nav button clicked callback has been called.');
                    }
                });

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
    
                // Track Modal Open Event
                analytics.send({
                    action: 'opened',
                    category: 'Landing Page',
                    props: {
                    label: 'Form Modal'
                    },
                    callback: function() {
                        console.log('Modal has opened');
                    }
                });
            },
            callbackOnModalClose: function() {

                // Start the carousel from rotating once the modal is closed
                carsCarousel.startAutoSlide();

                // Track modal close event
                analytics.send({
                    action: 'closed',
                    category: 'Landing Page',
                    props: {
                    label: 'Form Modal'
                    },
                    callback: function() {
                        console.log('Modal has closed');
                    }
                });
            },
            callbackOnCloseBtnClicked: function() {

                // Track modal close event
                analytics.send({
                    action: 'click',
                    category: 'Landing Page',
                    props: {
                    label: 'Form Modal Close Button'
                    },
                    callback: function() {
                        console.log('Form modal close button clicked');
                    }
                });
            },            
        });

        // Initialize the modal
        testDriveModal.init();


        /* Ajax */
        var myAjax = new RB.Ajax();


        /* Form */
        var testDriveFormEle = document.getElementById('test-drive-form');
        var testDriveForm = new RB.Form({
            el: testDriveFormEle,
            onFormSubmit: function(formData,showSuccessMsg,showErrorMsg) {

                // Track the form submit button click
                analytics.send({
                    action: 'click',
                    category: 'Landing Page',
                    props: {
                    label: 'Form Submit Button'
                    },
                    callback: function() {
                        console.log('Form Submit Button has been clicked');
                    }
                });

                // Submit the form to the REST endpoint
                myAjax.submit(
                    'https://jsonplaceholder.typicode.com/posts',
                    'post',
                    formData,
                    // Success callback
                    function(response){
                        showSuccessMsg();

                        // Track backend form submission success events
                        analytics.send({
                            action: 'Form Submission',
                            category: 'Landing Page',
                            props: {
                            label: 'Success'
                            },
                            callback: function() {
                                console.log('Form has been submitted successfully');
                            }
                        });

                    },
                    // Error callback
                    function(response){

                        showErrorMsg();

                        // Track form submission server error events
                        analytics.send({
                            action: 'Form Submission',
                            category: 'Landing Page',
                            props: {
                            label: 'Error'
                            },
                            callback: function() {
                                console.log('Form submission attempted, but there was a server error');
                            }
                        });

                    }
                );

            },
            cancelCallback: function() {

                // Close the modal
                testDriveModal.close();

                // Track the form cancel button click
                analytics.send({
                    action: 'click',
                    category: 'Landing Page',
                    props: {
                    label: 'Form Cancel Button'
                    },
                    callback: function() {
                        console.log('Form Cancel Button has been clicked');
                    }
                });

            }
        });

        testDriveForm.init();
        

        /* CTA button */
        function ctaBtnClickHandler(event) {

            event.preventDefault();

            // Open the modal
            testDriveModal.open();

            // Track the CTA Button Click Event
            analytics.send({
                action: 'click',
                category: 'Landing Page',
                props: {
                label: 'CTA Button'
                },
                callback: function() {
                    console.log('CTA Button has been clicked');
                }
            });

        }

        var ctaBtnEle = document.getElementById('test-drive-cta-btn');
        ctaBtnEle.addEventListener('click',ctaBtnClickHandler);

    }

}

window.APP = APP;

