const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

// Fetch the service account key JSON file contents
const serviceAccount = require("./QikDispatch-Dev-549fe5876000.json");

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://qikdispatch-dev.firebaseio.com/"
});

const index = require('./routes/index');
const users = require('./routes/users');
const importRoute = require('./routes/import');
const register = require('./routes/register');
const twilio = require('./routes/twilio');
const twitter = require('./routes/twitter');
const analytics = require('./routes/analytics');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/import', importRoute);
app.use('/register', register);
app.use('/twilio', twilio);
app.use('/twitter', twitter);
app.use('/analytics', analytics);


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

module.exports = app;
