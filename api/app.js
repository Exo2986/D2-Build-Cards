var createError = require('http-errors');
var express = require('express');
var https = require('https');
var fs = require('fs');
var path = require('path');
var cookieParser = require('cookie-parser');
var cors = require('cors')
var config = require('./config.js');
var api = require('./api.js')
const Sentry = require("@sentry/node");
const SentryTracing = require("@sentry/tracing");
const package = require('./package.json')

var env = process.env.NODE_ENV || 'development';

if (env == 'production') {
  var key = fs.readFileSync('./../certs/privkey.pem');
  var cert = fs.readFileSync('./../certs/fullchain.pem');
  var options = {
    key: key,
    cert: cert
  };
} else {
  var key = fs.readFileSync('./../certs/cert.key');
  var cert = fs.readFileSync('./../certs/cert.pem');
  var options = {
    key: key,
    cert: cert,
    requestCert: false,
    rejectUnauthorized: false
  };
}

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
const manifest = require('./manifest.js');

var app = express();

app.use(cors())

Sentry.init({
  dsn: "https://d62b76f709b441db985aa991c3a3ff3b@o1384900.ingest.sentry.io/6703838",

  tracesSampleRate: 1.0,
  release: `${package.name}@(${package.version})`
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, "node_modules/bootstrap/dist/")))
app.use(express.static(path.join(__dirname, "node_modules/jquery/dist/")))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(config.cookie_secret, {
  httpOnly: true,
  secure: true,

}));
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);


var authRouter = require('./routes/auth');
var cardsRouter = require('./routes/cards');

app.use('/api/auth', authRouter)
app.use('/api/cards', cardsRouter)

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//serve react files
var reactBuildDir = path.join(__dirname, '..', '/client/build')

app.use(express.static(reactBuildDir))

app.get('*', (req, res) => {
  res.sendFile(path.join(reactBuildDir, 'index.html'))
})

if (env == 'production') {
  var port = 443
} else {
  var port = 8001
}

var server = https.createServer(options, app);

server.on('uncaughtException', function(err) {
  console.log(err);
});

const getManifest = () => {
  api.getManifest()
  .then(() => {
    manifest.openDatabaseConnection()
  })
  .catch(() => {
    //start a panic interval, check for manifest updates much more frequently
    console.log('Starting panic interval, checking for manifest updates every 15 minutes.')
    setTimeout(getManifest, 1000 * 60 * 60 * 15)
  })
}

server.listen(port, () => {
  getManifest()
  setInterval(getManifest, 1000 * 60 * 60 * 24) //run every 24 hours

  console.log(`Listening on port ${port}`);
});

// Redirect from http port 80 to https
var http = require('http');
http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(80);

module.exports = app;
