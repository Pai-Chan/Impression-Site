var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');

var app = express();

var settings = require('./settings');
var session = require('express-session');

var MongoStore = require('connect-mongo')(session);

// var expressLayouts = require('express-ejs-layouts');

var flash = require('connect-flash');


var fileUpload = require('express-fileupload');


// for supervisor to use, so that can restart the app automatically,
// don't need to terminate in the terminal often.
// var debug = require('debug')('my-application');
// app.set('port', process.env.PORT || 3000);

// var server = app.listen(app.get('port'), function() {
//   debug('Express server listening on port ' + server.address().port);
// });


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('view options', {
	layout: true
});

 




// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload());
app.use(cookieParser());


app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
	secret: settings.cookieSecret,
	store: new MongoStore({url: 'mongodb://heroku_chenpei314:heroku_chenpei314@ds145208.mlab.com:45208/heroku_s4ggn8s2'}) 
}));

// app.use(expressLayouts);
app.use(flash());
app.use(function(req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


// var settings = require('./settings');
// var session = require('express-session');
// var MongoStore = require('connect-mongo')(session);

// app.use(session({
// 	secret: settings.cookieSecret,
// 	store: new MongoStore({
// 		url: "mongodb://" + "localhost" + "/" + settings.db,
// 	})
// }));

// var MongoStore = require('connect-mongo');
// var settings = require('./settings');
// app.configure(function(){
// 	app.set('views', __dirname + '/views');
// 	app.set('view engine', 'ejs'); app.use(express.bodyParser());
// 	app.use(express.methodOverride()); app.use(express.cookieParser()); 
// 	app.use(express.session({
// 		secret: settings.cookieSecret, store: new MongoStore({
// 		db: settings.db
//     })
// }));
// app.use(app.router); 
// app.use(express.static(__dirname + '/public'));
// });


module.exports = app;
