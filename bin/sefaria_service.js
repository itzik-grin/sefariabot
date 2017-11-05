"use strict";
var SefariaService = function () {

    var request = require("request");
    var Q = require('q');
    var domain = 'https://dev.sefaria.org/api';
    var ver = '';
    this.books = {};
    this.Search = function (query) {
        var promise = new Promise(function (resolve, reject) {
            if (!query)
                throw Error('Missing query');
            if (typeof query === "object")
                throw Error('invalid query');
            else
                GetBooks(query).then(function (resultAll) {
                    var dada = resultAll.completions;
                    if (!dada.length)
                        resolve([]);
                    else {

                        var promisses = [];
                        dada.forEach(function (element) {
                            promisses.push(GetBooks(element))
                        });
                        Promise.all(promisses).then(function (result) {
                                var books = [], Persons = [], others = [], unknow = [];
                                for (var i = 0; i < result.length; i++) {
                                    var item = result[i];
                                    if (item.type == 'ref') {
                                        if (item.is_book)
                                            books.push({
                                                title: (item.completions && item.completions.length ? item.completions[0] : item.book),
                                                ref: item.ref
                                            });
                                        else
                                            others.push({
                                                title: (item.completions && item.completions.length ? item.completions[0] : item.book),
                                                ref: item.ref
                                            });
                                    }
                                    else if (item.type == 'Person') {
                                        Persons.push({
                                            title: (item.completions && item.completions.length ? item.completions[0] : item.key),
                                            ref: 'person/' + item.key
                                        });
                                    }
                                    else {
                                        unknow.push(item);
                                    }
                                }

                                resolve({books: books, persons: Persons, others: others})

                            }
                            , function (err) {
                                reject(err);
                            });
                    }

                }, function (err) {
                    reject(err);
                })
        });
        return promise;
    };
    var GetBooks = function (query, options) {
        //https://www.sefaria.org.il/api/name/%D7%A9%D7%9C%D7%95%D7%9D
        return exec('name', 'GET', query, options);
    };

    this.books.Get = function (query) {
        if (!query)
            throw Error('Missing query');
        if (typeof query === "object")
            throw Error('invalid query');
        else
            return GetBooks(query);
    };
    var exec = function (collection, method, query, data) {
        var deferred = Q.defer();
        var options = {
            method: method,
            url: domain + '/' + collection + '/' + encodeURI(query),
            headers: {
                //     'authorization': APP_SECRET,
                'content-type': 'application/json'
            },
            json: data || true,
            qs: (method == 'GET' ? data : {})
        };
        // if (ID)
        //     options.url += '/' + ID;
        console.log(options)
        request(options, function (error, response, body) {
            if (error) {
                deferred.reject(error);
                return;
            }
            if (response.statusCode != 200)
                deferred.reject(body);

            else {
                try {
                    deferred.resolve(body);
                } catch (e) {
                    deferred.reject("ERROR");
                }
            }
            // callback(error, response, body);
        });

        return deferred.promise;
    }

}

module.exports = function () {
    var _sefariaService = new SefariaService();
    return _sefariaService;
};
