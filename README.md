# otbi-chatbot

## Included in this repository:
- `package-s1_otbi.zip` contains the exported package from MCS, including the mobile backend and the API code.
- `OTBIBotGSE.zip` contains the exported chatbot YAML
- `s1_otbiccs` contains the API source code

## Dependencies
Some of the API calls use libraries that are useful in the Alexa interaction. For example we use libraries that convert spoken words to numbers that can be used in the spreadsheet budget upload. All of the depencies are listed in the Package.json file.

## Installation

1) Clone this repository to a local directory:
  `$ git clone https://github.com/jkolden/otbi-chatbot.git`

2) Launch the MCS instance that will host the backend code and open the Packages application. Select the `New Import` option and load the `package-s1_otbi.zip` folder. This should load both the mobile backend as well as the API code.

3) Alternately, Step 2 can be done manually by creating a mobile bakcend manually and loading the API code in the s1_otbiccs directory.
  - Cd to the newly created directory and navigate to the folder containing the API source code `cd s1_otbiccs`
  - Install the dependencies via `npm install`
  - Compress or zip the s1_otbiccs folder

4) Update the chatbot with the secret key and backend id of the mobile backend.

## How to use this chatbot

This chatbot allows the user to query a few different OTBI reports. The following is an overview of each report and the interactions allowed:

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



