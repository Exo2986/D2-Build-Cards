var express = require('express');
var axios = require('axios').default;
var config = require('./../config.js');
var manifest = require('./../manifest.js')
var objects = require('./../objects.js')
var api = require('./../api.js')

const instance = axios.create({
    baseURL: config.d2_api_base_url,
    headers: {
        'X-Api-Key': config.d2_api_key
    }
})

var router = express.Router();

//make sure that manifest is present
router.use(function (req, res, next) {
    if (api.manifest) {
        next()
    }
})

//make sure that token cookies are present
router.use(async function (req, res, next) {
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
            }

            res.json({
                redirect: '/cards/card'
            })
        } else {
            res.json({
                redirect: '/auth'
            })
        }
    } else {
        next()
    }
})

//make sure that membership cookies are present, create them if not
router.use(async function (req, res, next) {
    if (!req.cookies['membership_type']) {
        var membershipInfo = await api.getUserMembershipInfo(req.signedCookies['access_token']);

        if (membershipInfo != null) {
            res.cookie('membership_type', membershipInfo.membershipType)
            res.cookie('membership_id', membershipInfo.membershipId)
        }

        res.json({
            redirect: '/cards/card'
        })
    } else {
        next()
    }
})

router.get('/', async function(req, res, next){
    var membershipType = req.cookies['membership_type']
    var membershipId = req.cookies['membership_id']
    var accessToken = req.signedCookies['access_token']

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
        })
        .catch(err => {
            console.log(err)
            res.json({
                success: false
            })
        })
    })
    .catch(function(error) {
        console.log(error)
        res.json({
            success: false
        })
    });
});

module.exports = router;