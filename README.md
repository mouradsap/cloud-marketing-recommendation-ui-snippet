# SAP Cloud Platform Snippet Recommendations

Example of html/js/css snippet to integrate SAP Marketing Recommendation Cache on SAP Cloud Platform

## Description

This code sample showcases the consumption of the [Marketing Recommendation Cache service] (https://api.sap.com/api/API_MKT_RECOMMENDATION_SRV/resource) into a carousel display of products that may be used on a commerce web shop. The recommendations are coming from SAP Marketing Cloud passing through a data buffer layer residing on SAP Cloud Platform.

With the help of the HTML code snippet, and mandatory parameters, the sample JavaScript first makes a call to get recommendations, followed by another call to get the products master data. It then displays the result as a carousel using [slick-carousel](https://github.com/kenwheeler/slick).

## Requirements

* An **SAP Marketing Cloud tenant** (SAP Marketing On-premise is not supported), and access to an **SAP Cloud Platform tenant**.
* An available *recommendation scenario* configured through the SAP Marketing Cloud **Manage Recommendations** and **Recommendation Scenario** applications. ([Example](https://help.sap.com/viewer/b88f770e4b7c4ecead5477e7a6c7b8f7/1902.500/en-US/f2b2a435679e4edbbc9821f967445a6a.html)).
* A local or remote web server to run HTML code snippet

## Download and Installation

1. Clone the repository to your local environment.
2. Use the html tag <script> inside yout HTML page to include the JavaScript file reco_script.js. Refer to [snippet_example.html](https://github.com/SAP/cloud-marketing-recommendation-ui-snippet/blob/master/main/snippet_example.html)

## Configuration

There is no required configuration for the snippet code. It is only required to pass the parameter values as per the html file example. As mentioned above, a prerequisite is to have an active Recommendation Scenario available on the underlying SAP Marketing Cloud system. Please refer to the [SAP Marekting Cloud help documentation](https://help.sap.com/viewer/b88f770e4b7c4ecead5477e7a6c7b8f7/1902.500/en-US/f2b2a435679e4edbbc9821f967445a6a.html) for additional instructions.
This Recommendation Scenario will provide the values for some of the mandatory parameters (l54, k13, k14,v).


## How to obtain support

SAP does not offer support for the Sample Code.
This Sample Code is provided as-is. 

## License
Copyright (c) 2019 SAP SE or an SAP affiliate company. All rights reserved.
This file is licensed under the SAP Sample Code License except as noted
otherwise in the [LICENSE file](blob/master/LICENSE).
