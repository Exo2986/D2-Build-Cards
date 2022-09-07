var express = require('express');
var axios = require('axios').default;
var config = require('./../config.js');
var manifest = require('./../manifest.js')
var objects = require('./../objects.js')
var api = require('./../api.js')
const Sentry = require('@sentry/node')

const instance = axios.create({
    baseURL: config.d2_api_base_url,
    headers: {
        'X-Api-Key': config.d2_api_key
    }
})

var router = express.Router();

//make sure that manifest is present
router.use(function (req, res, next) {
    console.log('Manifest connection verification middleware called for %s', res.ip)
    if (manifest.connected()) {
        next()
    } else {
        const error = 'Denied request, manifest.db is not connected.'
        Sentry.captureException(error)
        throw new Error(error)
    }
})

//make sure that token cookies are present
router.use(async function (req, res, next) {
    console.log('Token cookie verification middleware called for %s', res.ip)
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
                Sentry.captureException(error)
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
    console.log('Membership cookie verification middleware called for %s', res.ip)
    if (!req.cookies['membership_type'] || !req.cookies['membership_id']) {
        var membershipInfo = await api.getUserMembershipInfo(req.signedCookies['access_token']);

        if (membershipInfo != null) {
            res.cookie('membership_type', membershipInfo.membershipType)
            res.cookie('membership_id', membershipInfo.membershipId)
        } else {
            const error = 'Unable to retrieve membership info from Bungie.net'
            Sentry.captureException(error)
            throw new Error(error)
        }

        res.json({
            refresh: true
        })
    } else {
        next()
    }
})

router.get('/characters', async function(req, res, next) {
    var membershipType = req.cookies['membership_type']
    var membershipId = req.cookies['membership_id']
    var accessToken = req.signedCookies['access_token']
    
    const profiler = `Retrieve characters list for user ${membershipId} (${res.ip})`

    instance.get(`/Destiny2/${membershipType}/Profile/${membershipId}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
        params: {
            'components': '200'
        }
    })
    .then((response) => {
        var promises = []
        var characters = []

        for (var character in response.data.Response.characters.data) {
            var characterData = response.data.Response.characters.data[character]
            var characterPromise = objects.character(characterData, null, null, true)
            .then((c) => characters.push(c))
            .catch((error) => {
                Sentry.captureException(error)
                next(error)
            })

            promises.push(characterPromise)
        }

        Promise.all(promises)
        .then(() => {
            var charactersSorted = []
            var classes = ['Hunter', 'Warlock', 'Titan']

            for (var className of classes) {
                for (var character of characters) {
                    if (character.class == className) {
                        charactersSorted.push(character)
                    }
                }
            }
            
            res.json(charactersSorted)
        })
        .catch((error) => {
            Sentry.captureException(error)
            next(error)
        })
    })
    .catch((error) => {
        Sentry.captureException(error)
        next(error)
    })
})

router.get('/', async function(req, res, next){
    var membershipType = req.cookies['membership_type']
    var membershipId = req.cookies['membership_id']
    var accessToken = req.signedCookies['access_token']

    const profiler = `Retrieve profile info for user ${membershipId} (${res.ip})`

    instance.get(`/Destiny2/${membershipType}/Profile/${membershipId}/Character/${req.query.character}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
        params: {
            'components': '200,205,305,304,302'
        }
    })
    .then(function(response) {
        response = response.data.Response

        var characterData = response.character.data
        var characterEquipment = response.equipment.data
        var itemComponents = response.itemComponents

        objects.character(characterData, characterEquipment, itemComponents)
        .then((character) => {
            res.json({character})
        })
        .catch(err => {
            Sentry.captureException(err)
            next(err)
        })
    })
    .catch(function(error) {
        Sentry.captureEvent(error)
        next(error)
    });
});

module.exports = router;