var createError = require('http-errors');
var express = require('express');
var https = require('https');
var fs = require('fs');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var config = require('./config.js');
var api = require('./api.js')

var key = fs.readFileSync('./../certs/cert.key');
var cert = fs.readFileSync('./../certs/cert.pem');
var options = {
  key: key,
  cert: cert,
  requestCert: false,
  rejectUnauthorized: false
};

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

var authRouter = require('./routes/auth');
var cardsRouter = require('./routes/cards');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, "node_modules/bootstrap/dist/")))
app.use(express.static(path.join(__dirname, "node_modules/jquery/dist/")))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(config.cookie_secret, {
  httpOnly: true,
  secure: true
}));
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

app.use('/auth', authRouter);
app.use('/cards', cardsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

var port = 8001

var server = https.createServer(options, app);

server.on('uncaughtException', function(err) {
  console.log(err);
});

server.listen(port, () => {
  api.getManifest();
  console.log(`Listening on port ${port}`);
});

module.exports = app;