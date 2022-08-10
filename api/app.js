var createError = require('http-errors');
var express = require('express');
var https = require('https');
var fs = require('fs');
var path = require('path');
var cookieParser = require('cookie-parser');
var cors = require('cors')
var api = require('./api.js')
const winston = require('winston')
const morgan = require('morgan')
require('winston-daily-rotate-file')

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
const manifest = require('./manifest.js');
const { loggers } = require('winston');

var app = express();

app.use(cors())


//logging setup
var transport = new winston.transports.DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD-HH',
  maxSize: '20m',
  maxFiles: '14d'
})

var errTransport = new winston.transports.DailyRotateFile({
  level: 'error',
  filename: 'logs/application-error-%DATE%.log',
  datePattern: 'YYYY-MM-DD-HH',
  maxSize: '20m',
  maxFiles: '14d'
})

var rejectionTransport = new winston.transports.DailyRotateFile({
  level: 'error',
  filename: 'logs/application-rejection-%DATE%.log',
  datePattern: 'YYYY-MM-DD-HH',
  maxSize: '20m',
  maxFiles: '14d'
})

winston.configure({
  level: 'debug',
  transports: [
    transport
  ],
  exceptionHandlers: [
    errTransport
  ],
  rejectionHandlers: [
    rejectionTransport
  ],
  format: winston.format.combine(winston.format.timestamp(), winston.format.json(), winston.format.splat())
})

winston.add(new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  )
}));

const morganMiddleware = morgan(
  function (tokens, req, res) {
    return JSON.stringify({
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number.parseFloat(tokens.status(req, res)),
      content_length: tokens.res(req, res, 'content-length'),
      response_time: Number.parseFloat(tokens['response-time'](req, res)),
    });
  },
  {
    stream: {
      write: (message) => {
        const data = JSON.parse(message);
        winston.http(`incoming-request`, data);
      },
    },
  }
);

app.use(morganMiddleware)

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, "node_modules/bootstrap/dist/")))
app.use(express.static(path.join(__dirname, "node_modules/jquery/dist/")))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.cookie_secret, {
  httpOnly: true,
  secure: true
}));
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

app.use('/api/auth', authRouter);
app.use('/api/cards', cardsRouter);

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

var port = 8001

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
    winston.info('Starting panic interval, checking for manifest updates every 15 minutes.')
    setTimeout(getManifest, 1000 * 60)
  })
}

server.listen(port, () => {
  getManifest()
  setInterval(getManifest, 1000 * 60 * 60 * 24) //run every 24 hours

  winston.info(`Listening on port ${port}`);
});

module.exports = app;
