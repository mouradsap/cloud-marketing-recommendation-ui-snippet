/*
 * SAP Marketing Recommendation Integration Example
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

/**
 * This is the snippet and its supported arguments.
 * 
 * <div data-carouselId="myCarouselID" (required) data-orientation="" (vertical /
 * horizontal) data-fontColor="" #XXXXXX data-userId="" data-userType=""
 * data-leadingItemIds="" data-leadingItemType="" data-basketItemIds=""
 * data-basketItemType="" data-context="" data-server=""
 * (required) data-language="" (EN / FR / ...) data-h="" (SALT) data-l54=""
 * (recocache) data-k13="" (recocache) data-v="" (recocache) data-k14=""
 * (recocache) > </div>
 * 
 */

document.addEventListener('DOMContentLoaded', function () {

    /**
	 * Helper function to load files.
	 */
    var load = ( () => {
      function file(type) {
        return (url, callback) => {
          return new Promise((resolve, reject) => {
            var condition = typeof callback == 'undefined' ? true : callback

            if (condition) {
              var element = document.createElement(type)
              document.head.appendChild(element);

              switch(type) {
                case "script":
                  element.type = 'text/javascript';
                  element.src = url;
                  break;
                case "link":
                  element.type = 'text/css';
                  element.rel = 'stylesheet';
                  element.href = url;
                case "img":
                  element.src = url;
                  break;
              }

              element.onload = () => { resolve(); }
              element.onerror = () => { reject(url); }
            } else {
              resolve();
            }
          });
        }
      }

      return {
        css: file('link'),
        js: file('script'),
        img: file('img')
      }
    })();

    function main() {
    	loadJQueryLib()
    	.then( loadSnippetData )
    	.then( ($carouselDivs) => Promise.all(loadSlickLib($carouselDivs)) )
    	.then( getRecommendationsAndSetData )
    }

    function loadJQueryLib() {
    	var pathTojQuery = 'https://code.jquery.com/jquery-2.2.1.min.js';
    	var condition = typeof jQuery=='undefined';
    	return load.js(pathTojQuery, condition)
    }

    function loadSnippetData() {
    	return new Promise( (resolve, reject) => {
    		var $carouselDivs = $('[data-carouselid]');

        $.each($carouselDivs, function() {
        	var dict = {};
        	$.each(this.attributes, function(index, attribute) {
        		dict[attribute.name] = attribute.value;
        	});    

        	$(this).data("params", dict);
        });

        resolve($carouselDivs);
      });
    }

    function loadSlickLib($carouselDivs) {

    	var pathToSlickJS =
    		"https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/slick.min.js";
    	var pathToSlickCSS =
    		"https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/slick.min.css";
    	var pathToSlickThemeCSS =
    		"https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/slick-theme.min.css";
    	var pathToRecoCSS = "./resources/css/reco-custom.css";
    	var pathToRecoArrowsCSS = "./resources/css/reco-arrows.css";

    	return [
    		load.js(pathToSlickJS),
    		load.css(pathToSlickCSS),
    		load.css(pathToSlickThemeCSS),
    		load.css(pathToRecoCSS),
    		load.css(pathToRecoArrowsCSS),
    		];
    }

    function getRecommendationsAndSetData() {
    	var $carouselDivs = $('[data-carouselid]');

    	$.each($carouselDivs, function() {        
    		var params = $(this).data("params")
    		getRecommendations(params)
    		.then( getProducts.bind(null, params) )
    		.then( preloadImages.bind(null) )
    		.then( setData.bind(null, $(this)) );
    	});
    }
    
    //Force https in all requests to avoid browser redirects
    function setHttpsInURL(serverURL){    	
    	var serverURLHttps = serverURL
    	if(serverURL.startsWith("http://")){
    		serverURLHttps = serverURL.replace("http","https");    	  	
    	}
    	return serverURLHttps;
    }
    

    function getRecommendations(params) {
    	var serviceURL = setHttpsInURL(params['data-server']) +
        	"/api/API_MKT_RECOMMENDATION_SRV/GetRecommendations?" +
        	addURLParam("UserType", formatWith("'", params['data-usertype'])) +
        	addURLParam("LeadingItemIds", formatWith("'", params['data-leadingitemids'])) +
        	addURLParam("LeadingItemType", formatWith("'", params['data-leadingitemtype'])) + 
        	addURLParam("BasketItemIds", formatWith("'", params['data-basketitemids'])) + 
        	addURLParam("BasketItemType", formatWith("'", params['data-basketitemtype'])) +
        	addURLParam("ContextParameters", formatWith("'", params['data-context'])) + 
        	addURLParam("_L54AD1F204_", formatWith("'", params['data-l54'])) + 
        	addURLParam("_K13_", formatWith("", params['data-k13'])) + 
        	addURLParam("_V_", formatWith("", params['data-v'])) + 
        	addURLParam("_K14_", formatWith("'", params['data-k14']));

    	return $.ajax({
    		type: "GET",
    		dataType: "json",
    		crossDomain: true,
    		headers: {
    			'_u_': params['data-userid'],
    			'_h_': params['data-h']
    		},
    		async: true,
    		url: serviceURL,
    		error: function() { console.log("ERROR: GetRecommendations call") },
    		success: function(data) { return data; }
    	});
    }

    function getProducts(params, data) {
    	var results = data.d.results;
    	var productsOrigins = {}

    	for (var i = 0; i < results.length; i++) {
    		var resultObjectType = results[i].ResultObjectType
    		var resultObjectId = results[i].ResultObjectId
    		if ( productsOrigins.hasOwnProperty(resultObjectType) )
    			productsOrigins[resultObjectType].push(resultObjectId);
    		else
    			productsOrigins[resultObjectType] = [resultObjectId];
    	}

    	// Each product origin required its own ajax call.
    	var requests = [];
    	for (var productOrigin in productsOrigins) {
    		var productIds = productsOrigins[productOrigin].join();
    		var serviceURL = setHttpsInURL(params['data-server']) +
    			"/api/API_MKT_RECOMMENDATION_SRV/GetProducts?" +
    			addURLParam("ProductIds", formatWith("'", productIds)) +
    			addURLParam("ProductOrigin", formatWith("'", productOrigin)) +
    			addURLParam("Language", formatWith("'", params['data-language'])) +
    			addURLParam("_L54AD1F204_", formatWith("'", params['data-l54'])) + 
    			addURLParam("_K13_", formatWith("", params['data-k13'])) + 
    			addURLParam("_V_", formatWith("", params['data-v'])) + 
    			addURLParam("_K14_", formatWith("'", params['data-k14']));
    		requests.push(
    				$.ajax({
    					type: "GET",
    					dataType: "json",
    					crossDomain: true,
    					async: true,
    					url: serviceURL,
    					error: function() { console.log("ERROR: getProduct call") },
    					success: function(data) { return data; }
    				})
    		);
    	}
    	return $.when.apply(undefined, requests);
    }

    function preloadImages() {
    	var products = processFrom(arguments).toProducts
    	var imageUrls = {}
    	for (var i = 0; i < products.length; i++)
    		if ( !imageUrls.hasOwnProperty(products[i].ProductImageUrl) )
    			imageUrls[products[i].ProductImageUrl] = i;

    	var imagesToPreload =  Object.keys(imageUrls).map(x => load.img(x))
		var dfd = $.Deferred();
   		Promise.all( imagesToPreload ).then(() => {dfd.resolve(products);});
  		return dfd.promise();

	     /**
			 * Processes arguments to concatenate all products from requested
			 * origins
			 */
  		function processFrom(info) {
  			var products = [];
  			for (var i = 0; i < info.length; i++) {
  				var response = info[i].d;
  				if (typeof response != "undefined")
  					products = products.concat(response.results)
  			}
  			return {toProducts : products.filter(x => { return x.ProductImageUrl !== ""; })}
  		}
    }

    function setData($carouselDiv, products) {
    	var params = $carouselDiv.data('params');
    	var carouselId = params['data-carouselid'];
	    var orientation = params['data-orientation'];
	    var isVertical = orientation == 'vertical' ? true : false;
	    var uniqueItemsContainer = carouselId + "-item-container";
	    var uniqueThumbnailContainer = carouselId + "-item-thumbnail-container";
	    var uniqueItemsText = carouselId + "-item-text";
	    var itemTextClasses = [uniqueItemsText, "item-text-properties"]
	    var itemContainerClasses = [uniqueItemsContainer, adaptCSSClassIf(isVertical,"item-container")]
	    var itemThumbnailContainerClasses = [uniqueThumbnailContainer, "thumbnail-container"]
	    var carouselClasses = ["carousel-container","custom-slick-btn", adaptCSSClassIf(isVertical,"carousel")]
	    var $carousel = $("<div>", {"class" : carouselClasses.join(" "), "id" : carouselId});
	    for (var i = 0; i < products.length; i++) {
	    	var productId = products[i].ProductId;
	        var productName = products[i].ProductName;
	        var productImageUrl = products[i].ProductImageUrl;
	        var productTargetUrl = products[i].ProductTargetUrl;
	
	        $carousel.append($("<div>")
	                  .append($("<div>", {"class" : itemContainerClasses.join(" ")})
	                  .append($("<a>", {"target":"_top", "href":productTargetUrl})
	                  .append($("<div>", {"class" :itemThumbnailContainerClasses.join(" ")})
	                    .append($("<img>", {"class" : "thumbnail-product",
	                        "src" : productImageUrl}))))
	                  .append($("<div>", {"class" : itemTextClasses.join(" "),"text": productName}))));
	    }
	
	    $carouselDiv.append($carousel)
	    // Additional set up for vertical and horizontal
	    if ( isVertical ) {
	    	setVerticalCarouselImageWidth($carouselDiv, uniqueThumbnailContainer);
	        setVerticalCarouselCenter($carouselDiv, uniqueItemsContainer);	
	        $(window).resize(function() {
	        	setVerticalCarouselImageWidth($carouselDiv, uniqueThumbnailContainer);
	        	setVerticalCarouselCenter($carouselDiv, uniqueItemsContainer);
	        	setTextToImageWidth($carousel);
	        });
	    } else {
	    	var mq = window.matchMedia('(max-width: 1200px)');
	        mq.addListener( () => setTextToImageWidth($carousel) );
	    }
	
	    setTextToImageWidth($carousel);
	    setCSSPropertiesFromSnippet(params, uniqueItemsText);
	      
	    createSlick($carousel, isVertical);
	
	    function setCSSPropertiesFromSnippet(params, uniqueItemsText) {
	    	var fontColor = params['data-fontcolor'];
	        fontColor = typeof fontColor != "undefined" ? fontColor : "#000000";
	        $("."+uniqueItemsText).css('color', fontColor);
	    }
	
	    // HTML + Carousel API = no way to make the text follow image's width
	    function setTextToImageWidth($carousel) {
	    	$carousel.find(".thumbnail-product").each((i,element) => {
	    		var $carouselItem = $(element).parent().parent().parent();
	    		$carouselItem.find(".item-text-properties").css('width', $(element).innerWidth())
	        });
	    }
	
	    // Undefined behavior if images not same dimensions
	    function setVerticalCarouselImageWidth($carouselDiv, uniqueThumbnailContainer) {
	    	var $images = $carouselDiv.find(".thumbnail-product");
	        var ratio = $images.prop("naturalHeight") / $images.prop("naturalWidth");
	        var newHeight = $carouselDiv.width() * ratio;
	        $('.'+uniqueThumbnailContainer).css({
	        	"height": newHeight,
	            "width": $carouselDiv.width()
	        });
	    }
	      
	    function setVerticalCarouselCenter($carousel, uniqueItemsContainer) {
	    	var $images = $carouselDiv.find(".thumbnail-product");
	    	var availableWidth =  $carouselDiv.width() - $images.width();
	        var paddingForCenter = Math.max(availableWidth / 2, 0)
	        $('.'+uniqueItemsContainer).css("padding-left", paddingForCenter); 
	    }
    }

    function createSlick($carousel, isVertical) {
    	$carousel.slick({
    		lazyLoad: 'progressive',
    		infinite : true,
    		vertical : isVertical,
    		verticalSwiping : isVertical,
    		initialSlide:2,
    		swipeToSlide: true,
    		centerMode: true,
    		slidesToShow:2,
    		variableWidth: !isVertical,
    		touchThreshold: 25,
    		waitForAnimate: false,
    		autoplay:false,
    		autoplaySpeed:3500,
    		arrows: !isVertical,
    		dots: false,
    		speed:500,
    	});

    	// Set the height to the provided div's height
    	if ( isVertical ) {
    		var $slickWindow = $carousel.find('.slick-list');
    		var $providedDiv = $carousel.parent().parent();

    		// work around for vertical carousel's height
    		$carousel.on('setPosition', () => {
    			adjustCarouselVerticalHeight($slickWindow, $providedDiv);
    		})

    		adjustCarouselVerticalHeight($slickWindow, $providedDiv);
    	}

		function adjustCarouselVerticalHeight($slickWindow, $providedDiv) {
			$slickWindow.height($providedDiv.height()-100);
			$slickWindow.css('padding',"0px 0px");
		}
    }

    /*
	 * Converts to the correct parameter format accepted by URL Request
	 */
    function formatWith(c, p) {
    	return (typeof(p) != 'undefined' ? (p.length > 0 ? c+p+c : "''") : "''");
    }

    /*
	 * Add URL parameter if argument is not empty
	 */
    function addURLParam(key, value) {
    	return value != "''" ? "&"+key+"="+value : "";
    }

    /*
	 * Adapt CSS class to the orientation
	 */ 
    function adaptCSSClassIf(isVertical, CSSClass) {
    	return isVertical ? CSSClass.concat("-v") : CSSClass.concat("-h");
    }
    
    main();
});
