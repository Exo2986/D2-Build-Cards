var express = require('express');
var axios = require('axios').default;
var config = require('./../config.js');

var router = express.Router();

router.get('/', function(req, res, next){
    res.render('auth', {title: 'Authentication Portal'})
});

router.post('/', function(req, res, next) {
    res.redirect(config.d2_auth_base_url + `?client_id=${config.d2_client_id}&response_type=code`)
});

router.get('/callback', async function(req, res, next) {
    var code = req.query.code;

    await axios({
        method: 'post',
        url: config.d2_token_base_url,
        data: `grant_type=authorization_code&code=${code}`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${config.d2_client_id}:${config.d2_client_secret}`).toString('base64')}`
        },
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

        console.log('hello')
    })
    .catch(function(error) {
        console.log(error)
    });

    res.redirect('/cards')
});

module.exports = router;