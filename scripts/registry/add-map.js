const fs = require('fs');
// todo migrate to fairos-js
const FairOS = require('../FairOSNode');

// node add-map.js "Test Map" map_switzerland_username map "46.947978, 7.440386" eebc7bf689f76c9889fc1fd3f6b1c448168b121493359871c13624a2459ab583775dee8b7665eb3ee90ebabbad21026622bc5334870809738610c86beb1c5532
const params = process.argv.slice(2);
const isClear = params[0] === 'clear';
if (isClear) {

} else {
    if (params[0] && params[1] && params[2] && params[3] && params[4]) {

    } else {
        console.log('Please, pass map title, pod, kv, coordinates and reference');
        return;
    }
}


const fairOS = new FairOS();
const configPath = './.config.json';
if (!fs.existsSync(configPath)) {
    console.log('Config file not found. Create it and start again');
    return;
}

const config = JSON.parse(fs.readFileSync(configPath));
const {username, password, pod} = config;
if (!username || !password || !pod) {
    console.log('Can\'t find username, password or pod in config file');
    return;
}

function getKvValue(data) {
    const values = data?.values;
    if (!values) {
        return [];
    }

    const result = JSON.parse(Buffer.from(values, 'base64').toString('utf8'));

    return Array.isArray(result) ? result : [];
}

async function run() {
    const kvName = 'registry';
    const keyName = 'info';

    const login = await fairOS.login(username, password);
    console.log(login);
    const podOpen = await fairOS.podOpen(pod, password);
    console.log(podOpen);
    // todo why new?
    const kv = await fairOS.kvNew(pod, kvName);
    console.log(kv);
    const open = await fairOS.kvOpen(pod, kvName);
    console.log(open);
    let list = [];
    if (!isClear) {
        const kvGet = await fairOS.kvGet(pod, kvName, keyName);
        console.log(kvGet);
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

    const put = await fairOS.kvPut(pod, kvName, keyName, JSON.stringify(list));
    console.log(put);

}

run().then();
