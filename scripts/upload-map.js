const FairOS = require('@fairdatasociety/fairos-js');
const {FormData, Blob} = require('formdata-node');
const globby = require("globby");
const fs = require("fs");
require('dotenv').config()

const fairOSUrl = process.env.FAIROS_URL;
const username = process.env.FAIROS_USERNAME;
const password = process.env.FAIROS_PASSWORD;
const pod = process.env.FAIROS_POD;
const mapKv = process.env.FAIROS_MAP_KV;
const mapPath = process.env.MAP_PATH;
const command = process.argv[2];

const NOT_UPLOADED_IDS_PATH = './not_uploaded_ids.txt';
let retryUpload = [];
if (fs.existsSync(NOT_UPLOADED_IDS_PATH)) {
    if (!command) {
        console.log('Not uploaded ids list found but command not specified.\r\nPass "retry" or "skip". \r\n"retry" will upload not uploaded ids\r\n"skip" will skip not uploaded ids');
        return;
    } else if (command === 'retry') {
        retryUpload = JSON.parse(fs.readFileSync(NOT_UPLOADED_IDS_PATH, {encoding: 'utf8', flag: 'r'}));
    }

}

console.log(`Hello! Username: ${username}, pod: ${pod}, map kv: ${mapKv}, url: ${fairOSUrl}, mode: ${command}`);

if (!(username && password && pod && mapKv)) {
    console.log('Incorrect input data. Create .env file and fill all info');
    return;
}

const fairos = new FairOS(fairOSUrl);

function removeFileName(file) {
    return file.substring(0, file.lastIndexOf('/'));
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function createMapIndex(path) {
    return globby.sync([`${path}**/*.json`])
        .map(item => {
            const short = item.replace(path, '');
            return {
                key: replaceAll(short.replace('.json', ''), '/', '_'),
                short,
                full: item
            };
        })
        .filter(item => item.key.split('_').length === 3);
}

function makeIndexJson(files) {
    let index = {};
    files.forEach(item => {
        let [z, x, y] = item.short.replace('.json', '').split('/');
        if (!index[z]) {
            index[z] = {};
        }

        if (!index[z][x]) {
            index[z][x] = {};
        }

        if (!index[z][x][y]) {
            index[z][x][y] = 1;
        }
    });

    return index;
}

const mapIndex = createMapIndex(mapPath);
console.log(`Found ${mapIndex.length} map keys`);

async function run() {
    function logError(e, reason = '') {
        const message = e?.response?.data?.message;

        console.log(reason ? `Error on ${reason}:` : 'Error:', message);
    }

    async function forceReloginBug(username, password, pod, mapKv) {
        await fairos.userLogin(username, password);
        console.log('Opening pod...');
        await fairos.podOpen(pod, password);
        console.log('Opening key-value...');
        await fairos.kvOpen(pod, mapKv);
    }

    try {
        console.log('Connecting to FairOS...');
        const data = await fairos.userPresent('.');
        if (!data.present) {
            console.log('FairOS connected');
        } else {
            throw new Error('Can\'t connect');
        }
    } catch (e) {
        console.log('Can\'t connect to FairOS. Check url and internet connection', e);
        return;
    }

    // let data;
    let isLogged = false;
    try {
        console.log('Login...')
        isLogged = !!(await fairos.userLogin(username, password));
    } catch (e) {
        logError(e, 'login');
    }

    if (!isLogged) {
        try {
            console.log('Signup...');
            await fairos.userSignup(username, password)
        } catch (e) {
            logError(e, 'signup');
            return;
        }

    }

    try {
        // create new pod or just ignore if pod already exists
        await fairos.podNew(pod, password);
    } catch (e) {

    }

    // relogin due to fairos bug
    await fairos.userLogin(username, password);
    console.log('Opening pod...');
    await fairos.podOpen(pod, password);
    try {
        await fairos.kvNew(pod, mapKv);
    } catch (e) {

    }

    console.log('Opening key-value...');
    await fairos.kvOpen(pod, mapKv);

    const notUploadedKeys = [];
    let isUploaded = false;
    if (command !== 'ref') {
        for (let i = 0; i < mapIndex.length; i++) {
            isUploaded = false;
            const indexItem = mapIndex[i];
            const key = indexItem.key;
            if (command === 'retry') {
                if (!retryUpload.includes(key)) {
                    continue;
                }
            }

            console.log(`[${(new Date()).toLocaleTimeString()}] Uploading ${i + 1}/${mapIndex.length} - ${key}...`);
            try {
                const content = fs.readFileSync(indexItem.full, 'utf-8');
                let data = (await fairos.kvEntryPut(pod, mapKv, key, content)).data;
                isUploaded = data.code === 200 && data.message.indexOf('key added') > -1;
            } catch (e) {

            }

            console.log('isUploaded', isUploaded);
            if (!isUploaded) {
                notUploadedKeys.push(key);
                fs.writeFileSync(NOT_UPLOADED_IDS_PATH, JSON.stringify(notUploadedKeys));
                // todo cool down and try again
            }

            // force relogin after some time
            if (i % 50 === 0) {
                try {
                    await forceReloginBug(username, password, pod, mapKv);
                } catch (e) {

                }
            }
        }

        console.log('Set map index...');
        isUploaded = false;
        const jsonIndex = JSON.stringify(makeIndexJson(mapIndex));
        try {
            isUploaded = false;
            let data = (await fairos.kvEntryPut(pod, mapKv, 'map_index', jsonIndex)).data;
            isUploaded = data.code === 200 && data.message.indexOf('key added') > -1;
        } catch (e) {

        }

        console.log(`Index upload status`, isUploaded);
        console.log(`Uploaded with error: ${notUploadedKeys.length}, successfully: ${mapIndex.length - notUploadedKeys.length}`);
    }

    try {
        await forceReloginBug(username, password, pod, mapKv);
        const sharedInfo = await fairos.podShare(pod, password);
        console.log('Map reference', sharedInfo.data.pod_sharing_reference);
    } catch (e) {
        logError(e, 'map reference');
    }
}

run().then();
