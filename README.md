# Dealership Sale Lander #

## Overview ##

I designed and developed this example from scratch in order to demonstrate how I might approach creating a landing page for a digital ad campaign for a client. For this one, I thought of a strategy to help a hypothetical customer reach their goals, designed the layout, isolated the backgrounds and the vehicles in photoshop, and wrote my own javascript library (RB.js) for all the functionality.  My library has classes for a mobile/desktop-friendly Carousel component, a Modal component, a Form component (with validation and flexibility for submitting via AJAX), AJAX handlers, and Analytics handlers. This library is reusable and can be added to any project in the future.

This page loads very fast on both mobile and desktop. It gets a ranking of 95%-100% on google PageSpeed: [https://developers.google.com/speed/pagespeed/insights/?url=http%3A%2F%2Fqa.rileyboyd.com%2Fdealership%2F](https://developers.google.com/speed/pagespeed/insights/?url=http%3A%2F%2Fqa.rileyboyd.com%2Fdealership%2F)

## Strategy considerations ##
I imagined a car dealership that was having a spring sale. The customer's goal (i.e., the client's goal) in this example is to get people into their dealership for test drives. In order to reach this goal, they might run an ad campaign that drives traffic to a landing page, where prospective buyers can fill out a form with their contact information, generating leads. A successful "conversion" in this case would be having a potential customer fill out the form and submit it. These conversions (and the user's other behaviour) is all tracked using analytics on this page.

When this form is submitted, an email with the user's information would be sent to the dealership, where a sales representative could follow up with the prospective buyer. The option to talk directly to a sales rep via phone or live chat it offered, in case the user wants to talk to someone immediately. These events are also tracked in analytics.

## Design Considerations ##
* Used full-width, high-quality photos in order show the product (cars) to the user in an attractive way.
* The carousel allows us to show the user multiple vehicles in multiple settings. The carousel is touch-enabled (i.e., swipeable) on both mobile/ipad and desktop.
* Fonts and colour palette would come from the (hypothetical) brand's style guide (since this company is fictional, I chose them myself)
* Auto-sliding animation showing the cars in different locations adds a bit of surpise and delight to the design.
* Call-To-Action button is blue in order to create contrast and draw attention to itself. In theory, this should help increase the conversion rate.
* The layout renders correctly on mobile (portrait and landscape), ipad, and desktop.

## Technical Considerations ##
* RB.js and App.js are namespaced, so variables aren't in the global namespace
* My Library can be added to any project, just include RB.js and RB.css. I have designed RB.js to be resusable, in order to save time when working on future projects.
* The CSS is mobile first. Mobile styles and overridden with tablet/desktop styles in so that mobile only gets the CSS it needs to render the page. JPEGs and PNGs are loaded in CSS. Smaller images are provided to Mobile using media queries.
* Made a Grunt build process that minifies + concatenates CSS and JS, compresses images, and does Cache-busting. 
* The page uses a spritesheet for the car images, in order to reduce the number of HTTP requests to the server, and speed up page loading. I have also used WebP images for browsers that support that image format (otherwise, it uses PNG).
