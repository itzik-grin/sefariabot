var Logs = function (result, req, res, next) {
    //console.log("result!!!");
    //console.log(req.app_id);
    //console.log(req.method);
    //console.log(req.originalUrl);
    //console.log(req.body);
    var data = {
        url: req.originalUrl,
        method: req.method,
        data: req.body,
        result: result,
        statusCode: 200,
        date: new Date(),
        relationships: {}
    };

    var customer_id = req.param('customer_id') || req.body.customer_id || (result.customer && result.customer._id && result.customer._id.toString());
    customer_id ? data.relationships.customer_id = customer_id : '';
    var message_id = req.param('message_id') || req.body.message_id || (result.message && result.message._id && result.message._id.toString());
    message_id ? data.relationships.message_id = message_id : '';
    var integration_id = req.param('integration_id') || req.body.integration_id || (result.integration && result.integration._id && result.integration._id.toString());
    integration_id ? data.relationships.integration_id = integration_id : '';
    var webhook_id = req.param('webhook_id') || req.body.webhook_id || (result.webhook && result.webhook._id && result.webhook._id.toString());
    webhook_id ? data.relationships.webhook_id = webhook_id : '';

    dbObj.insertOne(req.app_id, "logs", data).then(function (result) {

    }, function (err) {

    });
    res.send(result);
}

module.exports = Logs;
