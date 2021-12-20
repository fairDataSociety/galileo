import fs from "fs";
import tempy from 'tempy';
import globby from "globby";
import {Blob, FormData} from 'formdata-node';
import {fileFromPath} from 'formdata-node/file-from-path';
import FairOS from '@fairdatasociety/fairos-js';
import dotenv from 'dotenv';
import moment from 'moment';

dotenv.config();

const fairOSUrl = process.env.FAIROS_URL;
const username = process.env.FAIROS_USERNAME;
const password = process.env.FAIROS_PASSWORD;
const pod = process.env.FAIROS_POD;
const mapKv = process.env.FAIROS_MAP_KV;
const mapPath = process.env.MAP_PATH;
const command = process.argv[2];
const commandParam = process.argv[3];

const NOT_UPLOADED_IDS_PATH = './not_uploaded_ids.txt';
let retryUpload = [];
if (fs.existsSync(NOT_UPLOADED_IDS_PATH)) {
    if (!command) {
        console.log('Not uploaded ids list found but command not specified.\r\nPass "retry" or "skip". \r\n"retry" will upload not uploaded ids\r\n"skip" will skip not uploaded ids');
        process.exit();
    } else if (command === 'retry') {
        retryUpload = JSON.parse(fs.readFileSync(NOT_UPLOADED_IDS_PATH, {encoding: 'utf8', flag: 'r'}));
    }
}

if (!(username && password && pod && mapKv && mapPath)) {
    console.log('Incorrect input data. Create .env file and fill all info');
    process.exit();
}

console.log(`Hello! Username: ${username}, pod: ${pod}, map kv: ${mapKv}, url: ${fairOSUrl}, mode: ${command}`);
console.log('Map path', mapPath);

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

function log(message) {
    const time = moment.unix(Date.now() / 1000).format('YYYY-MM-DD HH:mm:ss');
    console.log(`[${time}]`, message)
}

function logError(e, reason = '') {
    const message = e?.response?.data?.message;

    console.log(reason ? `Error on ${reason}:` : 'Error:', message ?? e);
}

const mapIndex = createMapIndex(mapPath);
console.log(`Found ${mapIndex.length} map keys`);

async function runKvPut() {
    let data;
    let isLogged = false;
    try {
        log('Login...')
        isLogged = !!(await fairos.userLogin(username, password));
        log('Logged in!')
    } catch (e) {
        logError(e, 'login');
    }

    if (!isLogged) {
        try {
            log('Signup...');
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

    try {
        log('Opening pod...');
        data = (await fairos.podOpen(pod, password)).data;
        log(data);
    } catch (e) {
        logError(e, 'Open created pod')
    }

    try {
        data = (await fairos.kvNew(pod, mapKv)).data;
        log(data);
    } catch (e) {

    }

    log('Opening key-value...');
    try {
        data = (await fairos.kvOpen(pod, mapKv)).data;
        log(data);
    } catch (e) {
        logError(e);
    }

    for (const [index, file] of mapIndex.entries()) {
        // todo implement starting uploading process from specific position
        // if (index < 136) {
        //     continue;
        // }

        // todo relogin not every 20 iterations. just check error answer 'user not logged in'
        if (index % 20 === 0) {
            log('Relogin...')
            isLogged = !!(await fairos.userLogin(username, password));
            log('Logged in!')

            try {
                log('Opening pod...');
                data = (await fairos.podOpen(pod, password)).data;
                log(data);
            } catch (e) {
                logError(e, 'Open created pod')
            }

            log('Opening key-value...');
            try {
                data = (await fairos.kvOpen(pod, mapKv)).data;
                log(data);
            } catch (e) {
                logError(e);
            }
        }

        log(`File ${index + 1}/${mapIndex.length} adding to KV...`);
        const key = replaceAll(file.short.replace('.json', ''), '/', '_');
        log(key);
        let value = fs.readFileSync(file.full, {encoding: 'utf8', flag: 'r'});
        try {
            data = (await fairos.kvEntryPut(pod, mapKv, key, value)).data;
            log(data);
        } catch (e) {
            logError(e);
        }
    }

    log('Adding index...');
    const index = JSON.stringify(makeIndexJson(mapIndex));
    // let value = replaceAll(index, '"', '""');
    // fs.appendFileSync(tempCsvFile, `map_index,"${value}"\r\n`);
    try {
        data = (await fairos.kvEntryPut(pod, mapKv, 'map_index', index)).data;
        log(data);
    } catch (e) {
        logError(e);
    }

    log('Done!')
}

runKvPut().then();
