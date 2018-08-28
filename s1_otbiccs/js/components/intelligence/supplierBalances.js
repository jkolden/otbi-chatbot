"use strict";

module.exports = {

    metadata: () => (
        {
            "name": "supplierBalances",
            "properties": {
                "supplier" : { "type": "string", "required": false },
                "instance" : { "type": "string", "required": false },
                "sessionId": { "type": "string", "required": false }
            },
            "supportedActions": ["success", "requestLogon"]
        }
    ),

    invoke: (conversation, done) => {
      const instance = conversation.properties().instance;
      const supplier = conversation.properties().supplier;
      const sessionId = conversation.properties().sessionId

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
       "sql": "SET VARIABLE PREFERRED_CURRENCY='Local Currency';SELECT\n  0 s_0,\n  \"Payables Invoices - Installments Real Time\".\"Business Unit\".\"Business Unit Name\" s_1,\n  \"Payables Invoices - Installments Real Time\".\"Supplier Site\".\"Supplier Site Name\" s_2,\n  \"Payables Invoices - Installments Real Time\".\"Supplier\".\"Supplier Name\" s_3,\n  DESCRIPTOR_IDOF(\"Payables Invoices - Installments Real Time\".\"Business Unit\".\"Business Unit Name\") s_4,\n  \"Payables Invoices - Installments Real Time\".\"Invoices Installment Amounts\".\"Gross Amount\" s_5,\n  \"Payables Invoices - Installments Real Time\".\"Invoices Installment Amounts\".\"Remaining Amount In Entered Currency\" s_6\nFROM \"Payables Invoices - Installments Real Time\"\nWHERE\n(\"Invoices Installment Amounts\".\"Remaining Amount In Entered Currency\" > 0)\nORDER BY 1, 2 ASC NULLS LAST, 5 ASC NULLS LAST, 4 ASC NULLS LAST, 3 ASC NULLS LAST\nFETCH FIRST 250001 ROWS ONLY",
              "outputFormat": "json",
              "executionOptions": {
                 "refresh": "TRUE",
                 "async": "?",
                 "maxRowsPerPage": "?",
                 "presentationInfo": "?"
              },
              "sessionID": sessionId
           };
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
            parseString(resp,  { explicitArray : false, ignoreAttrs : true,tagNameProcessors: [stripPrefix]}, function (err, output) {
                 var arr = output['rowset']['Row'];
                 var picked = arr.find(o => o.Column3 === supplier);

            conversation.variable("supplierBalance", formatter.format(parseInt(picked.Column5)));
            conversation.transition("success");
            done();
      				});

         });
     });

    }
};
