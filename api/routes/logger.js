var express = require('express');
const winston = require('winston')


var transport = new winston.transports.DailyRotateFile({
    filename: 'logs/clients/clients-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    maxSize: '20m',
    maxFiles: '14d'
})

const logger = winston.createLogger({
    level: 'debug',
    transports: [transport],
    format: winston.format.combine(winston.format.timestamp(), winston.format.json(), winston.format.splat())
})

var router = express.Router();

router.post('/', (req, res, next) => {
    if ('logs' in req.body) {
        for (var log of req.body.logs) {
            logger.log(log.level, log.message)
        }
    }    
})

module.exports = router