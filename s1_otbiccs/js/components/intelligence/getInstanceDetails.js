"use strict";

module.exports = {

    metadata: () => ({
        "name": "getInstanceDetails",
        "properties": {
            "instance": {
                "type": "string",
                "required": false
            },
            "password": {
                "type": "string",
                "required": false
            },
            "logonId": {
                "type": "string",
                "required": false
            }
        },
        "supportedActions": ["success", "fail"]
    }),

    invoke: (conversation, done) => {
        const instance = conversation.properties().instance;
        const password = conversation.properties().password;
        var logonId = conversation.properties().logonId;

        /*This code performs a lookup of instance name and password so that SC doesn't
         * need to manually enter logon details. When using the Alexa interface this
         * just helps the logon to Cloud ERP happen faster. The app is a small apex app here:
         * https://javadb-gse00011925.db.us2.oraclecloudapps.com/apex/f?p=40300293
         */

        //if requested logonId came from Alexa it will be in the form "fifteen" so we need convert it:
        var WordToNumber = require("word-to-number-node");
        var w2n = new WordToNumber();
        if (isNaN(logonId)) {
             logonId = w2n.parse(logonId);
          };

        //call a REST API on our apex instance to get instance and password
        //The user should have added their instance and password so we can do a lookup with just the id:
        var http = require('https');
        var url = 'javadb-gse00011925.db.us2.oraclecloudapps.com';
        var options = {
            host: url,
            path: '/apex/bots/logins/' + logonId,
            method: 'GET'
        };

        http.request(options, function(res) {
            res.setEncoding('utf8');
            res.on('data', function(chunk) {
                var resp = (JSON.parse(chunk));
                conversation.variable("instance", resp.items[0].instance);
                conversation.variable("password", resp.items[0].password);
                conversation.transition("success");
                done();
            });
        }).end();
    }
};
