# otbi-chatbot

## Background
This is the code for a chatbot that communicates with Oracle's Cloud ERP environments. The main intent is to show how chatbots can communicate with OTBI reports but there are also supported interactions for creating File-Based Imports as well as executing OTBI iBots. This demo was originally built for the Gartner Magic Quadrant demo in February, 2018, and has since been demonstrated over 600 times by Oracle's sales engineers around the globe. The main communication channel is Amazon's Alexa device though the bot might also be demonstrated using Facebook Messenger.

## Included in this repository:
- `package-s1_otbi.zip` contains the exported package from MCS, including the mobile backend and the API code.
- `OTBIBotGSE.zip` contains the exported chatbot YAML
- `s1_otbiccs` contains the API source code
- `My Briefing Book Agent.catalog` is the OTBI briefing book which can be loaded to each instance that supports this flow. This will allow SE's to use the Briefing Book interaction described below.
- `Payables Balance by Customer.catalog` is an OTBI archive that supports the Supplier Balance interaction. This is not required to be on the actual instance but rather is provided in the event that the SE wants to show real time data for one of the interactions. Note that this archive should probably be renamed as it contains supplier balances and not customer balances.

## Dependencies
Some of the API calls use libraries that are useful in the Alexa interaction. For example we use libraries that convert spoken words to numbers that can be used in the spreadsheet budget upload. All of the depencies are listed in the Package.json file:

- [soap](https://www.npmjs.com/package/soap)
- [strong-soap](https://www.npmjs.com/package/strong-soap)
- [json2csv](https://www.npmjs.com/package/json2csv)
- [node-zip](https://www.npmjs.com/package/node-zip)
- [word-to-number-node](https://www.npmjs.com/package/word-to-number-node)
- [xml2js](https://www.npmjs.com/package/xml2js)

## Installation

1) Clone this repository to a local directory:
  `$ git clone https://github.com/jkolden/otbi-chatbot.git`

2) Launch the MCS instance that will host the backend code and open the Packages application. Select the `New Import` option and load the `package-s1_otbi.zip` folder. This should load both the mobile backend as well as the API code.

3) Alternately, Step 2 can be done manually by creating a mobile bakcend manually and loading the API code in the s1_otbiccs directory.
  - Cd to the newly created directory and navigate to the folder containing the API source code `cd s1_otbiccs`
  - Install the dependencies via `npm install`
  - Compress or zip the s1_otbiccs folder

4) Update the chatbot with the secret key and backend id of the mobile backend.

## APIs Used by Backend Code
All of the backend code for the interactions use soap web services. The various API's used for the interactions are as follows:
- Supplier Balances: [executeSqlQuery](https://docs.oracle.com/cd/E14571_01/bi.1111/e16364/methods.htm#BIEIT342)
- GL Balances: [executeSqlQuery](https://docs.oracle.com/cd/E14571_01/bi.1111/e16364/methods.htm#BIEIT342)
- Budget Surplus: [executeSqlQuery](https://docs.oracle.com/cd/E14571_01/bi.1111/e16364/methods.htm#BIEIT342)
- Budget Transfer: [importBulkData](https://docs.oracle.com/en/cloud/saas/financials/18b/oeswf/ERP-Integration-Service-ErpIntegrationService-svc-9.html)
- Emailing Briefing Book: [executeIBotNOW](https://docs.oracle.com/cd/E14571_01/bi.1111/e16364/methods.htm#BIEIT1106)

## Authentication
- All of the APIs use basic authentication with casey.brown as the user.
- The OTBI API's use a method (executeSQLQuery) that requires a valid sessionId be passed in the payload. For this reason, the first command issued to the bot must be `Log me on`. This runs the [logon](https://docs.oracle.com/cd/E14571_01/bi.1111/e16364/methods.htm#BIEIT254) method that returns a sessionId. The bot saves this for the duration of the session and passes it as a parameter to each subsequent OTBI API call. After the interactions are complete, the user can use the utterance `log me off` which executes the [logoff](https://docs.oracle.com/cd/E14571_01/bi.1111/e16364/methods.htm#BIEIT252) method which revokes the sessionId.
- The chatbot YAML includes the instance and password that the API code will point to and the instance is passed in every interaction as an input parameter. We have typically hardcoded this to a single instance but if this bot will be used more frequently there is likely a better approach. For example, in prior versions we created a simple ords-enabled apex app that users could access to enter their chosen instance and password. They would be given a short id number and then they could pass this id to the bot during the logon process and the API code would look up that id and store the associated instance and password.


## How to use this chatbot

This chatbot allows the user to query a few different OTBI reports. The following is an overview of each report and the interactions allowed.

For all OTBI interactions the user **must** first issue a logon command so that the bot can have a valid OTBI sessionId to pass to subsequent interactions.

### Logon
This bot interaction executes the OTBI logon method to retrieve a valid OTBI sessionId. This is stored as a user variable and passed to subsequent interactions.

#### Sample utterances for logon:
- Log me on

#### Sample response for logon:
- Ok I've logged you on

### Supplier Balances
This bot interaction queries an OTBI report of open accounts payable balances. In order to keep the list of suppliers brief for an improved Alexa experience we only included three (3) suppliers in the entity definition:
  - United Parcel Service
  - Staples
  - Office Depot

#### Sample utterances for supplier balances:
- How much do we owe [UPS]? [Staples, Office Depot]
- How much do we owe our suppliers?
  - user will be prompted with an LOV to choose from

#### Sample response for supplier balances:
- We owe Office Depot a balance of $16,627,861.00

### General Ledger Balances
This bot interaction queries an OTBI report of general ledger budget vs actual amounts for FY17. The code should probably be updated to reflect FY18 balances depending on whether this interaction will be used going forward. Again for simplicity, we only include a few accouts in the entity definition:
 - Airfare
 - Office Rent
 - Electricity / Water
 - Cleaning
 - Salaries

#### Sample utterances for general ledger balances:
- What is the account balance for Cleaning? [Salaries, Electricity, etc.]
- What is our budget vs actual?
  - user will be prompted with an LOV to choose from

#### Sample response for general ledger balances:
- The budget amount for Cleaning is $1,180,000.00  and the actual amount spent is $1,187,772.00

### Budget Surplus
This interaction queries a report that displays the excess of budget amounts over actual amounts for a range of accounts. The API code then retrieves the first record in the array response sorted by budget surplus in descending order.

#### Sample utterances for budget surplus:
- Which account has the largest budget surplus

#### Sample response for budget surplus:
- Commisions has the largest budget surplus:  $1,481,132.00

### Budget Transfer
This interaction allows the user to initiate a budget transfer using the SOAP API importBulkData. This is the web service version of the File-Based Data Import that allows for transaction upload via excel spreadsheet.

#### Sample utterances for budget transfer:
- User: Transfer budget from salaries to cleaning
  Bot: How much do you want to transfer
  User: 9,000 [spoken: nine thousand]

#### Sample response for budget transfer:
- Ok, I've initiated that budget transfer to ucf3-ectz.  The transfer will be finalized when the budget manager submits the Validate and Upload  Budgets process.

At this point the user can navigate to the Submit and Monitor Requests page of their instance and track the ESS Job Id's for the transfer.

### Emailing Briefing Book
This interaction allows the user lauch an OTBI "agent" that emails a package of documents to a list of users. The OTBI agent is included in this folder and should be uploaded to each instance prior to the demo (if the user wishes to demo this interaction). The package is included in the repo with the name `My Briefing Book Agent.catalog` and it should be unarchived as user BIADMIN in the folder directory `Shared Folders/Custom` of the SE's cloud instance.

#### Sample utterances for briefing book:
- Email briefing book to my colleagues
- Email these reports to my team
- Send these reports to my team

#### Sample response for briefing book:
- Ok, the reports have been sent

At this point the user can navigate to email client for casey.brown to retrieve the emailed package of reports.

### Logoff
This bot interaction executes the OTBI logoff method to end the OTBI session.

#### Sample utterances for logoff:
- Log me off

#### Sample response for logon:
- Ok your session has been ended















