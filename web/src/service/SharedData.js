import FairOS from "@fairdatasociety/fairos-js";
import WebCache from "./WebCache";

export const REGISTRY_KV_NAME = 'registry';
export const REGISTRY_KV_KEY_NAME = 'info';
export const MAPS_DATA_POD = 'FairMaps';
export const MAPS_DATA_KV = 'settings';
export const MAPS_DATA_KV_TABLE_POINTS = 'points';

let fairOSInstance = null;
let webCacheInstance = null;

export function getFairOSInstance() {
    let config = window._env.loaded ? window._env : process.env;
    if (!fairOSInstance) {
        console.log('Using window._env for fairOSInstance - ', window._env.loaded);
        fairOSInstance = new FairOS(config.REACT_APP_FAIROSHOST);
    }

    return fairOSInstance;
}


export function getWebCacheInstance() {
    let config = window._env.loaded ? window._env : process.env;
    if (!webCacheInstance) {
        webCacheInstance = new WebCache(config.REACT_APP_WEB_CACHE_URL);
    }

    return webCacheInstance;
}
