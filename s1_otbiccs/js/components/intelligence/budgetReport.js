"use strict";

module.exports = {

    metadata: () => ({
        "name": "budgetReport",
        "properties": {
            "account": {
                "type": "string",
                "required": false
            },
            "sessionId": {
                "type": "string",
                "required": false
            },
            "instance": {
                "type": "string",
                "required": true
            },
            "actualAmount": {
                "type": "string",
                "required": false
            },
            "budgetAmount": {
                "type": "string",
                "required": false
            },

        },
        "supportedActions": ["success", "requestLogon"]
    }),

    invoke: (conversation, done) => {
        //  const instance = conversation.properties().instance;
        //  const password = conversation.properties().password;
        const sessionId = conversation.properties().sessionId;
        const account = conversation.properties().account;
        const instance = conversation.properties().instance;
        const actualAmount = conversation.properties().actualAmount;
        const budgetAmount = conversation.properties().budgetAmount;

        var soap = require('soap');

        //required to strip the namespaces from the returned XML so that it can be parsed like JSON:
        var parseString = require('xml2js/lib/xml2js').parseString;
        var stripPrefix = require('xml2js/lib/processors').stripPrefix;

        //currency formatter function
        var formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            // the default value for minimumFractionDigits depends on the currency
            // and is usually already 2
        });

        var url = 'https://' + instance + '-fa-ext.oracledemos.com/analytics-ws/saw.dll/wsdl/v6';
        var args = {
            "sql": "SET VARIABLE PREFERRED_CURRENCY='User Preferred Currency 1';SELECT s_0, s_1, s_2, s_3, s_4, s_5, s_6, s_7, s_8, s_9, s_10, s_11, s_12 FROM (\nSELECT\n   0 s_0,\n   \"General Ledger - Balances Real Time\".\"- Currency Type\".\"Currency Type\" s_1,\n   \"General Ledger - Balances Real Time\".\"Balancing Segment\".\"Balancing Segment Level 31 Code\" s_2,\n   \"General Ledger - Balances Real Time\".\"Natural Account Segment\".\"Account Level 31 Code\" s_3,\n   \"General Ledger - Balances Real Time\".\"Natural Account Segment\".\"Natural Account Segment Level 31 Description\" s_4,\n   \"General Ledger - Balances Real Time\".\"Scenario\".\"Scenario\" s_5,\n   \"General Ledger - Balances Real Time\".\"Time\".\"Fiscal Year Number\" s_6,\n   CASE WHEN \"General Ledger - Balances Real Time\".\"Scenario\".\"Scenario\" ='Actual' THEN \"General Ledger - Balances Real Time\".\"Balances\".\"Ending Balance\" ELSE 0 END s_7,\n   CASE WHEN \"General Ledger - Balances Real Time\".\"Scenario\".\"Scenario\" ='Budget' THEN \"General Ledger - Balances Real Time\".\"Balances\".\"Ending Balance\" ELSE 0 END s_8,\n   CASE WHEN \"General Ledger - Balances Real Time\".\"Scenario\".\"Scenario\" ='Budget' THEN \"General Ledger - Balances Real Time\".\"Balances\".\"Ending Balance\" ELSE 0 END - CASE WHEN \"General Ledger - Balances Real Time\".\"Scenario\".\"Scenario\" ='Actual' THEN \"General Ledger - Balances Real Time\".\"Balances\".\"Ending Balance\" ELSE 0 END s_9,\n   REPORT_SUM(CASE WHEN \"General Ledger - Balances Real Time\".\"Scenario\".\"Scenario\" ='Actual' THEN \"General Ledger - Balances Real Time\".\"Balances\".\"Ending Balance\" ELSE 0 END BY \"General Ledger - Balances Real Time\".\"Natural Account Segment\".\"Natural Account Segment Level 31 Description\",\"General Ledger - Balances Real Time\".\"Time\".\"Fiscal Year Number\",\"General Ledger - Balances Real Time\".\"- Currency Type\".\"Currency Type\",\"General Ledger - Balances Real Time\".\"Balancing Segment\".\"Balancing Segment Level 31 Code\",\"General Ledger - Balances Real Time\".\"Natural Account Segment\".\"Account Level 31 Code\") s_10,\n   REPORT_SUM(CASE WHEN \"General Ledger - Balances Real Time\".\"Scenario\".\"Scenario\" ='Budget' THEN \"General Ledger - Balances Real Time\".\"Balances\".\"Ending Balance\" ELSE 0 END - CASE WHEN \"General Ledger - Balances Real Time\".\"Scenario\".\"Scenario\" ='Actual' THEN \"General Ledger - Balances Real Time\".\"Balances\".\"Ending Balance\" ELSE 0 END BY \"General Ledger - Balances Real Time\".\"Natural Account Segment\".\"Natural Account Segment Level 31 Description\",\"General Ledger - Balances Real Time\".\"Time\".\"Fiscal Year Number\",\"General Ledger - Balances Real Time\".\"- Currency Type\".\"Currency Type\",\"General Ledger - Balances Real Time\".\"Balancing Segment\".\"Balancing Segment Level 31 Code\",\"General Ledger - Balances Real Time\".\"Natural Account Segment\".\"Account Level 31 Code\") s_11,\n   REPORT_SUM(CASE WHEN \"General Ledger - Balances Real Time\".\"Scenario\".\"Scenario\" ='Budget' THEN \"General Ledger - Balances Real Time\".\"Balances\".\"Ending Balance\" ELSE 0 END BY \"General Ledger - Balances Real Time\".\"Natural Account Segment\".\"Natural Account Segment Level 31 Description\",\"General Ledger - Balances Real Time\".\"Time\".\"Fiscal Year Number\",\"General Ledger - Balances Real Time\".\"- Currency Type\".\"Currency Type\",\"General Ledger - Balances Real Time\".\"Balancing Segment\".\"Balancing Segment Level 31 Code\",\"General Ledger - Balances Real Time\".\"Natural Account Segment\".\"Account Level 31 Code\") s_12\nFROM \"General Ledger - Balances Real Time\"\nWHERE\n((\"Ledger\".\"Chart Of Account\" = 'US Chart of Accounts') AND (\"Time\".\"Fiscal Calendar Name\" = 'AccountingMMYY') AND (\"Ledger\".\"Ledger Name\" = 'US Primary Ledger') AND (\"- Currency\".\"Apps Local Currency Code\" = 'USD') AND (\"- Amount Type\".\"Amount Type\" = 'Base') AND (\"- Currency\".\"Apps Local Currency Code\" = 'USD') AND (\"Natural Account Segment\".\"Account Tree Filter\" = 'All Account Values') AND (\"- Currency Type\".\"Currency Type\" = 'Total') AND (\"Line of Business\".\"Segment Code\" = '10') AND (\"Time\".\"Fiscal Year Number\" = 2017) AND (\"Balancing Segment\".\"Balancing Segment Level 31 Code\" = '101') AND (\"Natural Account Segment\".\"Account Level 31 Code\" BETWEEN '60000' AND '65600') AND (\"- Scenario\".\"Scenario\" IN ('Actual', 'Budget')))\n) djm ORDER BY 1, 12 ASC NULLS LAST, 3 ASC NULLS LAST, 4 ASC NULLS LAST, 5 ASC NULLS LAST, 2 ASC NULLS LAST, 7 ASC NULLS LAST\nFETCH FIRST 250001 ROWS ONLY",
            "outputFormat": "json",
            "executionOptions": {
                "refresh": "TRUE",
                "async": "?",
                "maxRowsPerPage": "?",
                "presentationInfo": "?"
            },
            "sessionID": sessionId
        };

        /*Sample response:
                   { Column0: '0',
         Column1: 'Total',
         Column2: '101',
         Column3: '60512',
         Column4: '60512-Airfare',
         Column5: 'Budget',
         Column6: '2017',
         Column7: '0',
         Column8: '1650000',
         Column9: '1650000',
         Column10: '1404262.28',  //actual
         Column11: '245737.72',   //budget minus actual
         Column12: '1650000'      //budget
        }
         */
        soap.createClient(url, function(err, client) {
            if (err) {
                //if client can't be created the we don't have a proper instance
                conversation.transition("requestLogon");
                done();
            }
            client.executeSQLQuery(args, function(err, result) {
                //isolate the part of the response that we want:
                var resp = result['return']['rowset'];
                //strip the namespaces so we can treat the resulting object like JSON:
                parseString(resp, {
                    explicitArray: false,
                    ignoreAttrs: true,
                    tagNameProcessors: [stripPrefix]
                }, function(err, output) {
                    var arr = output['rowset']['Row'];

                    //find the object for the account requested in the Bot conversation
                    var record = arr.find(o => o.Column4 === account);
                    var fullAccount = record.Column4;
                    var accountDesc = fullAccount.substr(fullAccount.indexOf('-')+ 1);

                    conversation.variable("account", accountDesc);
                    conversation.variable("actualAmount", formatter.format(parseInt(record.Column10)));
                    conversation.variable("budgetAmount", formatter.format(parseInt(record.Column12)));
                    conversation.transition("success");
                    done();
                });

            });
        });
    }
};
