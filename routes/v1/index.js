var express = require('express');
var router = express.Router();

var messageApiIm = require('messageapi-im')('eyJhcHBfaWQiOiI1OWY4NmI1ZTQzNjYyYjM3YWM1ODg3ODgiLCJhYyI6MTUwOTQ1MjYzOCwidWMiOjE1MDM5MTU5MTUsIm1zZ29ubHkiOnRydWUsInNpZ24iOiI3YWJiZDhiYzZlYjIyYTQxYjg2MWUxNWY2YWZhNGUyNGMyMDI5OTM4NjI2MmE3MzZlNjlmOWExOTNmZmMyMDE0In0=');
router.get('/', function (req, res) {
    res.send({status: 'hello!'});
})

router.post('/sefariahook', function (req, res, next) {
    var data = req.body;
    console.log('');
    console.log(data);
    console.log('');

    if (data.event == 'NEW_MESSAGE') {
        var msg = data.data;
        var customer_id = msg.customer_id;
        var integration_id = msg.integration_id;
        sefaria_service.setIntegrationName(msg.integration_type);
        if (msg.data.type == 'text') {
            var search = msg.data.content;

            var baseTemplate = {
                "customer_id": customer_id,//"59f87acb29d975d5d375d185",
                "integration_id": integration_id,//"59f86ba929d975d5d375d16d",
                "data": {
                    type: 'template',
                    template: {}
                }
            }
            if (search.toLowerCase().trim() == 'sefaria') {
                var templateT = {
                    "customer_id": customer_id,
                    "integration_id": integration_id,
                    "data": {
                        type: 'text',
                        content: 'ברוך הבא ל ספריא. נא שלח טקסט לחיפוש ספר'
                    }
                }
                sendMessage(templateT);
                res.send({status: true});
                return;
            }
            else if (search.length < 3) {
                var templateT = {
                    "customer_id": customer_id,
                    "integration_id": integration_id,
                    "data": {
                        type: 'text',
                        content: 'לחיפוש אנא שלח טקסט בן 3 אותיות לפחות'
                    }
                }
                sendMessage(templateT);
                res.send({status: true})
                return;

            }
            let clientSearch = _.filter(SEARCH_CLIENTS_ARR, {customer_id: baseTemplate.customer_id})[0];

            sefaria_service.Search(search, clientSearch).then(function (result) {
                //console.log(SEARCH_CLIENTS_ARR);
                var clientSearchA = _.filter(SEARCH_CLIENTS_ARR, {customer_id: baseTemplate.customer_id})[0];

                if (clientSearchA || clientSearch) {
                    //var ind = SEARCH_CLIENTS_ARR.indexOf(clientSearch);//
                    _.remove(SEARCH_CLIENTS_ARR, {customer_id: baseTemplate.customer_id});
                    SEARCH_CLIENTS_ARR = [];//TEMP
                    //SEARCH_CLIENTS_ARR.splice(ind, 1);
                }
                if (result.categoriesForSearch) {
                    var client = _.filter(SEARCH_CLIENTS_ARR, {customer_id: baseTemplate.customer_id})[0];
                    if (client)
                        client.categoriesForSearch = result.categoriesForSearch;
                    else {
                        SEARCH_CLIENTS_ARR.push({
                            customer_id: baseTemplate.customer_id,
                            categoriesForSearch: result.categoriesForSearch
                        })
                    }
                }
                if (Array.isArray(result.data)) {
                    for (var te of result.data) {
                        var templateMSG = {
                            customer_id: baseTemplate.customer_id,
                            integration_id: baseTemplate.integration_id,
                            data: te
                        }
                        sendMessage(templateMSG);
                    }
                } else {
                    var templateMSG = {
                        customer_id: baseTemplate.customer_id,
                        integration_id: baseTemplate.integration_id,
                        data: result.data
                    }
                    sendMessage(templateMSG);
                }


                console.log(result);
                res.send(result);
            });


        }
        else {
            res.send({status: false})
        }
    }
    else {
        res.send({status: false})
    }

});
module.exports = router;



var sendMessage = function (template) {
    console.log('********')
    console.log(template)
    console.log('********')
    messageApiIm.messages.Send(template).then(function (result) {
        var message = result.message;
        console.log(result);
    });
}

