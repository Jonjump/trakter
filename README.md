# trakter
A simple node module to access Trakt API v2.

#Purpose
[Trakt.tv](https://trakt.tv/oauth/applications) keeps track of movies and Television that you want to watch, have watched, have collected, and much else.
This module makes it easy.  There has been a great deal of good work done on the V1 trakt api, and some good modules, but I wanted to build one for the new version 2 of the API with no dependencies other than standard node, and keep it as simple as possible.

#Installation


## Installing Trakter
You can install the stable branch (recommended) into your project using the node package manager:

    npm install trakter
    
Or globally using 

    npm install -g trakter
    
If you want the dev branch, you probably already have a good idea of how to proceed.

#Configuration

##1. Register YOUR Application with trakt.tv
1. Register as a user at [Trakt.TV](https://trakt.tv/auth/join) if you haven't already.  This is free, unless you choose to go premium.  You do not need premium to use the API. 
2. Register your application.  At the time of writing, this is the ["Create An App"](https://trakt.tv/oauth/applications) link at the bottom of the page.
3. Go to your trakt.tv account, and look up your application details.  You will be needing:
    * Client ID: (a long string of text)
    * Client Secret: (another long string of text)
    * PIN URL: (a URL)

##2. Configure Trakter with your application details
Create an initial configuration with your application registration details from the step above.
```javascript
// application registration details from trakt.tv 
config = {  pinUrl: <a url> 
              client_id: <client id>,
              client_secret: <client secret>
              };
```
##3. Authorise your application for the Trakt.tv user
Call the setConfig method of Trakter with the config your created, and a function which returns the PIN from a user (see below for an example):     
```javascript
trakter.setConfig(config,getPIN, function (err) {
  if (err) {
    console.log(err);
    console.log('Cannot configure trakt.tv interface');
    process.exit(9);
  }
```
##4. Save the config (which now includes the user authorisation) for use later
Once trakter is initialised and an authorisation is granted, you should use trakter.getConfig() to return the complete config object, which you can save and reuse the next time your application starts.

##5. Make API calls from your application
API calls are made with Trakter.request (suppliedOptions,data,next).

- suppliedOptions are passed to the API, and as a minimum, you need path and method.  If you pass other options, they will override the defaults Trakter chooses, but you should not normally need to.
- data is for those API calls which require it, otherwise just pass null.
- next is the callback function.

```javascript
  trakter.request({path:'/shows/game-of-thrones', method:'GET'},null,showResult);
```
#Quickstart
Once trakter is initialised and an authorisation is granted, you should use trakter.getConfig() to return the complete config object, which you can save and reuse the next time you application starts. Here is a fully working example to get you started:
```javascript
var CONSTANT = {
              configFilename:'./config.json',
              pinUrl: '<your-value-here>',
              client_id: '<your-value-here>',
              client_secret: '<your-value-here>'
}
var nconf = require('nconf');
var trakter = require ('./trakter');
var readlineSync = require('readline-sync');

nconf.argv()
      .env()
      .file({ file: CONSTANT.configFilename });
nconf.load();

var config = nconf.get('trakter')

if (!config) {
  console.log ('Cannot read config - using defaults');
  config = {  pinUrl: CONSTANT.pinUrl,
              client_id: CONSTANT.client_id,
              client_secret: CONSTANT.client_secret
              };
  nconf.set('trakter',config);
}

trakter.setConfig(nconf.get('trakter'),getPIN, function (err) {
  if (err) {
    console.log(err);
    console.log('Cannot configure trakt.tv interface');
    process.exit(9);
  }
  nconf.set('trakter',trakter.getConfig()); // save the configuration
  nconf.save();

  trakter.request({path:'/shows/game-of-thrones', method:'GET'},null,showResult);
  });

function showResult(err,data) {
  console.log(data);
}


function getPIN(PINUrl)
{
  console.log('Go to ' + PINUrl + ' and get PIN');
  return readlineSync.question('Enter Trakt.TV PIN :');
}
```
#More Detail
## Managing configurations
I generally use nconf.  See the example below.
## Getting the user's PIN
readlineSync is a nice simple way to get the PIN from the command line.  See the example below.
## Tests
There is a basic set of unit tests included.  You will need to add your application registration details to test.js to run them.
#How to contribute
## To Do
 - implement the "refresh" token
 - add functionality to use the oauth workflow to avoid the PIN where possible
 - browser version using xmlhttlrequest and a require.js wrapper

