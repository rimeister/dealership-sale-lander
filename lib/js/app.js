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
                        console.log('EVENT TRACKED: Slide '+(slideIndex+1)+' has been shown.\n\n\n');
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
                        console.log('EVENT TRACKED: '+btnDirection+' Nav button clicked callback has been called.\n\n\n');
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
                        console.log('EVENT TRACKED: Modal has opened\n\n\n');
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
                        console.log('EVENT TRACKED: Modal has closed\n\n\n');
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
                        console.log('EVENT TRACKED: Form modal close button clicked\n\n\n');
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
                        console.log('EVENT TRACKED: Form Submit Button has been clicked\n\n\n');
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

                        // Track form submission success event
                        analytics.send({
                            action: 'Form Submission',
                            category: 'Landing Page',
                            props: {
                            label: 'Success'
                            },
                            callback: function() {
                                console.log('EVENT TRACKED: Form has been submitted successfully\n\n\n');
                            }
                        });

                    },
                    // Error callback
                    function(response){

                        showErrorMsg();

                        // Track form submission server error event
                        analytics.send({
                            action: 'Form Submission',
                            category: 'Landing Page',
                            props: {
                            label: 'Error'
                            },
                            callback: function() {
                                console.log('EVENT TRACKED: Form submission attempted, but there was a server error\n\n\n');
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
                        console.log('EVENT TRACKED: Form Cancel Button has been clicked\n\n\n');
                    }
                });

            }
        });

        testDriveForm.init();
        

        /* Button/link click event listeners */
        var ctaBtnEle = document.getElementById('test-drive-cta-btn');
        ctaBtnEle.addEventListener('click',ctaBtnClickHandler);

        var chatBtnEle = document.getElementById('live-chat-btn');
        chatBtnEle.addEventListener('click',chatBtnClickHandler);

        var addressAnchorEle = document.getElementById('address-anchor');
        addressAnchorEle.addEventListener('click',addressAnchorClickHandler);

        var salesPhoneAnchorEle = document.getElementById('sales-phone-anchor');
        salesPhoneAnchorEle.addEventListener('click',salesPhoneAnchorClickHandler);

        var servicePhoneAnchorEle = document.getElementById('service-phone-anchor');
        servicePhoneAnchorEle.addEventListener('click',servicePhoneAnchorClickHandler);

        /* Button/link click event handlers */
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
                    console.log('EVENT TRACKED: CTA Button has been clicked\n\n\n');
                }
            });

        }

        function chatBtnClickHandler(event) {

            event.preventDefault();

            // This would open a third party customer service live chat
            alert('NOTE: This button would open a third party customer service live chat');

            // Track the Chat Button Click Event
            analytics.send({
                action: 'click',
                category: 'Landing Page',
                props: {
                label: 'Chat Button'
                },
                callback: function() {
                    console.log('EVENT TRACKED: Chat Button has been clicked\n\n\n');
                }
            });

        }

        function addressAnchorClickHandler(event) {

            // Track the Chat Button Click Event
            analytics.send({
                action: 'click',
                category: 'Landing Page',
                props: {
                label: 'Address Link'
                },
                callback: function() {
                    console.log('EVENT TRACKED: Address Link has been clicked\n\n\n');
                }
            });

        }

        function salesPhoneAnchorClickHandler(event) {

            // Track the Sales Phone Number Link Click Event
            analytics.send({
                action: 'click',
                category: 'Landing Page',
                props: {
                label: 'Sales Phone Link'
                },
                callback: function() {
                    console.log('EVENT TRACKED: Sales Phone Link has been clicked\n\n\n');
                }
            });

        }

        function servicePhoneAnchorClickHandler(event) {

            // Track the Service Phone Number Link Click Event
            analytics.send({
                action: 'click',
                category: 'Landing Page',
                props: {
                label: 'Service Phone Link'
                },
                callback: function() {
                    console.log('EVENT TRACKED: Service Phone Link has been clicked\n\n\n');
                }
            });

        }

    }

}

window.APP = APP;

