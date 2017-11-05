'use strict';
/*global helperObj _integrationsService generalError:true*/

var express = require('express');
var router = express.Router();
// var mongo_url = 'mongodb://localhost:27017/message_api';

// var Timestamp = require('mongodb').Timestamp;
// var ObjectID = require('mongodb').ObjectID;

/* GET users listing. */

var errJson = {
    'status': false,
    'error': {
        'message': 'Invalid data.',
        'type': 'Integrations',
        'code': 2030
    }
};
router.get('/:integration_id?', function (req, res, next) {
    var integration_id = req.params.integration_id;
    if (integration_id) {
        var validation = validateId(integration_id);
        if (!validation.status) {
            return next(validation);
        }
        _integrationsService.GetIntegrationById(req.app_id, integration_id).then(function (result) {
                return next(result);
            },
            function (error) {
                next(generalError);
            });
    } else {
        _integrationsService.GetAllIntegration(req.app_id).then(function (result) {
                return next(result);
            },
            function (error) {
                next(generalError);
            });
    }
});

router.post('/', function (req, res, next) {
    errJson = {
        status: false,
        error: {
            message: 'Invalid data.',
            type: 'Integrations',
            code: 2030
        }
    };
    if (!req.body || !Object.keys(req.body).length)
        next(errJson);
    else if (req.body.length) {
        errJson.error.code = 2040;
        return next(errJson);
    } else {
        var data = req.body;
        _integrationsService.CreateIntegration(req.app_id, data).then(function (result) {
            next({status: true, integration: result.integration, warning: result.warning});
        }, function (errResult) {
            next({status: false, error: errResult.error});
        });
    }

    // if (integrationsArray.indexOf(type) == -1) {
    //     errJson.error.message = "Invalid integration type.";
    //     errJson.error.code = 2050;
    //     return next(errJson);
    // }
    // else {
    // dbObj.find(req.app_id, "integrations", undefined, {"type": type})
    //     .then(function (result) {
    //         if (result && result.length) {
    //             errJson.error.code = 2280;
    //             errJson.error.message = "integration type " + type + " already exist";
    //             return next(errJson);
    //         }
    //         else {
    // validateAllIntegrations(type, req, next, "insert")
    //     .then(function (result) {
    //         if (!result.status)
    //             return next(result);
    //         insertOrUpdateIntegration(req.app_id, "insert", result.object).then(function (resultDB) {
    //             var ID = resultDB.integration._id;
    //             setHook(req, ID, type).then(function (resultHook) {
    //                 var response;
    //                 if (!resultHook.status) {
    //                     removeIntegration(req.app_id, ID);
    //                     errJson.error.message = "failed to set hook.";
    //                     errJson.error.code = 2250;
    //                     return next(errJson);
    //                 }
    //                 updateIntegrationHook(req.app_id, ID, resultHook.hookUrl).then(function (res) {
    //                     response = {status: true, integration: res};
    //                     setCustomersVerify(type, req).then(function (resCustomers) {
    //                         if (resCustomers.num_changed > 0)
    //                             response.warning = type + " verification status was modified for " + resCustomers.num_changed + " customers.";
    //                         next(response);
    //                     })
    //                 })
    //
    //             })
    //         })
    //
    //     });
    // }
    // }

});

router.put('/:integration_id', function (req, res, next) {
    var integration_id = req.params.integration_id;
    var valid = validateId(integration_id);
    if (!valid.status)
        return next(valid);
    if (!req.body || !Object.keys(req.body).length) {
        next(errJson);
    }
    else if (req.body.length) {
        errJson.error.code = 2040;
        return next(errJson);
    } else {
        var data = req.body;
        _integrationsService.UpdateIntegration(req.app_id, integration_id, data).then(function (result) {
            next({status: true, integration: result.integration, warning: result.warning});
        }, function (errResult) {
            next({status: false, error: errResult.error});
        });
    }

    // validateId(integration_id, next).then(function (res) {
    //     var integrationsArray = ["messenger", "line", "viber", "telegram", "line", "wechat", "kik"];
    //     if (!req.body || !(Object.keys(req.body).length) || !req.body.type) {
    //         errJson.error.code = req.body.length ? 2040 : 2030;
    //         errJson.error.message = "Invalid data.";
    //         next(errJson);
    //     }
    //     else {
    //         var type = req.body.type;
    //         req.body.type = type = type.toLowerCase();
    //         if (integrationsArray.indexOf(type) == -1) {
    //             errJson.error.message = "Invalid integration type.";
    //             errJson.error.code = 2050;
    //             return next(errJson);
    //         }
    //         else {
    //             dbObj.find(req.app_id, "integrations", integration_id)
    //                 .then(function (result) {
    //                     if (!result.length) {
    //                         errJson.error.message = "Item does not exist.";
    //                         errJson.error.code = 2020;
    //                         return next(errJson);
    //                     }
    //                     if (result[0].type != type) {
    //                         errJson.error.message = "unable to change integration type.";
    //                         errJson.error.code = 2080;
    //                         return next(errJson);
    //                     }
    //
    //                     validateAllIntegrations(type, req, next, "update", integration_id)
    //                         .then(function (result) {
    //                             insertOrUpdateIntegration(req.app_id, "UPDATE", result.object, integration_id).then(function (resultDB) {
    //                                 var ID = resultDB.integration._id;
    //                                 var integration = resultDB.integration;
    //                                 setHook(req, ID, type).then(function (resultHook) {
    //                                     var response;
    //                                     if (!resultHook.status) {
    //                                         removeIntegration(req.app_id, ID);
    //                                         errJson.error.message = "failed to set hook.";
    //                                         errJson.error.code = 2250;
    //                                         return next(errJson);
    //                                     }
    //                                     updateIntegrationHook(req.app_id, ID, resultHook.hookUrl).then(function (res) {
    //                                         response = {status: true, integration: res};
    //                                         setCustomersVerify(type, req).then(function (resCustomers) {
    //                                             if (resCustomers.num_changed > 0)
    //                                                 response.warning = type + " verification status was modified for " + resCustomers.num_changed + " customers.";
    //                                             next(response);
    //                                         })
    //                                     })
    //
    //                                 })
    //                             })
    //                         });
    //                 })
    //         }
    //     }
    // })

});

router.delete('/:integration_id', function (req, res, next) {
    var integration_id = req.params.integration_id;
    var valid = validateId(integration_id);
    if (!valid.status)
        return next(valid);
    _integrationsService.DeleteIntegration(req.app_id, integration_id).then(function (result) {
        next(result);
    }, function (errResult) {
        next({status: false, error: errResult.error});
    });
});

var validateId = function (id) {
    if (!id)
        return ({status: true});
    if (!helperObj.validObjectId(id))
        return ({
            'status': false,
            'error': {
                'message': 'Integration does not exist',
                'type': 'Integrations',
                'code': 2291
            }

        });
    else
        return ({status: true});
};

module.exports = router;
