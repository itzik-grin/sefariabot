var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/sendmessage', function (req, res, next) {
    //unknow -> Send button 'Start search [value=start sefaria]'.
    //'start sefaria' -> Send buttons [read, search]

    //'read': -> buttons/list [Tora, mishna, talmod (value=read+tora for example)
    //'read-tora -> buttons 5 humashim
    // read-tora-shmos ->


    //'search':
    //any text->

});
var messageApiIm = require('messageapi-im')('eyJhcHBfaWQiOiI1OWY4NmI1ZTQzNjYyYjM3YWM1ODg3ODgiLCJhYyI6MTUwOTQ1MjYzOCwidWMiOjE1MDM5MTU5MTUsInNpZ24iOiJkMWNmMmIyMmY2MjM5NDkzZmVjNDZiOTcwNDg1MjA1N2Q4ZWY1YjU2MTgzMWY0MzNhY2JiY2I0ZDI2ODVjMmZlIn0=');
router.get('/', function (req, res) {
    res.send({status: 'hello!'});
})
router.post('/sefraiahook', function (req, res, next) {
    var data = req.body;
    console.log('');
    console.log(data);
    console.log('');
    if (data.event == 'NEW_MESSAGE') {
        var msg = data.data;
        var customer_id = msg.customer_id;
        var integration_id = msg.integration_id;
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
            if(search=='sefaria'){
                var templateT={
                    "customer_id": customer_id,//"59f87acb29d975d5d375d185",
                    "integration_id": integration_id,//"59f86ba929d975d5d375d16d",
                    "data": {
                        type: 'text',
                        content: 'ברוך הבא ל ספריא. נא שלח טקסט לחיפוש ספר'
                    }
                }
                sendMessage(templateT);
                res.send({status: true})
                return;
            }
            else if(search.length<3){
                var templateT={
                    "customer_id": customer_id,//"59f87acb29d975d5d375d185",
                    "integration_id": integration_id,//"59f86ba929d975d5d375d16d",
                    "data": {
                        type: 'text',
                        content: 'לחיפוש אנא שלח טקסט בן 3 אותיות לפחות'
                    }
                }
                sendMessage(templateT);
                res.send({status: true})
                return;

            }
            sefaria_service.Search(search).then(function (result) {
                var booksMes = cutMessages(result.books);
                var personsMsg = cutMessages(result.persons);
                var othersMsg = cutMessages(result.others);


                booksMes.forEach(function (element) {
                    var templateBooks = {
                        customer_id: baseTemplate.customer_id,
                        integration_id: baseTemplate.integration_id,
                        data: {
                            type: baseTemplate.data.type,
                            template: {
                                type: 'generic',
                                title: 'ספרי מקורות',
                                buttons: []
                            }
                        }

                    }
                    element.forEach(function (element) {
                        templateBooks.data.template.buttons.push({
                            action: 'open_uri',
                            label: element.title,
                            url: 'https://www.sefaria.org.il/' + element.ref
                        });
                    });
                    sendMessage(templateBooks);
                });
                personsMsg.forEach(function (element) {

                    var templatePersons = {
                        customer_id: baseTemplate.customer_id,
                        integration_id: baseTemplate.integration_id,
                        data: {
                            type: baseTemplate.data.type,
                            template: {
                                type: 'generic',
                                title: 'מחברים',
                                buttons: []
                            }
                        }

                    }
                    element.forEach(function (element) {
                        templatePersons.data.template.buttons.push({
                            action: 'open_uri',
                            label: element.title,
                            url: 'https://www.sefaria.org.il/' + element.ref
                        })
                    });
                    sendMessage(templatePersons);
                });
                othersMsg.forEach(function (element) {
                    var templateOthers = {
                        customer_id: baseTemplate.customer_id,
                        integration_id: baseTemplate.integration_id,
                        data: {
                            type: baseTemplate.data.type,
                            template: {
                                type: 'generic',
                                title: 'ספרים שונים',
                                buttons: []
                            }
                        }

                    }
                    element.forEach(function (element) {
                        templateOthers.data.template.buttons.push({
                            action: 'open_uri',
                            label: element.title,
                            url: 'https://www.sefaria.org.il/' + element.ref
                        })
                    });
                    sendMessage(templateOthers);
                });


                console.log(result);
                res.send(result);

            });
        }

    }
    else {
        res.send({status: false})
    }

});
module.exports = router;


var cutMessages = function (items) {
    var groups = [];
    if (items.length <= 3)
        groups.push(items);
    else {
        var tempItems = new Array(items.length);
        for (var i = 0; i < items.length; i++) {
            tempItems[i] = items[i];
        }
        do {
            var x = [];
            x.push(tempItems[0]);
            if (tempItems[1])
                x.push(tempItems[1])
            if (tempItems[2])
                x.push(tempItems[2])
            groups.push(x);
            tempItems.splice(0, x.length);
        } while (tempItems.length > 0)
    }
    return groups;
}

var sendMessage = function (template) {
    messageApiIm.messages.Send(template).then(function (result) {
        var message = result.message;
        console.log(result);
    });
}

