import fs from "fs";
import FairOS from "@fairdatasociety/fairos-js";

// node add-map.js "Test Map" map_switzerland_username map "46.947978, 7.440386" eebc7bf689f76c9889fc1fd3f6b1c448168b121493359871c13624a2459ab583775dee8b7665eb3ee90ebabbad21026622bc5334870809738610c86beb1c5532
const params = process.argv.slice(2);
const isClear = params[0] === 'clear';
if (isClear) {

} else {
    if (params[0] && params[1] && params[2] && params[3] && params[4]) {

    } else {
        console.log('Please, pass map title, pod, kv, coordinates and reference');
        process.exit();
    }
}

// todo move url to the config
const fairOS = new FairOS('https://fairos-mainnet.fairdatasociety.org/v1/');
const configPath = './.config.json';
if (!fs.existsSync(configPath)) {
    console.log('Config file not found. Create it and start again');
    process.exit();
}

const config = JSON.parse(fs.readFileSync(configPath));
const {username, password, pod} = config;
if (!username || !password || !pod) {
    console.log('Can\'t find username, password or pod in config file');
    process.exit();
}

function getKvValue(data) {
    const values = data?.values;
    if (!values) {
        return [];
    }

    const result = JSON.parse(Buffer.from(values, 'base64').toString('utf8'));

    return Array.isArray(result) ? result : [];
}

function logError(e, reason = '') {
    const message = e?.response?.data?.message;

    console.log(reason ? `Error on ${reason}:` : 'Error:', message ?? e);
}

async function run() {
    const kvName = 'registry';
    const keyName = 'info';

    const login = (await fairOS.userLogin(username, password)).data;
    console.log(login);
    const podOpen = (await fairOS.podOpen(pod, password)).data;
    console.log(podOpen);
    try {
        const kv = (await fairOS.kvNew(pod, kvName)).data;
        console.log(kv);
    } catch (e) {
        logError(e)
    }

    try {
        const open = (await fairOS.kvOpen(pod, kvName)).data;
        console.log(open);
    } catch (e) {
        logError(e)
    }

    let list = [];
    if (!isClear) {
        let kvGet;
        try {
            kvGet = (await fairOS.kvEntryGet(pod, kvName, keyName)).data;
            console.log(kvGet);
        } catch (e) {
            logError(e);
        }

        list = getKvValue(kvGet);
        console.log(list);
        list.push(
            {
                title: params[0],
                pod: params[1],
                kv: params[2],
                coordinates: params[3].split(',').map(item => item.trim()),
                reference: params[4]
            }
        );
    }

    const put = (await fairOS.kvEntryPut(pod, kvName, keyName, JSON.stringify(list))).data;
    console.log(put);
}

run().then();
