import fs from "fs";
import tempy from 'tempy';
import globby from "globby";
import {Blob, FormData} from 'formdata-node';
import {fileFromPath} from 'formdata-node/file-from-path';
import FairOS from '@fairdatasociety/fairos-js';
import dotenv from 'dotenv';

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

console.log(`Hello! Username: ${username}, pod: ${pod}, map kv: ${mapKv}, url: ${fairOSUrl}, mode: ${command}`);

if (!(username && password && pod && mapKv)) {
    console.log('Incorrect input data. Create .env file and fill all info');
    process.exit();
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

    const tempCsvFile = commandParam ? commandParam : tempy.file({extension: 'csv'});

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

    const isCreateCsv = (!command) || command === 'createcsv';
    const isUploadCsv = (!command) || command === 'uploadcsv';
    const isSharePod = (!command) || command === 'ref';

    // if (isUploadCsv && !commandParam) {
    //     console.log('For upload csv file - pass file name');
    //     process.exit();
    // }

    if (isCreateCsv) {
        fs.appendFileSync(tempCsvFile, `Key,Value\r\n`)
        for (const [index, file] of mapIndex.entries()) {
            console.log(`File ${index + 1}/${mapIndex.length} adding to csv...`);
            const key = replaceAll(file.short.replace('.json', ''), '/', '_');
            let value = replaceAll(fs.readFileSync(file.full, {encoding: 'utf8', flag: 'r'}), '"', '""');
            fs.appendFileSync(tempCsvFile, `${key},"${value}"\r\n`);
        }

        console.log('Adding index...');
        const index = JSON.stringify(makeIndexJson(mapIndex));
        let value = replaceAll(index, '"', '""');
        fs.appendFileSync(tempCsvFile, `map_index,"${value}"\r\n`);
    }

    if (isUploadCsv) {
        try {
            if (!fs.existsSync(tempCsvFile)) {
                console.log('Csv file not found');
                process.exit();
            }

            await forceReloginBug(username, password, pod, mapKv);
            const formData = new FormData();
            formData.set('csv', await fileFromPath(tempCsvFile));
            console.log('Uploading csv...');
            const data = await fairos.kvLoadCsv(pod, mapKv, formData, true);
            console.log('Csv uploading result', data.data.message);
        } catch (e) {
            // logError(e, 'uploading csv');
            console.log(e);
        }

        // todo unlink temp file

    }

    if (isSharePod) {
        try {
            await forceReloginBug(username, password, pod, mapKv);
            const sharedInfo = await fairos.podShare(pod, password);
            console.log('Map reference', sharedInfo.data.pod_sharing_reference);
        } catch (e) {
            logError(e, 'map reference');
        }
    }

    console.log(`Created temp csv: ${tempCsvFile}`);
}

run().then();
