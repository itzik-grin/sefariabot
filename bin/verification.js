'use strict';

const PRIVATEKEY = '95B0528E61C2BD3676C96523F00B750C06B35A0B46F8DB5C3EDDD3393653FBA0';
const PRIVATEKEY_TEST = '750C06B35A0B46F823F00B653FBA0DB595B0C3EDDD3393528E61C2BD3676C965';
const PRIVATEKEY_WEBHOOK = '0B750C06B35A0B6C96528E61C2BD36723F046F8DB5C3EDDD3393653FBA095B05FFR';
var sha256 = require('sha256');
//fortest: eyJhcHBfaWQiOiIxMjM0NTYiLCJBQyI6IjE4NDU0ODQ4IiwiVUMiOiI2NTQ2NTEyIiwic2lnbiI6IjI5ODcyYWM0YjQ0NWJlZTNlMGU2ZTM0NTllOWRiY2QzZDBjYjllNjExOWFjNTE2ZmIxY2I0YTZlMTI1ZGIzMmEifQ==

var verification = function (req, res, next) {
    var APP_SECRET = req.headers['authorization'];
    var WEBHOOK_SECRET = req.headers['x-bon-webhook-secret'];
    if (!APP_SECRET && !WEBHOOK_SECRET) {
        ReturnReject('Invalid OAuth access token');
        return;
    }
    var obj;
    try {
        if (APP_SECRET)
            obj = JSON.parse(new Buffer(APP_SECRET, 'base64').toString('utf8'));
        else
            obj = JSON.parse(new Buffer(WEBHOOK_SECRET, 'base64').toString('utf8'));
    } catch (e) {
        ReturnReject('Invalid app secret');
        return;
    }

    var checkKey = sha256(obj.app_id + obj.ac + obj.uc + (APP_SECRET ? PRIVATEKEY : PRIVATEKEY_WEBHOOK));
    if (obj.test)
        checkKey = sha256(obj.app_id + obj.ac + obj.uc + PRIVATEKEY_TEST);
    if (checkKey == obj.sign) {
        req.app_id = obj.app_id;
        if (obj.test)
            next();
        else
            next();
        // checkAppActive(req.app_id)

    } else {
        ReturnReject('Invalid app secret');
    }
    function ReturnReject(message) {
        var err = new Error('Invalid app secret');
        err.status = 401;
        res.status(err.status);
        res.send({
            'error': {
                'message': message,
                'type': 'OAuthException',
                'code': 401
            }
        });
    }

    // function checkAppActive(appid) {
    //     var objectId = new ObjectID(appid)
    //     dbObj.find("general", "apps", undefined, {_id: objectId, removed: {$ne: true}})
    //         // dbObj.find("general", "apps", undefined, {_id: objectId})
    //         .then(function (result) {
    //                 var data = {};
    //                 if (result.length) {
    //                     next();
    //                 }
    //                 else {
    //                     ReturnReject('Invalid app secret (APP REMOVED!!!)');
    //                 }
    //
    //
    //             },
    //             function (error) {
    //                 //todo:????
    //                 next({status: 'Customers / GET NO ' + (customer_id ? customer_id : '')});
    //             });
    // }

};

module.exports = verification;
