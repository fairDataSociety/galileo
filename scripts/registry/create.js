import fs from "fs";
import FairOS from "@fairdatasociety/fairos-js";

// todo move url to the config
// const fairOS = new FairOS('https://fairos.fairdatasociety.org/v1/');
const fairOS = new FairOS('https://fairos-mainnet.fairdatasociety.org/v1/');
const configPath = './.config.json';
if (!fs.existsSync(configPath)) {
    console.log('Config file not found. Create it and start again');
    process.exit();
}

const config = JSON.parse(fs.readFileSync(configPath));
const {username, password} = config;
if (!username || !password) {
    console.log('Can\'t find username and password in config file');
    process.exit();
}

function uuid() {
    return 'xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

async function run() {
    const result = (await fairOS.userLogin(username, password)).data;
    console.log(result);
    const id = uuid();
    const podName = `map-registry-${id}`;
    const created = (await fairOS.podNew(podName, password)).data;
    console.log(created);
    const ls = (await fairOS.podLs()).data;
    console.log(ls);
    config.pod = podName;
    const share = (await fairOS.podShare(podName, password)).data;
    console.log(share);
    console.log(`Pod "${podName}" created and added to config. Your sharing reference:`);
    console.log(share.pod_sharing_reference);
    config.share_reference = share.pod_sharing_reference;
    fs.writeFileSync(configPath, JSON.stringify(config, null, '\t'));
}

run().then();
