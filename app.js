var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var expressWinston = require('express-winston');
var winston = require('winston');
var events = require('events');
var fifo = require('./lib/fifo/job-fifo');
var passportSocketIo = require('passport.socketio');
const MongoStore = require('connect-mongo')(session);
var store = new MongoStore({mongooseConnection: mongoose.connection});

//create a global event emitter
var eventEmitter = new events.EventEmitter();

//configure winston logger
var logger = require('./config/winston');

//configure internationalization support
var i18n = require('./i18n');

//start mongoDB
var db = require('./config/db');

//start zetta server
var zetta = require ('./config/zetta')

//require Passport configuration
require('./config/passport');

// Init App
var app = express();

// initialize logger
/*app.use(expressWinston.logger({
	transports : [
		new winston.transports.Console({
			json: true,
                        colorize: true
		})
	]
	})
);*/
var server = require('http').Server(app);


module.exports = {};
module.exports.fifo = fifo;

//start web sockets
var io = require('./lib/websockets/websocket').ws(server, eventEmitter);

io.use(passportSocketIo.authorize({
  cookieParser: cookieParser,                           // the same middleware you registrer in express
  key:          'connect.sid',                          // the name of the cookie where express/connect stores its session_id
  secret:       process.env.SESSIONKEY || "wololo",     // the session_secret to parse the cookie
  store:        store,                                // we NEED to use a sessionstore. no memorystore please
  //success:      onAuthorizeSuccess,  // *optional* callback on success - read more below
  //fail:         onAuthorizeFail,     // *optional* callback on fail/error - read more below
}));

module.exports.io = io;
fifo.init();

//require routes
var routes = require('./routes/index');
var apiRoutes = require('./api/routes/index');

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(function(req, res, next){
   res.eventEmitter = eventEmitter;
   res.io = io;
   next();
});


// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
    secret: process.env.SESSIONKEY || "wololo",
    saveUninitialized: true,
    resave: true,
    store: store
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  },
  customValidators: {
    isInArray: function(param, array){
        return (array.indexOf(param) !== -1);
      }
  }
}));

// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});
app.use(i18n);

app.use('/', routes);
app.use('/api', apiRoutes);

// initialize  error logger after the routes
/*app.use(expressWinston.errorLogger({
	transports : [
		new winston.transports.Console({
			json: true,
                        colorize: true
		})
	]
}));*/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports.app = app;
module.exports.server = server;
module.exports.eventEmitter = eventEmitter;
