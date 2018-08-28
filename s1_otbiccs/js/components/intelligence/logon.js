"use strict";

module.exports = {

    metadata: () => ({
        "name": "logon",
        "properties": {
            "instance": {
                "type": "string",
                "required": false
            },
            "password": {
                "type": "string",
                "required": false
            },
            "returnedId": {
                "type": "string",
                "required": false
            }
        },
        "supportedActions": ["success", "fail"]
    }),

    invoke: (conversation, done) => {
        const instance = conversation.properties().instance;
        const password = conversation.properties().password;

        //call the SOAP API to return an OTBI logon:
        var soap = require('soap');
        var url = 'https://' + instance + '-fa-ext.oracledemos.com/analytics-ws/saw.dll/wsdl/v6';
        var args = {
            "name": "casey.brown",
            "password": password
        };

        soap.createClient(url, function(err, client) {
          if (err) {
            //wsdl couldn't be contacted due to instance unavailable etc.
            conversation.transition("fail");
            done();
          }
            client.logon(args, function(err, result) {
                if (err) {
                    //api call failed due to wrong password etc.
                    conversation.transition("fail");
                    done();
                }
                //api call was successful and sessionId is returned
                var sessionId = result['sessionID']['$value'];
                conversation.variable('returnedId', sessionId);
                conversation.transition("success");
                done();
            });
        });
    }
};
