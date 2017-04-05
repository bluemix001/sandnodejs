/**
****************************************************************************
* Copyright 2017 IBM
*
*   AlchemyAPI in Node.js
*
*   By JeanCarl Bisson (@dothewww)
*   More info: https://ibm.biz/nodejs-alchemyapi
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
****************************************************************************
*/

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require("express");

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require("cfenv");

// create a new express server
var app = express();
var fs = require("fs");
var mustache = require("mustache");
var watson = require("watson-developer-cloud");
var templates = require("./lib/templates");

// serve the files out of ./public as our main files
app.use(express.static(__dirname + "/public"));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// Insert application endpoints here
app.get("/analyze", function (req, res) {
  const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');

  const nlu = new NaturalLanguageUnderstandingV1({
    // note: if unspecified here, credentials are pulled from environment properties:
    // NATURAL_LANGUAGE_UNDERSTANDING_USERNAME &  NATURAL_LANGUAGE_UNDERSTANDING_PASSWORD
    // username: '<username>'.
    // password: '<password>',
    version_date: NaturalLanguageUnderstandingV1.VERSION_DATE_2016_01_23
  });

  const options = {
    //"text": "string", // Text to analyze
    //"html": "string", // HTML to analyze
    "url": req.query.url, // URL to analyze
    "features": {
      "concepts": {
        "limit": 8 // Maximum number of concepts to return
      },
      "emotion": {
        "document": true // Set this to false to hide document-level emotion results
      },
      "entities": {
        "limit": 50, // Maximum number of entities to return
        "sentiment": true, // Set this to true to return sentiment information for detected entities
        "emotion": true // Set this to true to analyze emotion for detected keywords
      },
      "keywords": {
        "limit": 50, // Maximum number of keywords to return
        "sentiment": true, // Set this to true to return sentiment information for detected keywords
        "emotion": true // Set this to true to analyze emotion for detected keywords
      },
      "metadata": {},
      "relations": {},
      "semantic_roles": {
        "limit": 50, // Maximum number of semantic_roles results to return ,
        "keywords": false, // Set this to true to return keyword information for subjects and objects
        "entities": false // Set this to true to return entity information for subjects and objects
      },
      "sentiment": {
        "document": true // Set this to false to hide document-level sentiment results
      },
      "categories": {}
    }
  };

  nlu.analyze(options, function(err, response) {
    console.log(response);
    if (err) {
      res.send(err);
      return;
    }

    if (req.query.format == "json") {
      res.send(response);
    } else {
      res.send(mustache.render(templates.analyze, response));
    }
  });
});


// start server on the specified port and binding host
app.listen(appEnv.port, "0.0.0.0", function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});



