"use strict";

module.exports = {

    metadata: () => ({
        "name": "budgetAdjustment",
        "properties": {
            "toAccount": {
                "type": "string",
                "required": false
            },
            "fromAccount": {
                "type": "string",
                "required": false
            },
            "transferAmount": {
                "type": "string",
                "required": false
            },
            "instance": {
                "type": "string",
                "required": false
            },
            "password": {
                "type": "string",
                "required": false
            }
        },
        "supportedActions": ["success", "requestLogon"]
    }),

    invoke: (conversation, done) => {

        const toAccount = conversation.properties().toAccount;
        const fromAccount = conversation.properties().fromAccount;
        const password = conversation.properties().password;
        const instance = conversation.properties().instance;
        var transferAmount = conversation.properties().transferAmount;

        var soap = require('strong-soap').soap;
        var json2csv = require('json2csv');
        var zip = new require('node-zip')();
        var fs = require('fs');

        //if requested amount came from Alexa it will be in the form "fifteen" etc. so we need convert it:
        var WordToNumber = require("word-to-number-node");
        var w2n = new WordToNumber();
        if (isNaN(transferAmount)) {
            transferAmount = w2n.parse(transferAmount);
          };

        //All of these fields are required to build the budget import FBDI csv file:
        var fields = ["Run Name", "Status", "Ledger Id", "Budget Name", "Period", "Currency", "Segment1",
            "Segment2", "Segment3", "Segment4", "Segment5", "Segment6", "Segment7", "Segment8", "Segment9", "Segment10", "Segment11", "Segment12", "Segment13",
            "Segment14", "Segment15", "Segment16", "Segment17", "Segment18", "Segment19", "Segment20", "Segment21", "Segment22", "Segment23", "Segment24",
            "Segment25", "Segment26", "Segment27", "Segment28", "Segment29", "Segment30", "Budget Amount", "Ledger Name", "End of CSV"
        ];

        var budgetLineData = [{
            "Run Name": "From chatbot",
            "Status": "NEW",
            "Ledger Id": 300000047488112,
            "Budget Name": "Forecast",
            "Period": "12-17",
            "Currency": "USD",
            "Segment1": "101",
            "Segment2": "10",
            //only send the account number piece of the string:
            "Segment3": toAccount.substr(0, toAccount.indexOf('-')),
            "Segment4": "710",
            "Segment5": "000",
            "Segment6": "000",
            "Segment7": "",
            "Segment8": "",
            "Segment9": "",
            "Segment10": "",
            "Segment11": "",
            "Segment12": "",
            "Segment13": "",
            "Segment14": "",
            "Segment15": "",
            "Segment16": "",
            "Segment17": "",
            "Segment18": "",
            "Segment19": "",
            "Segment20": "",
            "Segment21": "",
            "Segment22": "",
            "Segment23": "",
            "Segment24": "",
            "Segment25": "",
            "Segment26": "",
            "Segment27": "",
            "Segment28": "",
            "Segment29": "",
            "Segment30": "",
            "Budget Amount": transferAmount,
            "Ledger Name": "US Primary Ledger",
            "End of CSV": "End Of Line"
        }, {
            "Run Name": "From chatbot",
            "Status": "NEW",
            "Ledger Id": 300000047488112,
            "Budget Name": "Forecast",
            "Period": "12-17",
            "Currency": "USD",
            "Segment1": "101",
            "Segment2": "10",
            //only send the account number piece of the string:
            "Segment3": fromAccount.substr(0, fromAccount.indexOf('-')),
            "Segment4": "710",
            "Segment5": "000",
            "Segment6": "000",
            "Segment7": "",
            "Segment8": "",
            "Segment9": "",
            "Segment10": "",
            "Segment11": "",
            "Segment12": "",
            "Segment13": "",
            "Segment14": "",
            "Segment15": "",
            "Segment16": "",
            "Segment17": "",
            "Segment18": "",
            "Segment19": "",
            "Segment20": "",
            "Segment21": "",
            "Segment22": "",
            "Segment23": "",
            "Segment24": "",
            "Segment25": "",
            "Segment26": "",
            "Segment27": "",
            "Segment28": "",
            "Segment29": "",
            "Segment30": "",
            "Budget Amount": transferAmount * -1,
            "Ledger Name": "US Primary Ledger",
            "End of CSV": "End Of Line"
        }];

        try {
            var result = json2csv({
                data: budgetLineData,
                fields: fields,
                hasCSVColumnTitle: false
            });
            //console.log(result);
        } catch (err) {
            // Errors are thrown for bad options, or if the data is empty and no fields are provided.
            // Be sure to provide fields if it is possible that your data array will be empty.
            console.error(err);
        }

        //create zip file
        zip.file('glbudgetdata.csv', result);
        var data = zip.generate({
            base64: true,
            compression: 'DEFLATE'
        });

        //just to generate a random number for Document name (duplicate doc names will cause the API to error)
        var ucmId = Math.floor((Math.random() * 10000000) + 1);

        var url = 'https://' + instance + '-fa-ext.oracledemos.com/publicFinancialCommonErpIntegration/ErpIntegrationService?WSDL';
        var args = {
            "document": {
                "Content": data,
                "FileName": "glBudgetData.zip",
                "ContentType": "zip",
                "DocumentTitle": "glBudgetData.zip",
                "DocumentAuthor": "casey.brown",
                "DocumentSecurityGroup": "FAFusionImportExport",
                "DocumentAccount": "fin$/budgetBalance$/import$",
                "DocumentName": "UCM" + ucmId
            },
            "notificationCode": "#NULL",
            "callbackURL": "#NULL",
            "jobOptions": "ValidationOption=N, ImportOption= Y, PurgeOption = N, ExtractFileType=ALL,InterfaceDetails=17"
        };


        var options = {};

        soap.createClient(url, options, function(err, client) {
          if (err) {
              //if client can't be created the we don't have a proper instance
              conversation.transition("requestLogon");
              done();
          }
            client.setSecurity(new soap.BasicAuthSecurity('casey.brown', password));
            client.importBulkData(args, function(err, result) {
                conversation.variable("essJobId", result.result);
                conversation.transition("success");
                done();
            });
        });
    }
};
