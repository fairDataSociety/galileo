const fs = require('fs');
const FairOS = require('../FairOSNode');

const fairOS = new FairOS();
const configPath = './.config.json';
if (!fs.existsSync(configPath)) {
    console.log('Config file not found. Create it and start again');
    return;
}

const config = JSON.parse(fs.readFileSync(configPath));
const {username, password} = config;
if (!username || !password) {
    console.log('Can\'t find username and password in config file');
    return;
}

function uuid() {
    return 'xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

async function run() {
    const result = await fairOS.login(username, password);
    console.log(result);
    const id = uuid();
    const podName = `map-registry-${id}`;
    const created = await fairOS.podNew(podName, password);
    console.log(created);
    const ls = await fairOS.podLs();
    console.log(ls);
    config.pod = podName;
    const share = await fairOS.podShare(podName, password);
    console.log(share);
    console.log(`Pod "${podName}" created and added to config. Your sharing reference: ${share.pod_sharing_reference}`);
    config.share_reference = share.pod_sharing_reference;
    fs.writeFileSync(configPath, JSON.stringify(config, null, '\t'));

}

run().then(data => {

});
