require('dotenv').config();
const FairOS = require('@fairdatasociety/fairos-js');

const kvName = 'registry';
const keyName = 'info';

const fairOsHost = process.env.FAIROSHOST;
const registryReference = process.env.REGISTRY_REFERENCE;
const userLogin = process.env.USER_LOGIN;
const userPassword = process.env.USER_PASSWORD;

if (!(registryReference && userLogin && userPassword)) {
    throw new Error('Empty params');
}

async function run() {
    const fairos = new FairOS(fairOsHost)
// todo auth to any account, add and sync registry reference
// todo add all maps from the registry
// todo download all data from that maps
    let data = (await fairos.userLogin(userLogin, userPassword)).data;
    console.log(data);
    data = (await fairos.podLs()).data;
    console.log(data);
    try {
        data = (await fairos.podReceive(registryReference)).data;
        console.log(data);
    } catch (e) {
        console.log(e.response.data);
    }

    // todo open open
    // todo open kv
    // todo get data from kv
    const registryItems = [];
    for (let registryItem in registryItems) {
        const {reference} = registryItem;
        // todo add reference
        // todo sync reference
        // todo download data from the reference KV
    }
}

run().then();
