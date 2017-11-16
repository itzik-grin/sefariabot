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
                SearchName(query).then(function (resultAll) {
                    var dada = resultAll.completions;
                    if (!dada.length)
                        resolve(false);
                    else {

                        var promisses = [];
                        dada.forEach(function (element) {
                            promisses.push(SearchName(element))
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
    this.SearchNew = function (query) {
        if (!query)
            throw Error('Missing query');
        if (typeof query === "object")
            throw Error('invalid query');
        else {
            var ResQuery = query.split(':');
            if (ResQuery && ResQuery.length && ResQuery[0] == 'q') {
                return querySearch(ResQuery);
            }
            else {
                return newSearch(query)
            }

        }

    }
    var querySearch = function (queryArr) {
        return new Promise(function (resolve, reject) {
            switch (queryArr[1]) {
                case "about":
                    aboutResult(`${queryArr[2]}`, {}).then(function (template) {
                        resolve({status: true, data: template});
                    });
                    break;
                case "search":
                    return textTemplate(`${queryArr[1]} ${queryArr[2]}`, {});
                    break;
                default:
                    return textTemplate(`${queryArr[1]} ${queryArr[2]}`, {});
                    break;
            }
        })
    }
    var newSearch = function (query) {
        return new Promise(function (resolve, reject) {
            SearchName(query).then(function (resultAll) {
                var data = resultAll;
                if (data.is_book) {
                    var template = bookTemplate(query, data);
                    resolve({status: true, data: template});
                }
                else if (data.type == 'ref' && data.is_ref) {
                    //is_segment->specific ref. for exampple url: "Genesis.25.19-28.9"
                    var template = refTemplate(query, data);
                    resolve({status: true, data: template});
                }
                else if (data.type == 'Person') {
                    //is_segment->specific ref. for exampple url: "Genesis.25.19-28.9"
                    var template = personTemplate(query, data);
                    resolve({status: true, data: template});
                }
                else {
                    var template = anotherSearchTemplate(query, data);
                    resolve({status: true, data: template});
                }
            }, function (err) {
                reject({status: false, err: err})
            });
        });
    }

    var bookTemplate = function (query, data) {
        var template = {
            type: 'template',
            template: {
                type: 'generic',
                title: query,
                text: query,
                buttons: [
                    {
                        action: 'reply',
                        label: 'אודות',
                        reply_data: `q:about:${query}`
                        //url: `https://www.sefaria.org/api/v2/index/${query}`
                    },
                    {
                        action: 'open_uri',
                        label: ` פתח ${query}`,
                        url: `https://www.sefaria.org/${data.ref}`
                        //url: `https://www.sefaria.org/api/v2/index/${data.ref}`
                    },
                    {
                        action: 'reply',
                        label: `חפש ב${query}`,
                        reply_data: `q:search:${query}`
                        //url: `https://www.sefaria.org/api/v2/index/${dada.ref}`
                    }
                ]
            }
        }
        return template;
    }

    var refTemplate = function (query, data) {
        var template = {
            type: 'template',
            template: {
                type: 'generic',
                title: query,
                text: data.book,
                buttons: [
                    {
                        action: 'open_uri',
                        label: ` פתח ${query}`,
                        url: `https://www.sefaria.org/${data.ref}`
                        //url: `https://www.sefaria.org/api/v2/index/${data.ref}`
                    },
                    {
                        action: 'reply',
                        label: `חפש ב- ${query}`,
                        reply_data: `q:search:${query}`
                        //url: `https://www.sefaria.org/api/v2/index/${dada.ref}`
                    }
                ]
            }
        }
        return template;
    }
    var personTemplate = function (query, data) {
        var template = {
            type: 'template',
            template: {
                type: 'generic',
                title: query,
                text: data.book,
                buttons: [
                    {
                        action: 'open_uri',
                        label: ` אודות ${query}`,
                        url: (data.ref ? `https://www.sefaria.org/${data.ref}` : `https://www.sefaria.org/person/${data.key}`)

                        //url: `https://www.sefaria.org/api/v2/index/${data.ref}`
                    }
                ]
            }
        }
        return template;
    }
    var anotherSearchTemplate = function (query, data) {
        var template = {
            type: 'template',
            template: {
                type: 'generic',
                title: `לא נמצא`,
                text: `אולי אתה מתכוון אל:`,
                buttons: []
            }
        }
        var btns = [];
        var maxIndex = 3;
        for (let str in data.completions) {
            if (data.completions[str] == query)
                maxIndex++;
            else {
                var btn = {
                    action: 'reply',
                    label: `${data.completions[str]}`,
                    reply_data: `${data.completions[str]}`
                }
                if (str < maxIndex)
                    btns.push(btn);
            }
        }
        template.template.buttons = btns;
        return template;
    }
    var textTemplate = function (query, data) {
        var template = {
            type: 'text',
            content: query
        }
        return template;
    }

    var aboutResult = function (query) {
        return new Promise(function (resolve, reject) {
            SearchIndex(query).then(function (result) {
                var value = result.heDesc || result.enDesc;
                if (!value)
                    value = (result.authors && result.authors[0] ? `מחבר: ${result.authors[0].he || result.authors[0].en}` : 'אין מידע');
                var template = textTemplate(value);
                resolve(template);
            })
        })
    }
    this.books.Get = function (query) {
        if (!query)
            throw Error('Missing query');
        if (typeof query === "object")
            throw Error('invalid query');
        else
            return SearchName(query);
    };


    var SearchName = function (query, options) {
        //https://www.sefaria.org.il/api/name/%D7%A9%D7%9C%D7%95%D7%9D
        return exec('name', 'GET', query, options);
    };
    var SearchIndex = function (query, options) {
        //https://www.sefaria.org/api/v2/index/%D7%A9%D7%9C%D7%95%D7%9D
        return exec('v2/index', 'GET', query, options);
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
