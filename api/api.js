var axios = require('axios').default;
var config = require('./config.js');
var extract = require('extract-zip')
var path = require('path')
var manifest = require('./manifest.js')
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
    deleteOldManifest()

    instance.get('/Destiny2/Manifest/')
    .then(function(response) {
        manifest_path = response.data.Response.mobileWorldContentPaths.en
        manifest_url = `http://www.bungie.net${manifest_path}`
        instance.get(manifest_url, {responseType: 'stream'})
        .then(function(response) {
            downloadManifest(response)
            .then(() => {
                unzipManifest()
                .then(() => {
                    renameManifestDatabase()

                    manifest.openDatabaseConnection()
                    
                    api.manifest = true
                    console.log('manifest acquired')
                })
            })
        })
        .catch(function(error) {
            console.log(error)
        })
    })
    .catch(function(error) {
        console.log(error);
    });
}

async function downloadManifest(response) {
    return new Promise((fulfill, reject) => {
        var writeStream = fs.createWriteStream('./manifest.zip');

        response.data.pipe(writeStream)
        
        writeStream.on('finish', fulfill)
        writeStream.on('error', reject)
    })
}

async function unzipManifest() {
    return new Promise(async (fulfill, reject) => {
        var zipPath = path.resolve('./manifest.zip')

        try {
            await extract(zipPath, {
                dir: path.resolve('./manifest')
            })

            fs.unlinkSync(zipPath)

            fulfill()
        } catch(err) {
            console.log(err)
        }

        reject()
    })
}

function renameManifestDatabase() {
    var manifestPath = path.resolve('./manifest');
    var files = fs.readdirSync(manifestPath)

    files.forEach(file => fs.renameSync(
        manifestPath + `/${file}`,
        manifestPath + '/manifest.db',
        err => console.log(err)
    ))
}

function deleteOldManifest() {
    var manifestPath = path.resolve('./manifest');
    fs.access(manifestPath, (err) => {
        if (!err) {
            var files = fs.readdirSync(manifestPath)

            files.forEach(file => {
                if (file.endsWith('.db') || file.endsWith('.content')) {
                    fs.unlinkSync(manifestPath + `/${file}`)
                }
            })
        }
    })
}

module.exports = api;