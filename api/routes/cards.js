var express = require('express');
var axios = require('axios').default;
var manifest = require('./../manifest.js')
var objects = require('./../objects.js')
var api = require('./../api.js')
const winston = require('winston')
const logger = winston.child({service: 'cards'})

const instance = axios.create({
    baseURL: process.env.d2_api_base_url,
    headers: {
        'X-Api-Key': process.env.d2_api_key
    }
})

var router = express.Router();

//make sure that manifest is present
router.use(function (req, res, next) {
    logger.verbose('Manifest connection verification middleware called for %s', res.ip)
    if (manifest.connected()) {
        next()
    } else {
        const error = 'Denied request, manifest.db is not connected.'
        logger.warn(error)
        throw new Error(error)
    }
})

//make sure that token cookies are present
router.use(async function (req, res, next) {
    logger.verbose('Token cookie verification middleware called for %s', res.ip)
    if (!req.signedCookies['access_token']) {
        if (req.signedCookies['refresh_token']) {
            response = await api.refreshAccessToken(req.signedCookies['refresh_token']);

            if (response != null) {
                res.cookie('access_token', response.access_token.token, {
                    maxAge: response.access_token.expires_in * 1000,
                    signed: true
                });
    
                res.cookie('refresh_token', response.refresh_token.token, {
                    maxAge: response.refresh_token.expires_in * 1000,
                    signed: true
                });
            } else {
                var error = 'Unable to consume refresh token at Bungie.net'
                logger.error({
                    message: error,
                    ip: req.ip
                })
                next(error)
            }

            res.json({
                refresh: true
            })
        } else {
            res.json({
                authenticated: false
            })
        }
    } else {
        next()
    }
})

//make sure that membership cookies are present, create them if not
router.use(async function (req, res, next) {
    logger.verbose('Membership cookie verification middleware called for %s', res.ip)
    if (!req.cookies['membership_type'] || !req.cookies['membership_id']) {
        var membershipInfo = await api.getUserMembershipInfo(req.signedCookies['access_token']);

        if (membershipInfo != null) {
            res.cookie('membership_type', membershipInfo.membershipType)
            res.cookie('membership_id', membershipInfo.membershipId)
        } else {
            const error = 'Unable to retrieve membership info from Bungie.net'
            logger.error({
                message: error,
                ip: req.ip
            })
            throw new Error(error)
        }

        res.json({
            refresh: true
        })
    } else {
        next()
    }
})

router.get('/', async function(req, res, next){
    var membershipType = req.cookies['membership_type']
    var membershipId = req.cookies['membership_id']
    var accessToken = req.signedCookies['access_token']

    const profiler = `Retrieve profile info for user ${membershipId} (${res.ip})`
    logger.profile(profiler)

    instance.get(`/Destiny2/${membershipType}/Profile/${membershipId}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
        params: {
            'components': '200,205,305,304,302'
        }
    })
    .then(function(response) {
        var promises = []
        var characters = []

        for (var character in response.data.Response.characters.data) {
            var characterData = response.data.Response.characters.data[character]
            var characterEquipment = response.data.Response.characterEquipment.data[character]
            var itemComponents = response.data.Response.itemComponents

            promises.push(objects.character(characterData, characterEquipment, itemComponents)
            .then((c) => characters.push(c)))
        }

        Promise.all(promises)
        .then(() => {
            res.json(characters)
            logger.profile(profiler)
        })
        .catch(err => {
            logger.error({
                message: err,
                ip: req.ip
            })
            next(err)
        })
    })
    .catch(function(error) {
        logger.error({
            message: error,
            ip: req.ip
        })
        next(error)
    });
});

module.exports = router;