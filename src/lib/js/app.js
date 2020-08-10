var APP = function(page) {

    if (page == 'home') {

        var analyticsConfig = {
            googleAnalytics: {
                trackingId: "UA-12345678-20"
            },
            amplitude: {
                apiKey: "abc123456789101112131415161718192021"
            }
        }

        /* Ajax */
        var myAjax = new RB.Ajax();

        /* Anaylitics */
        var analytics = new RB.Analytics(analyticsConfig);

        analytics.init();

        /* Carousel */
        var carsCarouselEl = document.getElementById('cars-carousel');

        // Array to keep track of which slides have been shown. 
        // I am only tracking one "Slide shown" event for each slide. 
        // A slide can be shown multiple times, but I only want to track it once.
        var slidesShown = [];

        // Get background images
        var backgroundImageDivs = document.getElementsByClassName('backgrounds')[0].getElementsByClassName('bg-img');

        // Add the "loaded" class to the background images
        // This helps to defer css image loading until after the page has loaded 

        for (var i=0; i < backgroundImageDivs.length; i++) {
            backgroundImageDivs[i].classList.add('loaded');                
        }

        // Create an RB.Carousel instance
        var carsCarousel = new RB.Carousel({
            el: carsCarouselEl,
            loop: true,
            transitionTime: 400,
            nav: true,
            initCallback: function() {

                isWebpSupported(function(webpIsSupported){

                    // WebP images can be smaller, and faster-loading, than PNGs. But, not all browsers support them.
                    // So, I check to see if I can use WebP images.
                    console.log('is webp supported? '+webpIsSupported);

                    for (var i=0; i < this.slides.length; i++) {
                        this.slides[i].classList.add(webpIsSupported?'loaded-webp':'loaded');                
                    }

                }.bind(this));
            },
            callbackOnslideShown: function(slideIndex) {


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

                // Track analytics event for slide being shown, if slide hasn't already been shown
                if (!arrayContains(slidesShown,slideIndex)) {

                    analytics.send({
                        action: 'Slide Shown',
                        category: 'Landing Page',
                        props: {
                            label: 'Slide '+slideIndex+1
                        },
                        callback: function(platform) {
                            console.log('EVENT TRACKING: '+platform+'. Slide '+(slideIndex+1)+' has been shown in.\n\n\n');
                        }
                    });

                    slidesShown.push(slideIndex);

                }

            },
            callbackOnNavBtnClick: function(btnDirection) {

                // Track analytics navigation arrow being clicked
                analytics.send({
                    action: 'click',
                    category: 'Landing Page',
                    props: {
                    label: 'Carousel Navigation '+btnDirection
                    },
                    callback: function(platform) {
                        console.log('EVENT TRACKING: '+platform+'. '+btnDirection+' Nav button clicked callback has been called.\n\n\n');
                    }
                });

            }
        });
        carsCarousel.init();
        carsCarousel.autoSlide(4000);  



        var formWasSentSuccessfully = false;

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
                    callback: function(platform) {
                        console.log('EVENT TRACKING: '+platform+'. Modal has opened\n\n\n');
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
                    callback: function(platform) {
                        console.log('EVENT TRACKING: '+platform+'. Modal has closed\n\n\n');
                    }
                });

                // If the form has been submitted, reset the form after the modal closes
                if (formWasSentSuccessfully) {
                    testDriveForm.resetForm();
                    formWasSentSuccessfully = false;
                }

            },
            callbackOnCloseBtnClicked: function() {

                // Track modal close event
                analytics.send({
                    action: 'click',
                    category: 'Landing Page',
                    props: {
                    label: 'Form Modal Close Button'
                    },
                    callback: function(platform) {
                        console.log('EVENT TRACKING: '+platform+'. Form modal close button clicked\n\n\n');
                    }
                });
            },            
        });

        // Initialize the modal
        testDriveModal.init();


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
                    callback: function(platform) {
                        console.log('EVENT TRACKING: '+platform+'. Form Submit Button has been clicked\n\n\n');
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
                            callback: function(platform) {
                                console.log('EVENT TRACKING: '+platform+'. Form has been submitted successfully\n\n\n');
                            }
                        });

                        formWasSentSuccessfully = true;

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
                            callback: function(platform) {
                                console.log('EVENT TRACKING: '+platform+'. Form submission attempted, but there was a server error\n\n\n');
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
                    callback: function(platform) {
                        console.log('EVENT TRACKING: '+platform+'. Form Cancel Button has been clicked\n\n\n');
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
                callback: function(platform) {
                    console.log('EVENT TRACKING: '+platform+'. CTA Button has been clicked\n\n\n');
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
                callback: function(platform) {
                    console.log('EVENT TRACKING: '+platform+'. Chat Button has been clicked\n\n\n');
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
                callback: function(platform) {
                    console.log('EVENT TRACKING: '+platform+'. Address Link has been clicked\n\n\n');
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
                callback: function(platform) {
                    console.log('EVENT TRACKING: '+platform+'. Sales Phone Link has been clicked\n\n\n');
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
                callback: function(platform) {
                    console.log('EVENT TRACKING: '+platform+'. Service Phone Link has been clicked\n\n\n');
                }
            });

        }

    }


    /************************
    Utility Functions
    ************************/

    // Checks if a value is in an array. a = array, b = value
    function arrayContains(a,b) {

        for (var i = 0; i < a.length; i++) {

            if (a[i] === b) {
                return true;
            }

        }

        return false;

    }


    // This function determines if WebP images can be used on this browser
    function isWebpSupported(callback){
        
        // If the browser doesn't support bitmap, return
        if(!window.createImageBitmap){
            callback(false);
            return;
        }

        // A base64 image
        var webpdata = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoCAAEAAQAcJaQAA3AA/v3AgAA=';


        // Use my RB.Ajax instance defined earlier
        myAjax.get(
            webpdata,
            function(response){
                // If createImageBitmap succeeds, then we can use WebP
                createImageBitmap(response).then(function(){
                    callback(true);
                }, function(){
                    callback(false);
                });;
            },
            function(response){
                callback(false);
            },
            "blob"
        );


    }

}

window.APP = APP;

