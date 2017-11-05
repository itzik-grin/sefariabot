var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var urlDB = "mongodb://localhost:27017/message_api_";
router.get('/:log_id?', function (req, res, next) {
    var log_id = req.params.log_id;
    dbObj.find(req.app_id, "logs", log_id)
        .then(function (result) {
                var data = {};
                if (result.length) {
                    data = {
                        "status": true,
                        "logs": result,
                    }
                }
            res.send(data);
            },
            function (error) {
                res.send(error);
            });
});
module.exports = router;



