var axios = require('axios').default;
var config = require('./config.js');
var fs = require('fs')

var api = {}

const instance = axios.create({
    baseURL: config.d2_api_base_url,
    headers: {
        'X-Api-Key': config.d2_api_key
    }
})

api.refreshAccessToken = async function (refreshToken) {
    var returnInfo = {};
    await axios({
        method: 'post',
        url: config.d2_token_base_url,
        data: `grant_type=refresh_token&refresh_token=${refreshToken}`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${config.d2_client_id}:${config.d2_client_secret}`).toString('base64')}`
        },
    })
    .then(function(response) {
        returnInfo = {
            access_token: {
                token: response.data.access_token,
                expires_in: response.data.expires_in
            },
            refresh_token: {
                token: response.data.refresh_token,
                expires_in: response.data.refresh_expires_in
            }
        };
    })
    .catch(function(error) {
        console.log(error)
    });

    return returnInfo;
}

api.getUserMembershipInfo = async function (accessToken) {
    var membershipInfo = null;

    await instance.get('/User/GetMembershipsForCurrentUser/', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(function (response) {
        membershipInfo = {
            membershipType: response.data.Response.destinyMemberships[0].membershipType,
            membershipId: response.data.Response.destinyMemberships[0].membershipId
        }
    })
    .catch(function (error) {
        console.log(error)
    })

    return membershipInfo;
}

api.getManifest = function () {
    instance.get('/Destiny2/Manifest/')
    .then(function(response) {
        manifest_path = response.data.Response.jsonWorldContentPaths.en
        manifest_url = `http://www.bungie.net${manifest_path}`
        instance.get(manifest_url)
        .then(function(response) {
            api.manifest = response.data;
            console.log("manifest acquired")
        })
        .catch(function(error) {
            console.log(error)
        })
    })
    .catch(function(error) {
        console.log(error);
    });
}

module.exports = api;