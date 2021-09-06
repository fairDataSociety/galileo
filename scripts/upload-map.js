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

console.log(`Init. Username: ${username}, pod: ${pod}, map kv: ${mapKv}`);

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

const mapIndex = createMapIndex(mapPath);
console.log(`Found ${mapIndex.length} map keys`);

async function run() {
    function logError(e, reason = '') {
        const message = e?.response?.data?.message;

        console.log(reason ? `Error on ${reason}:` : 'Error:', message);
    }

    function createCsvContent(key, file) {
        let value = replaceAll(fs.readFileSync(file, {encoding: 'utf8', flag: 'r'}), '"', '""');

        return `Key,Value\r\n${key},\"${value}\"`;
    }

    // let data;
    let isLogged = false;
    try {
        isLogged = !!(await fairos.userLogin(username, password));
    } catch (e) {
        // logError(e);
    }

    if (!isLogged) {
        try {
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
    await fairos.podOpen(pod, password);
    try {
        await fairos.kvNew(pod, mapKv);
    } catch (e) {

    }

    await fairos.kvOpen(pod, mapKv);

    for (let i = 0; i < mapIndex.length; i++) {
        const indexItem = mapIndex[i];
        const key = indexItem.key;
        console.log(`Uploading ${i + 1}/${mapIndex.length} - ${key}...`);

        const formData = new FormData();
        const blob = new Blob([createCsvContent(key, indexItem.full)], {type: "text/plain"})
        formData.set('csv', blob);
        let data = (await fairos.kvLoadCsv(pod, mapKv, formData)).data;
        if (data.code !== 200) {
            throw new Error("CSV not uploaded");
        }

        const isUploaded = data.message.indexOf('success: 1,') > -1;
        console.log('isUploaded', isUploaded);

        try {
            data = (await fairos.kvEntryGet(pod, mapKv, key)).data;
            console.log('Kv get data', data);
        } catch (e) {
            logError(e);
        }

        return;
    }
}

run().then();
