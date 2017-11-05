var EmailService = function () {
    var postEmail = function (app_id, data) {
        return new Promise(function (resolve, reject) {
            //validate
            //  A. validate params.
            //  B. find integration.
            //  C. find customer.
            // send
            //save
            validateEmailData(app_id, data).then(function (result) {
                _messaging_service.LoadCustomerAndIntegration(app_id, data.customer_id, data.integration_id).then(function (result) {
                    var customerObj = result.customer;
                    var integrationObj = result.integration;
                    validatePartB(integrationObj, customerObj, data).then(function (status) {
                        data.data = res;
                        sendMessgeToCurrentMessanger(app_id, customerObj, integrationObj, data).then(function (result) {
                            //save
                            data.message_status = {
                                //"_message_id_of_messenger": sendingResult.msgId,
                                "trafic": 'OUTBOUND',
                                "sent": true,
                                "received": false,
                                "read": false
                            };
                            if (result.message_id)
                                data.message_status._message_id_of_messenger = result.message_id;
                            saveMsgInDb(app_id, data).then(function (mesageObj) {
                                resolve({
                                    status: true,
                                    message: convertToPublicMessage(mesageObj)
                                });
                            }, function (err) {
                                reject({error: err});
                            })
                        }, reject)
                    }, reject)
                }, reject);
            }, reject);
        });
    }
    var validatePartB = function (integration, customer, message) {
        return new Promise(function (resolve, reject) {
            resolve(true);
        });
    }
    var validateData = function (app_id, msgObj) {
        return new Promise(function (resolve, reject) {
            if (!msgObj.customer_id) {
                reject(errObj("Missing customer_id", 6130))
            }
            else if (!msgObj.integration_id) {
                reject(errObj("Missing integration_id", 6140))
            }
            else if (!msgObj.data) {
                reject(errObj("Missing data", 6150))
            }
            else if (!helperObj.validObjectId(msgObj.customer_id))
                reject(errObj("Customer does not exist", 6160))
            else if (!helperObj.validObjectId(msgObj.integration_id))
                reject(errObj("Integration does not exist", 6170))
            else {
                var check = validateMsgObject(msgObj.data);
                if (!check.status) {
                    reject(check);
                } else {
                    switch (msgObj.data.type) {
                        case "text":
                            resolve(true);
                            break;
                        case "image":
                            validateImageUrl(msgObj.data.content, msgObj.data.type).then(resolve, reject);
                            break;
                        case "video":
                            validateVideoUrl(msgObj.data.content, msgObj.data.type).then(resolve, reject);
                            break;
                        case "audio":
                            validateAudioUrl(msgObj.data.content, msgObj.data.type).then(resolve, reject);
                            break;
                        case "file":
                            validateFileUrl(msgObj.data.content, msgObj.data.type).then(resolve, reject);
                            break;
                        case "template":
                            validateTemplate(msgObj.data.template).then(resolve, reject);
                            break;
                        case  "location":
                            validateLocation(msgObj.data.location).then(resolve, reject);
                            break;
                        default :
                            reject(errObj("Invalid type", 6200));
                            break;
                    }

                }
            }
        });
    }
    var validateEmailData = function (app_id, msgObj) {
        return new Promise(function (resolve, reject) {
            if (!msgObj.customer_id) {
                reject(errObj("Missing customer_id", 6130))
            }
            else if (!msgObj.integration_id) {
                reject(errObj("Missing integration_id", 6140))
            }
            else if (!msgObj.data) {
                reject(errObj("Missing data", 6150))
            }
            else if (!helperObj.validObjectId(msgObj.customer_id))
                reject(errObj("Customer does not exist", 6160))
            else if (!helperObj.validObjectId(msgObj.integration_id))
                reject(errObj("Integration does not exist", 6170))
            //else if(msgObj.attachment)
            else {
                for (property in MESSAGE_FIELDS.Email) {
                    var feild = MESSAGE_FIELDS.Email[property];
                    if (!data[feild]) {
                        reject(errObj("missing " + feild, errCode));
                    }
                    errCode += 10;
                }
                resolve(true);

            }
        });
    }
    var LoadCustomerAndIntegration = function (app_id, customer_id, integration_id) {
        return new Promise(function (resolve, reject) {
            Promise.all([_customersService.FindCustomerById(app_id, customer_id), _integrationsService.GetIntegrationById(app_id, integration_id)]).then(function (result) {
                console.log('promise.all');
                console.log(result);
                var customer;
                var integration;
                if (result[0] && result[0].status)
                    customer = result[0].customer;
                if (result[1] && result[1].status)
                    integration = result[1].integration;
                if (customer && integration)
                    resolve({customer: customer, integration: integration});
                else if (!customer) {
                    reject(errObj("Customer does not exist", 6250))
                }
                else if (!integration) {
                    reject(errObj("Integration does not exist", 6260))
                }
            }, reject);
        });
    }
    var saveMsgInDb = function (app_id, msgObj) {
        var activeData = {
            customer_id: msgObj.customer_id,
            integration_type: msgObj.integration_type,
            "integration_id": msgObj.integration_id,
            "data": {"type": msgObj.data.type},
            message_status: msgObj.message_status
        }
        if (msgObj.data.type == "location")
            activeData.data.location = {
                "latitude": msgObj.data.location.latitude,
                "longitude": msgObj.data.location.longitude,
                "address": msgObj.data.location.address
            }
        else if (msgObj.data.type == "text")
            activeData.data.content = msgObj.data.content;
        if (msgObj.data && msgObj.data.caption)
            activeData.data.caption = msgObj.data.caption
        //if(msgObj.data&&msgObj.data.media_id)
        //    activeData.data.media_id=msgObj.data.media_id;
        console.log(msgObj)
        return new Promise(function (resolve, reject) {

            activeData.created_at = new Timestamp(0, Math.floor(new Date().getTime() / 1000));
            dbObj.insertOne(app_id, COLLECTIONS.MESSAGES, activeData).then(function (result) {
                resolve(result[0]);
            }, function (err) {
                reject({error: err});
            });
        });
    }
    var sendMessgeToCurrentMessanger = function (app_id, customer, integration, message) {
        return _mailgun.SendMessage(integration, customer, message)
    }
    return {
        PostEmail:postEmail
    }
}

module.exports = function () {
    var _emailService = new EmailService();
    return _emailService;
};
