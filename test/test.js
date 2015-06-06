var CONSTANT = {
              pinUrl: 'https://trakt.tv/pin/9999',
              client_id: 'ajfhaklsjdhaksjdaksdjhkajsdh',
              client_secret: 'kjasdkhkjsakdsajkdsaj'
}

var assert = require("assert")
var trakter = require('../index.js');  // our module

var fullConfig;
function getBadPIN()
{
   return 1234
}

beforeEach (function () {
    fullConfig = {};
    fullConfig.pinUrl= CONSTANT.pinUrl;
    fullConfig.client_id= CONSTANT.client_id;
    fullConfig.client_secret= CONSTANT.client_secret;
    fullConfig.redirect_uri= "urn:ietf:wg:oauth:2.0:oob";
    fullConfig.state = "aufhof9qw12nsdv42";

    fullConfig.options = {};
    fullConfig.options.host = 'api-v2launch.trakt.tv';
    fullConfig.options.port = 443;

    fullConfig.options.headers = {};
    fullConfig.options.headers['Content-type'] = 'application/json';
    fullConfig.options.headers['trakt-api-version'] = 2;
    fullConfig.options.headers['trakt-api-key'] = CONSTANT.client_id;
    fullConfig.token =  { access_token: 'hjagsfkagskajsdkajsgds',
                      token_type: 'bearer',
                      expires_in: 7776000,
                      refresh_token: 'akjshdkajshdakjshdakjshdakjsdhasda',
                      scope: 'public',
                      created_at: 1429725940 
                      }
})

describe('trakter.getConfig', function(){
    it('should be a method', function(){
      assert.strictEqual(typeof trakter.getConfig, 'function');
    });
    it('should return null if unconfigured', function(){
      assert.strictEqual(trakter.getConfig(), null);
    });
    it('should return an equal config if fully configured', function(done){
      trakter.setConfig(fullConfig,getBadPIN,function (err,next){
        assert.deepEqual(trakter.getConfig(), fullConfig);
        done();
        });
    });
  })
describe('trakter.setConfig', function(){
    it('should be a method', function(){
      assert.strictEqual(typeof trakter.setConfig, 'function');
    });
    it('should not pass error if configuration is valid', function(done){
      trakter.setConfig(fullConfig, getBadPIN, function (err) {
        assert.strictEqual(typeof err, 'undefined');
        done();
        });
    });
    it('should callback', function(done){
      trakter.setConfig(fullConfig, getBadPIN, function (err) {
        done();
        //assert.strictEqual(true, true);
        });
    });
    it('should pass error if no getToken supplied', function(done){
      delete fullConfig.token;
      trakter.setConfig(fullConfig, null, function (err) {
        assert.strictEqual(err.code, 98);
        done();
        });
    });
    it('should pass error if no token and pinUrl is not supplied', function(done){
      delete fullConfig.pinUrl;
      delete fullConfig.token;
      trakter.setConfig(fullConfig, getBadPIN, function (err) {
        assert.strictEqual(err.message, 'Trakter: No URL for PIN in configuration');
        done();
        });
    });
    it('should pass error if client_id is not supplied', function(done){
      delete fullConfig.client_id;
      trakter.setConfig(fullConfig, getBadPIN, function (err) {
        assert.strictEqual(err.message, 'Trakter: No client ID in configuration');
        done();
        });
    });
    it('should pass error if client_secret is not supplied', function(done){
      delete fullConfig.client_secret;
      trakter.setConfig(fullConfig, getBadPIN, function (err) {
        assert.strictEqual(err.message, 'Trakter: No client secret in configuration');
        done();
        });
    });
    it('should pass error if no token and invalid PIN', function(done){
      this.timeout(10000);
      delete fullConfig.token;
      trakter.setConfig(fullConfig, getBadPIN, function (err) {
        assert(err,"error not returned");
        assert.strictEqual(err.name, 'TrakterBadResponse');
        done();
        });
    });
})
describe('trakter.request', function(){
    it('should be a method', function(){
      assert.strictEqual(typeof trakter.request, 'function');
    });
    it('should pass error if bad method', function(done){
      trakter.request({path:'/users/jonjump/watched/shows', method:'NOTGET'},null,function (err){
        assert.strictEqual(err.code, 97);
        done();
        })
    });
  })
 
