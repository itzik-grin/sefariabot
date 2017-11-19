var express = require('express'), http = require('http');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


// var request = require("request");

var index = require('./routes/v1/index');

var fs = require('fs');


global.request = require("request");

global.sefaria_service = require('./bin/sefaria_service')();
global._ = require('lodash');

global.SEARCH_CLIENTS_ARR = [];

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(verification);
app.use('/', index);
// app.use('/users', users);

// app.use(logs);
// app.use('/v1/logs', logsSystem);

/*
 app.use(function (result,req,res,next) {//itzik22

 })*/
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
// app.use(bodyParser.json({verify: verification.check}));
app.set('port', process.env.PORT || 4500);
//console.log('messageIm');

/*
 // error handler
 app.use(function (err, req, res, next) {
 // set locals, only providing error in development
 res.locals.message = err.message;
 res.locals.error = req.app.get('env') === 'development' ? err : {};

 // render the error page
 res.status(err.status || 500);
 // res.render('error');
 res.send({
 "error": {
 "message": "Unsupported request. Please read the documentation at https://developers.messageapi.io/docs",
 "type": "MethodException",
 "code": 404
 }
 })
 });
 */

/*server.listen(app.get('port'), function () {
 console.log("Express server listening on port " + app.get('port'));
 var os = require('os');
 var xx = os.hostname();
 console.log("HOST NAME:");
 console.log(xx);
 console.log('***********');
 });*/

var httpServer = http.createServer(app);
httpServer.listen(app.get('port'));

module.exports = app;
