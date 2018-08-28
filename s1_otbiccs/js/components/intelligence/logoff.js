"use strict";

module.exports = {

    metadata: () => ({
        "name": "logoff",
        "properties": {
          "instance": {
              "type": "string",
              "required": false
          },
            "returnedId": {
                "type": "string",
                "required": false
            }
        },
        "supportedActions": []
    }),

    invoke: (conversation, done) => {
        const returnedId = conversation.properties().returnedId;
        const instance = conversation.properties().instance;

        //call the SOAP API to return an OTBI logon:
        var soap = require('soap');
        var url = 'https://' + instance + '-fa-ext.oracledemos.com/analytics-ws/saw.dll/wsdl/v6';
        var args = {
         "sessionID": returnedId
      }

        soap.createClient(url, function(err, client) {
            client.logoff(args, function(err, result) {
            conversation.reply({ text: 'Thank you, your session has been ended.' } );
            conversation.transition();
            done();
            });
        });
    }
};
