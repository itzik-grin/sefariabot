/**
 * Created by user on 06/07/2017.
 */
var Promise = require('promise');
var dblayer = function () {
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/message_api_";
    var mongoose = require('mongoose');
    this.findById = function (appID, collectionName, id) {
        return this.find(appID, collectionName, id);
    }
    this.findByQuery = function (appID, collectionName, query, limit_res, skip_res) {
        return this.find(appID, collectionName, undefined, query, limit_res, skip_res);
    }
    this.getAllCollection = function (appID, collectionName, limit_res, skip_res) {
        return this.find(appID, collectionName, undefined, undefined, limit_res, skip_res);
    }

    this.find = function (appID, collectionName, id, query, limit_res, skip_res) {
        //console.log("appid------" + appID)
        var limit = 100000000000000;
        var skip = 0;
        var promise = new Promise(function (resolve, reject) {
            MongoClient.connect(url + appID, function (err, db) {
                if (err) throw err;
                var objectId = new ObjectID(id)
                if (id) {
                    var object = id ? {"_id": objectId} : {};
                    object.deleted = {$ne: true};
                }
                if (query)
                    object = query;
                if (limit_res)
                    limit = limit_res;
                if (skip_res)
                    skip = skip_res;
                db.collection(collectionName).find(object).limit(limit).skip(skip).toArray(function (err, res) {
                    if (err) {
                        reject("err");
                    }
                    else
                        resolve(res);
                    db.close();
                });
            });
        });
        return promise;
    }
    this.insertOne = function (appID, collectionName, data) {
        var promise = new Promise(function (resolve, reject) {
            MongoClient.connect(url + appID, function (err, db) {
                if (err) throw err;
                db.collection(collectionName).insertOne(data, function (err, res) {
                    if (err)
                        reject("err");
                    else
                        resolve(res.ops);
                    db.close();
                });
            });
        });
        return promise;
    }
    this.remove = function (appID, collectionName, id) {
        var promise = new Promise(function (resolve, reject) {
            MongoClient.connect(url + appID, function (err, db) {
                db.collection(collectionName).remove({_id: ObjectID(id)}, function (err, result) {
                    if (err) {
                        reject("err");
                    } else {
                        resolve(result.result);
                    }
                    db.close();
                });
            });
        });
        return promise;
    }
    this.findAndModify = function (appID, collectionName, id, data, query) {
        var promise = new Promise(function (resolve, reject) {
            var filterObj
            if (id)
                filterObj = {_id: ObjectID(id)};
            if (query)
                filterObj = query;
            MongoClient.connect(url + appID, function (err, db) {
                db.collection(collectionName).findAndModify(
                    filterObj,
                    [['_id', 'asc']],
                    {$set: data},
                    {new: true},
                    function (err, result) {
                        if (err) {
                            reject("err");
                        } else {
                            if (result.lastErrorObject.updatedExisting)
                                resolve({exist: true, data: result});
                            else resolve({exist: false});
                        }
                        db.close();
                    })
            });
        });
        return promise;
    }
    this.update = function (appID, collectionName, id, data, query) {
        var promise = new Promise(function (resolve, reject) {
            var filterObj
            if (id)
                filterObj = {_id: ObjectID(id)};
            if (query)
                filterObj = query;
            MongoClient.connect(url + appID, function (err, db) {
                db.collection(collectionName).update(filterObj,
                    {$set: data}, function (err, result) {
                        if (err) {
                            console.log(err);
                            reject("err");
                        } else {
                            //console.log(result);
                            resolve(result.result);
                        }
                        db.close();
                    })
            });
        });
        return promise;
    }
    this.updateMany = function (appID, collectionName, data, query) {
        var promise = new Promise(function (resolve, reject) {
            MongoClient.connect(url + appID, function (err, db) {
                db.collection(collectionName).updateMany(query,
                    {$set: data}, function (err, result) {
                        if (err) {
                            console.log(err);
                            reject(err);
                        } else {
                            resolve(result.result);
                        }
                        db.close();
                    })
            });
        });
        return promise;
    }
}
module.exports = dblayer;
