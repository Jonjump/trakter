/**
*
* Provides access from node to the Trakt API Version 2
* 
* @class trakter
* @static
* @requires https
*/
module.exports = {
    getConfig: getConfig,
    setConfig: setConfig,
    request: request
    };
var https = require('https');
var config;
var CODEOK = {
        GET: [200],
        PUT: [200],
        POST: [200,201],
        DELETE: [200,204]
    }

// Public
/** 
* @method setConfig
* @param {Object} config A config object
* @param {Function} getPIN A function which returns a valid PIN
* @param {Function} next(err) 
* @example
*     trakter.setConfig( {config,getPIN,next)
*/
function setConfig (conf,getPIN,next) {
    // check the token
    config = clone(conf);
    if (!conf.client_id || typeof conf.client_id != 'string') {
        next(new Error ('Trakter: No client ID in configuration'));
        return;
    }
    if (!conf.client_secret || typeof conf.client_secret != 'string') {
        next(new Error ('Trakter: No client secret in configuration'));
        return;
    }
    // set defaults
    config.redirect_uri= config.redirect_uri || "urn:ietf:wg:oauth:2.0:oob";
    config.state = config.state || "aufhof9qw12nsdv42";
    

    config.options = config.options || {};
    config.options.host = config.options.host || 'api-v2launch.trakt.tv';
    config.options.port = config.options.port || 443;

    config.options.headers = config.options.headers || {};
    config.options.headers['Content-type'] = config.options.headers['Content-type'] || 'application/json';
    config.options.headers['trakt-api-version'] = config.options.headers['trakt-api-version'] || 2;
    config.options.headers['trakt-api-key'] = config.client_id;

    if (!config.token) {
        if (!getPIN || typeof getPIN != 'function') {
            var e = new Error ('Trakter: setConfig - missing getPIN function');
            e.name = 'TrakterGetPIN';
            e.code = 98;
            next (e);
            return;
        }
        if (!conf.pinUrl || typeof conf.pinUrl != 'string') {
            next(new Error ('Trakter: No URL for PIN in configuration'));
            return;
        }
        exchangePIN(getPIN(conf.pinUrl),next);
    } else {
        next();
    }
}

/** 
* Returns a copy of the configuration for trakter
* 
* Typically, this is saved by your application for reuse later
* @method getConfig
* @example
*     config = trakter.getConfig();
*/
function getConfig () {
    return clone(config);
}
/** 
* make a request to Trakt.tv
* @method request
* @param {Object} options The options for the call
* @param {Object} data The data for the call, or null
* @param {Function} next(err,traktResponseString)
* @example
*     trakter.request(options,data,next )
*/
function request (suppliedOptions,data,next) 
{
    var options = makeOptions(suppliedOptions);
    switch (options.method ? options.method.toUpperCase() : "BADMETHOD") {
        case "PUT":
        case "POST":
                    var dataString = JSON.stringify(data);
                    options.headers['Content-Length'] = dataString.length;
                    var req = https.request(options,requestDone);
                    req.end(dataString);
                    break;
        case "GET":
        case "DELETE":
                    var req = https.request(options,requestDone);
                    req.end();
                    break;
                    
        case "BADMETHOD":
        default:
                    var e = new Error('trakter: invalid method or not specified');
                    e.name = 'TrakterBadMethod';
                    e.code = 97;
                    next (e);
                    break;
    }

    function requestDone(res) {
        res.setEncoding('utf8');
        var responseString = '';
        res.on('error', function(err) {
            next (err,null);
        });
        res.on('data', function(data) {
            responseString += data;
        });
        res.on('end', function() {
            var err = checkError(options.method,res);
            if ( err !== null) {
                next (err);
            } else {
                next (null,JSON.parse(responseString));
            }
        });
    }
}
/*
-----------------------------------------------------------------------------------------------------------
*/
// returns Error object if error or null
function checkError(method,res) {
    var descriptions = {
        200:	'Success',
        201:	'Success - new resource created (POST)',
        204:	'Success - no content to return (DELETE)',
        400:	'Bad Request - request couldn\'t be parsed',
        401:	'Unauthorized - OAuth must be provided',
        403:	'Forbidden - invalid API key or unapproved app',
        404:	'Not Found - method exists, but no record found',
        405:	'Method Not Found - method doesn\'t exist',
        409:	'Conflict - resource already created',
        412:	'Precondition Failed - use application/json content type',
        422:	'Unprocessable Entity - validation errors',
        429:	'Rate Limit Exceeded',
        500:	'Server Error',
        503:	'Service Unavailable - server overloaded',
        520:	'Service Unavailable - Cloudflare error',
        521:	'Service Unavailable - Cloudflare error',
        522:	'Service Unavailable - Cloudflare error '  
    }
    if (CODEOK[(method).toUpperCase()].indexOf(res.statusCode)>=0) {
        return null;
    }
    var e = new Error('trakter: ' + descriptions[res.statusCode]);
    e.name = 'TrakterBadResponse';
    e.code = res.statusCode
    return e;
}
function exchangePIN(PIN,next)
{
    var options = makeOptions({path:'/oauth/token', method:'POST'});
    var data = makeData({   code:PIN,
                             grant_type:'authorization_code',
                             response_type:'code' });
    // post(options,data,tokenDone, next);
    request (options,data,tokenDone);


    function tokenDone(err,data)
    {
        err = err || data.error;
        if (err) {
            next (err);
            return;
        }
        
        config.token = data;
        next (null,data);
    }
}

function makeOptions (suppliedOptions) {
    // augment supplied options with defaults 
    var options = clone(suppliedOptions);
    options.host = options.host || config.options.host;
    options.port = options.port || config.options.port;
    options.headers = options.headers || {}
    options.headers['Content-type'] = options.headers['Content-type'] || config.options.headers['Content-type']; 
    options.headers['trakt-api-key'] = options.headers['trakt-api-key'] || config.options.headers['trakt-api-key']; 
    options.headers['trakt-api-version'] = options.headers['trakt-api-version'] || config.options.headers['trakt-api-version'];
    if (!options.headers['Authorization'] && config.token && config.token.access_token) {
        options.headers['Authorization'] =  "Bearer "+config.token.access_token; 
    }
    return options;
}
    
function makeData (suppliedData) {
    // augment supplied data (for POST) with defaults
    var data = clone (suppliedData);
    data.client_id = data.client_id ||  config.client_id;
    data.client_secret = data.client_secret || config.client_secret;
    data.redirect_uri= data.redirect_uri || config.redirect_uri;
    data.state= data.state || config.state;
    return data;
};

function clone(obj) {
    return (obj) ? JSON.parse(JSON.stringify(obj)) : null ;
}
