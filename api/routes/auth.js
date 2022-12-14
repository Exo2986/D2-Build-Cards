var express = require('express');
var axios = require('axios').default;
var config = require('./../config.js');
const Sentry = require('@sentry/node')

var router = express.Router();

router.get('/', function(req, res, next) {
    res.json({
        url: config.d2_auth_base_url + `?client_id=${config.d2_client_id}&response_type=code`
    })
});

router.get('/is-authenticated', function(req, res, next) {
    const authenticated = req.signedCookies['access_token'] != null || req.signedCookies['refresh_token'] != null

    res.json({authenticated})
})

router.get('/callback', async function(req, res, next) {
    var code = req.query.code;

    await axios({
        method: 'post',
        url: config.d2_token_base_url,
        data: `grant_type=authorization_code&code=${code}`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${config.d2_client_id}:${config.d2_client_secret}`).toString('base64')}`
        }
    })
    .then(function(response) {
        res.cookie('access_token', response.data.access_token, {
            maxAge: response.data.expires_in * 1000,
            signed: true
        });

        res.cookie('refresh_token', response.data.refresh_token, {
            maxAge: response.data.refresh_expires_in * 1000,
            signed: true
        });

        res.json({
            success: true,
        })
    })
    .catch(function(error) {
        res.status(500)
        Sentry.captureException(error)
    });
});

module.exports = router;