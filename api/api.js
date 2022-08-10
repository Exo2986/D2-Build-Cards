var axios = require('axios').default;
var extract = require('extract-zip')
var path = require('path')
var manifest = require('./manifest.js')
var fs = require('fs')
const winston = require('winston')
const logger = winston.child({service: 'api'})

var api = {}

api.manifestInfo = {
    fileName: '',
    lastChecked: 0
}

const instance = axios.create({
    baseURL: process.env.d2_api_base_url,
    headers: {
        'X-Api-Key': process.env.d2_api_key
    }
})

api.refreshAccessToken = async function (refreshToken) {
    var returnInfo = {};
    await axios({
        method: 'post',
        url: process.env.d2_token_base_url,
        data: `grant_type=refresh_token&refresh_token=${refreshToken}`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${process.env.d2_client_id}:${process.env.d2_client_secret}`).toString('base64')}`
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
        logger.error(error)
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

        logger.info({
            message: 'Retrieved membership info',
            ...membershipInfo
        })
    })
    .catch(function (error) {
        logger.error(error)
    })

    return membershipInfo;
}

api.getManifest = function () {
    return new Promise(async (fulfill, reject) => {
        instance.get('/Destiny2/Manifest/')
        .then(function(response) {
            var manifestPath = response.data.Response.mobileWorldContentPaths.en
            var manifestUrl = `http://www.bungie.net${manifestPath}`

            var shouldUpdate = shouldManifestUpdate(manifestPath)

            if (!shouldUpdate) {
                logger.info('Manifest %s does not need to be updated. (%s)', api.manifestInfo.fileName, manifestPath)
                fulfill(false)
                return
            }

            manifest.closeDatabaseConnection()
            
            var success = deleteOldManifest()
            if (!success) return

            instance.get(manifestUrl, {responseType: 'stream'})
            .then(function(response) {
                downloadManifest(response)
                .then(() => {
                    unzipManifest()
                    .then(() => {
                        renameManifestDatabase()
                        updateManifestInfoFile(manifestPath)

                        logger.info('Successfully acquired manifest from %s', manifestUrl)
                        fulfill(true)
                    })
                    .catch((err) => {
                        logger.error(err)
                        reject(err)
                    })
                })
            })
            .catch(function(error) {
                logger.error(error)
                reject(error)
            })
        })
        .catch(function(error) {
            logger.error(error)
            reject(error)
        })
    })
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
            reject(err)
        }
    })
}

var manifestPath = path.resolve('./manifest');

//if the downloaded file name has changed then the manifest has been updated
function shouldManifestUpdate(remoteManifestPath) {
    if (!fs.existsSync(path.join(manifestPath, 'manifest.db'))) //if the database is missing then we should update
        return true

    const manifestInfo = readManifestInfo()

    if (manifestInfo) {
        api.manifestInfo = manifestInfo

        return manifestInfo.fileName != remoteManifestPath
    }
    return true
}

function renameManifestDatabase() {
    var files = fs.readdirSync(manifestPath)
    var fileName = ''

    files.forEach(file => {
        fileName = file
        fs.renameSync(
            path.join(manifestPath, file),
            path.join(manifestPath, 'manifest.db'),
            err => logger.error(err)
        )
    })
}

function readManifestInfo() {
    var manifestInfoPath = path.join(manifestPath, 'manifest_info.json')

    if (fs.existsSync(manifestInfoPath)) {
        const fileData = fs.readFileSync(manifestInfoPath, {encoding:'utf8', flag:'r'})
        const jsonFileData = JSON.parse(fileData)
        logger.info({
            message: 'Read manifest_info.json',
            ...jsonFileData
        })
        return jsonFileData

    } else {
        return false
    }
}

function updateManifestInfoFile(fileName) {
    api.manifestInfo = {
        fileName: fileName,
        lastChecked: Date.now()
    }
    fs.writeFile(path.join(manifestPath, 'manifest_info.json'), JSON.stringify(api.manifestInfo), (err) => logger.error(err))
}



function deleteOldManifest() {
    var manifestPath = path.resolve('./manifest');
    try {
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
    } catch (err) {
        logger.error(err)
        return false
    }

    return true
}

module.exports = api;