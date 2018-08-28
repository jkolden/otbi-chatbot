"use strict";

module.exports = {

  metadata: () => ({
    "name": "executeiBot",
    "properties": {
      "sessionId": {
        "type": "string",
        "required": false
      },
      "instance": {
        "type": "string",
        "required": true
      },
      "iBot": {
        "type": "string",
        "required": false
      }

    },
    "supportedActions": ["success", "requestLogon"]
  }),

  invoke: (conversation, done) => {
    const sessionId = conversation.properties().sessionId;
    const instance = conversation.properties().instance;
    const iBot = conversation.properties().iBot;

    var soap = require('soap');

    //required to strip the namespaces from the returned XML so that it can be parsed like JSON:
    var parseString = require('xml2js/lib/xml2js').parseString;
    var stripPrefix = require('xml2js/lib/processors').stripPrefix;

    var url = 'https://' + instance + '-fa-ext.oracledemos.com/analytics-ws/saw.dll/wsdl/v6';
    var args = {
      "path": "/shared/Custom/" + iBot,
      "sessionID": sessionId
    };

    soap.createClient(url, function(err, client) {
      if (err) {
        //if client can't be created the we don't have a proper instance
        conversation.transition("requestLogon");
        done();
      }
      client.executeIBotNow(args, function(err, result) {
          //ExecuteIBotNow does not contain a usable response payload so there is nothing to parse(!)
          //If the client executes then we just have to assume it was successful
          console.log(result);
          conversation.transition("success");
          done();

      });
    });
  }
};
