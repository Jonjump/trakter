var CONSTANT = {
              configFilename:'./config.json',
              pinUrl: 'https://trakt.tv/pin/<xxxx>',  // application registration details from trakt.tv
              client_id: '',                          // application registration details from trakt.tv
              client_secret: ''                       // application registration details from trakt.tv
}
var nconf = require('nconf');  // used to save the configuration
var trakter = require ('./trakter');
var readlineSync = require('readline-sync');  // used to get the PIN from the user

// get the configuration if we have one
nconf.argv()
      .env()
      .file({ file: CONSTANT.configFilename });
nconf.load();
var config = nconf.get('trakter')

// if no configuration already, initialise one, and then save it
if (!config) {
  console.log ('Cannot read config - using defaults');
  config = {  pinUrl: CONSTANT.pinUrl,
              client_id: CONSTANT.client_id,
              client_secret: CONSTANT.client_secret
              };
  nconf.set('trakter',config);
}

// pass the configuration to trakter
trakter.setConfig(nconf.get('trakter'),getPIN, function (err) {
  if (err) {
    console.log(err);
    console.log('Cannot configure trakt.tv interface');
    process.exit(9);
  }
  // save the config in case it has been modified
  nconf.set('trakter',trakter.getConfig());
  nconf.save();
  // make a test call
  trakter.request({path:'/shows/game-of-thrones', method:'GET'},null,showResult);
  });


// show the call results on the console
function showResult(err,data) {
  console.log('error' + err);
  console.log(data);
}


function getPIN(PINUrl)
{
  console.log('Go to ' + PINUrl + ' and get PIN');
  return readlineSync.question('Enter Trakt.TV PIN :');
}
